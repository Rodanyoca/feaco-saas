import 'server-only'
import { randomUUID } from 'node:crypto'
import { affiliationKinds, affiliationSchema, AffiliationError, headers, prepareAffiliation, publicHistory, rows, type AffiliationKind, type AffiliationSnapshot } from '@/lib/feaco-affiliations-domain'

const books = {
  FEACO_AFFILIATIONS_SPREADSHEET_ID: '1Rn6H5V2_YHPgXJtHwlPRb2sA_WqMIHIZaXBbO8m0Uvs',
  FEACO_ACTEURS_SPREADSHEET_ID: '1tzQVTioloQfbWjpcQzK5utLJLs5l3lUuO0z6s4x7FT8',
  FEACO_REFERENTIELS_SPREADSHEET_ID: '1Kk1Vlr8QeJh-EkKh1pc7ZdxKqc3sOCwG_qzL2N8ZxR4',
  FEACO_STRUCTURE_TERRITORIALE_SPREADSHEET_ID: '17iHT1BgkkTubISlbDOsFSdVScEbO5ifWyjRLqpUgL3c',
} as const
async function client(write = false) {
  const required = (name: string) => { const value = process.env[name]?.trim(); if (!value) throw new AffiliationError(`Configuration manquante : ${name}.`, 503); return value }
  for (const [name, id] of Object.entries(books)) if (required(name) !== id) throw new AffiliationError('Les classeurs configurés ne correspondent pas aux ressources FEACO validées.', 503)
  const email = required('GOOGLE_CLIENT_EMAIL'), key = required('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n')
  const { google } = await import('googleapis')
  return google.sheets({ version: 'v4', auth: new google.auth.JWT({ email, key, scopes: [write ? 'https://www.googleapis.com/auth/spreadsheets' : 'https://www.googleapis.com/auth/spreadsheets.readonly'] }) })
}
let cached: { data: AffiliationSnapshot; until: number } | undefined
let pending: Promise<AffiliationSnapshot> | undefined
async function load(): Promise<AffiliationSnapshot> {
  try {
    const api = await client()
    const batch = async (id: string, ranges: string[]) => (await api.spreadsheets.values.batchGet({ spreadsheetId: id, ranges, valueRenderOption: 'FORMATTED_VALUE' }, { timeout: 15000 })).data.valueRanges ?? []
    const [affiliations, actors, refs, territory] = await Promise.all([
      batch(books.FEACO_AFFILIATIONS_SPREADSHEET_ID, affiliationKinds.map(kind => `${affiliationSchema[kind].sheet}!A:H`)),
      // Only technical ID, international ID and display name. National IDs and identity documents are never requested.
      batch(books.FEACO_ACTEURS_SPREADSHEET_ID, affiliationKinds.flatMap(kind => [`${affiliationSchema[kind].actorSheet}!A:A`, `${affiliationSchema[kind].actorSheet}!C:D`])),
      batch(books.FEACO_REFERENTIELS_SPREADSHEET_ID, ['SAISON!A:C', 'STATUTS_AFFILIATION!A:C']),
      batch(books.FEACO_STRUCTURE_TERRITORIALE_SPREADSHEET_ID, ['CLUBS!A:K', 'ENTENTES!A:I', 'LIGUES!A:G']),
    ])
    const actorRows = (index: number, kind: AffiliationKind) => {
      const ids = actors[index * 2]?.values ?? [], names = actors[index * 2 + 1]?.values ?? []
      return rows(ids.map((row, i) => [...row, ...(names[i] ?? ['', ''])]), [affiliationSchema[kind].actor, 'id_wa', 'nom_complet'])
    }
    return {
      affiliations: Object.fromEntries(affiliationKinds.map((kind, i) => [kind, rows(affiliations[i]?.values ?? [], headers(kind))])) as AffiliationSnapshot['affiliations'],
      actors: Object.fromEntries(affiliationKinds.map((kind, i) => [kind, actorRows(i, kind)])) as AffiliationSnapshot['actors'],
      seasons: rows(refs[0]?.values ?? [], ['id_saison', 'nom_saison']), statuses: rows(refs[1]?.values ?? [], ['id_statut_affiliation']),
      clubs: rows(territory[0]?.values ?? [], ['id_club', 'nom_club', 'id_entente', 'id_ligue', 'statut']),
      ententes: rows(territory[1]?.values ?? [], ['id_entente', 'nom_entente', 'id_ligue']), ligues: rows(territory[2]?.values ?? [], ['id_ligue', 'nom_ligue']),
    }
  } catch (error) {
    if (error instanceof AffiliationError) throw error
    throw new AffiliationError('Lecture Google Sheets FEACO indisponible. Vérifiez la connexion et les droits du compte de service.', 503)
  }
}
export async function affiliationSnapshot(fresh = false) {
  if (fresh) return load()
  if (cached && cached.until > Date.now()) return cached.data
  pending ??= load().then(data => { cached = { data, until: Date.now() + 15000 }; return data }).finally(() => { pending = undefined })
  return pending
}
export async function affiliationHistory(kind: AffiliationKind, actorId: string) { return publicHistory(await affiliationSnapshot(), kind, actorId) }
// Serialize writes in this local-only process; no automatic transfer or closure of another row.
let queue = Promise.resolve()
export async function mutateAffiliation(kind: AffiliationKind, input: Record<string, unknown>, action: 'create' | 'update' | 'terminate') {
  const operation = queue.then(async () => {
    const data = await affiliationSnapshot(true)
    const record = prepareAffiliation(data, kind, input, action, `AFF-${randomUUID()}`)
    const schema = affiliationSchema[kind]
    try {
      const api = await client(true)
      const spreadsheetId = books.FEACO_AFFILIATIONS_SPREADSHEET_ID
      const values = (await api.spreadsheets.values.get({ spreadsheetId, range: `${schema.sheet}!A:Z`, valueRenderOption: 'FORMATTED_VALUE' }, { timeout: 15000 })).data.values ?? []
      rows(values, headers(kind))
      const keys = values[0].map(String), idIndex = keys.indexOf(schema.key)
      const matches = values.map((row, index) => ({ row, index })).slice(1).filter(({ row }) => String(row[idIndex] ?? '') === record[schema.key])
      if ((action === 'create' && matches.length) || (action !== 'create' && matches.length !== 1)) throw new AffiliationError('Affiliation non unique ou modifiée. Rechargez la fiche.', 409)
      if (action !== 'create') {
        const old = data.affiliations[kind].find(row => row[schema.key] === record[schema.key])!
        if (keys.some((key, i) => String(matches[0].row[i] ?? '') !== (old[key] ?? ''))) throw new AffiliationError('Cette affiliation a changé. Rechargez avant de corriger.', 409)
      }
      const cells = keys.map((key, i) => record[key] ?? String(matches[0]?.row[i] ?? ''))
      if (action === 'create') await api.spreadsheets.values.append({ spreadsheetId, range: `${schema.sheet}!A:Z`, valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS', requestBody: { values: [cells] } }, { timeout: 15000 })
      else await api.spreadsheets.values.update({ spreadsheetId, range: `${schema.sheet}!A${matches[0].index + 1}`, valueInputOption: 'RAW', requestBody: { values: [cells] } }, { timeout: 15000 })
      data.affiliations[kind] = action === 'create' ? [...data.affiliations[kind], record] : data.affiliations[kind].map(row => row[schema.key] === record[schema.key] ? record : row)
      return publicHistory(data, kind, String(input.actorId))
    } catch (error) {
      if (error instanceof AffiliationError) throw error
      throw new AffiliationError('Enregistrement non confirmé. Rechargez la fiche avant de réessayer.', 503)
    } finally { cached = undefined; pending = undefined }
  })
  queue = operation.then(() => undefined, () => undefined)
  return operation
}
