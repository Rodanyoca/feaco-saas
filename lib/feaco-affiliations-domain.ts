// @ts-expect-error Node's native test runner requires the explicit extension.
import { formatDateForSheet } from './compact-date.ts'

export const affiliationKinds = ['athlete', 'coach', 'medecin'] as const
export type AffiliationKind = typeof affiliationKinds[number]
export const affiliationSchema = {
  athlete: { sheet: 'ATHLETE_AFFILIATIONS', key: 'id_affiliation_athlete', actor: 'id_athlete', actorSheet: 'ATHLETES' },
  coach: { sheet: 'COACH_AFFILIATIONS', key: 'id_affiliation_coach', actor: 'id_coach', actorSheet: 'COACHS' },
  medecin: { sheet: 'MEDECIN_AFFILIATIONS', key: 'id_affiliation_medecin', actor: 'id_medecin', actorSheet: 'MEDECINS' },
} as const
export type Row = Record<string, string>
export type AffiliationSnapshot = {
  affiliations: Record<AffiliationKind, Row[]>; actors: Record<AffiliationKind, Row[]>
  clubs: Row[]; ententes: Row[]; ligues: Row[]; seasons: Row[]; statuses: Row[]
}
export class AffiliationError extends Error {
  status: number
  constructor(message: string, status = 400) { super(message); this.status = status }
}
export function rows(values: unknown[][], required: string[]): Row[] {
  const headers = (values[0] ?? []).map(String)
  if (required.some(key => !headers.includes(key))) throw new AffiliationError('En-têtes FEACO absents ou incompatibles.', 503)
  return values.slice(1).filter(row => row.some(value => String(value ?? '').trim())).map(row => Object.fromEntries(headers.map((key, i) => [key, String(row[i] ?? '').trim()])))
}
export function headers(kind: AffiliationKind) {
  const schema = affiliationSchema[kind]
  return [schema.key, 'id_saison', schema.actor, 'id_club', 'date_debut', 'date_fin', 'id_statut_affiliation', 'observations']
}
export function publicHistory(data: AffiliationSnapshot, kind: AffiliationKind, actorId: string) {
  const schema = affiliationSchema[kind]
  if (data.actors[kind].filter(row => row[schema.actor] === actorId).length !== 1) throw new AffiliationError('Acteur FEACO introuvable.', 404)
  const clubs = data.clubs.map(club => {
    const entente = data.ententes.find(row => row.id_entente === club.id_entente)
    const ligue = data.ligues.find(row => row.id_ligue === entente?.id_ligue)
    return { id: club.id_club, label: club.nom_club || club.id_club, status: club.statut || '', entente: entente?.nom_entente || club.id_entente || '', ligue: ligue?.nom_ligue || entente?.id_ligue || '', anomaly: !entente || !ligue || Boolean(club.id_ligue && club.id_ligue !== entente.id_ligue) }
  })
  return {
    items: data.affiliations[kind].filter(row => row[schema.actor] === actorId).map(row => ({ id: row[schema.key], actorId, clubId: row.id_club, seasonId: row.id_saison, dateDebut: row.date_debut, dateFin: row.date_fin, statusId: row.id_statut_affiliation, observations: row.observations })),
    clubs, seasons: data.seasons.map(row => ({ id: row.id_saison, label: row.nom_saison || row.id_saison })),
    statuses: data.statuses.map(row => ({ id: row.id_statut_affiliation, label: row.nom_statut_affiliation || row.libelle_statut_affiliation || row.nom_statut || row.id_statut_affiliation })),
  }
}
export type AffiliationHistory = ReturnType<typeof publicHistory>
export type AffiliationItem = AffiliationHistory['items'][number]
export function prepareAffiliation(data: AffiliationSnapshot, kind: AffiliationKind, input: Record<string, unknown>, action: 'create' | 'update' | 'terminate', newId: string) {
  const schema = affiliationSchema[kind]
  const text = (key: string) => typeof input[key] === 'string' ? input[key].trim() : ''
  const actorId = text('actorId')
  publicHistory(data, kind, actorId)
  const matches = data.affiliations[kind].filter(row => row[schema.key] === text('id'))
  const existing = action === 'create' ? undefined : matches[0]
  if (action !== 'create' && (matches.length !== 1 || existing?.[schema.actor] !== actorId)) throw new AffiliationError('Affiliation introuvable ou non unique pour cet acteur.', 404)
  const row: Row = existing ? { ...existing } : { [schema.key]: newId, [schema.actor]: actorId }
  const date = (value: string) => {
    if (!value) return ''
    // Reject non-date text rather than accepting embedded digits.
    if (!/^(?:\d{8}|\d{1,2}[./-]\d{1,2}[./-]\d{4}|\d{4}-\d{1,2}-\d{1,2})$/.test(value)) throw new AffiliationError('Date invalide.')
    try { return formatDateForSheet(value) } catch { throw new AffiliationError('Date invalide.') }
  }
  if (action === 'terminate') {
    if (!data.statuses.some(row => row.id_statut_affiliation === 'SAF002')) throw new AffiliationError('Statut SAF002 absent du référentiel.', 503)
    row.date_fin = date(text('dateFin'))
    row.id_statut_affiliation = 'SAF002'
    if (!row.date_fin) throw new AffiliationError('La date de fin est obligatoire.')
  } else {
    row.id_club = text('clubId'); row.id_saison = text('seasonId'); row.id_statut_affiliation = text('statusId')
    row.date_debut = date(text('dateDebut')); row.date_fin = date(text('dateFin')); row.observations = text('observations')
    if (!data.clubs.some(club => club.id_club === row.id_club) && (!existing || existing.id_club !== row.id_club)) throw new AffiliationError('Sélectionnez un club FEACO existant.')
    if (!data.seasons.some(season => season.id_saison === row.id_saison)) throw new AffiliationError('Saison FEACO invalide.')
    if (!data.statuses.some(status => status.id_statut_affiliation === row.id_statut_affiliation)) throw new AffiliationError('Statut FEACO invalide.')
    if (!row.date_debut) throw new AffiliationError('La date de début est obligatoire.')
    if (row.id_statut_affiliation === 'SAF002' && !row.date_fin) throw new AffiliationError('Une affiliation terminée nécessite une date de fin.')
    if (row.id_statut_affiliation === 'SAF099' && !row.observations) throw new AffiliationError('Précisez les observations pour le statut AUTRE.')
    if (row.observations.length > 5000) throw new AffiliationError('Observations trop longues (5 000 caractères maximum).')
  }
  const start = date(row.date_debut || '')
  if (start && row.date_fin && row.date_fin < start) throw new AffiliationError('La date de fin précède la date de début.')
  return row
}
