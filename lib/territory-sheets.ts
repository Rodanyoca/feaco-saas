import "server-only"
import { createTerritoryService, sheetRows, territoryHeaders, territorySheets, idHeader, TerritoryError, type TerritoryKind, type TerritoryRow, type TerritorySnapshot } from "@/lib/territory-domain"

const expectedTerritory = "17iHT1BgkkTubISlbDOsFSdVScEbO5ifWyjRLqpUgL3c"
const expectedReferences = "1Kk1Vlr8QeJh-EkKh1pc7ZdxKqc3sOCwG_qzL2N8ZxR4"
function configuration() {
  const required = (name: string) => {
    const value = process.env[name]?.trim()
    if (!value) throw new TerritoryError(`Configuration manquante : ${name}.`, 503)
    return value
  }
  const territory = required("FEACO_STRUCTURE_TERRITORIALE_SPREADSHEET_ID")
  const references = required("FEACO_REFERENTIELS_SPREADSHEET_ID")
  if (territory !== expectedTerritory || references !== expectedReferences) throw new TerritoryError("Les classeurs configurés ne correspondent pas aux ressources FEACO validées.", 503)
  return { territory, references, email: required("GOOGLE_CLIENT_EMAIL"), key: required("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n") }
}
async function sheets(write = false) {
  const config = configuration()
  const { google } = await import("googleapis")
  const auth = new google.auth.JWT({ email: config.email, key: config.key, scopes: [write ? "https://www.googleapis.com/auth/spreadsheets" : "https://www.googleapis.com/auth/spreadsheets.readonly"] })
  return { api: google.sheets({ version: "v4", auth }), config }
}

let cached: { value: TerritorySnapshot; until: number } | undefined
let inflight: Promise<TerritorySnapshot> | undefined
const ranges = ["LIGUES!A:G", "ENTENTES!A:I", "CLUBS!A:K"]
async function load(): Promise<TerritorySnapshot> {
  try {
    const { api, config } = await sheets()
    const [territory, refs] = await Promise.all([
      api.spreadsheets.values.batchGet({ spreadsheetId: config.territory, ranges, valueRenderOption: "FORMATTED_VALUE" }, { timeout: 15000 }),
      api.spreadsheets.values.batchGet({ spreadsheetId: config.references, ranges: ["PROVINCES!A:B", "CATEGORIES_CLUB!A:C", "SEXES!A:C"], valueRenderOption: "FORMATTED_VALUE" }, { timeout: 15000 }),
    ])
    const t = territory.data.valueRanges ?? [], r = refs.data.valueRanges ?? []
    return {
      ligues: sheetRows(t[0]?.values ?? [], territoryHeaders.ligues),
      ententes: sheetRows(t[1]?.values ?? [], territoryHeaders.ententes),
      clubs: sheetRows(t[2]?.values ?? [], territoryHeaders.clubs),
      provinces: sheetRows(r[0]?.values ?? [], ["id_province", "nom_province"]),
      categories: sheetRows(r[1]?.values ?? [], ["id_categorie_club", "nom_categorie_club"]),
      sexes: sheetRows(r[2]?.values ?? [], ["id_sexe", "nom_sexe"]),
    }
  } catch (error) {
    if (error instanceof TerritoryError) throw error
    // Never forward Google client errors (they may contain credentials or request metadata).
    throw new TerritoryError("Lecture Google Sheets indisponible. Vérifiez les droits du compte de service sur les classeurs FEACO.", 503)
  }
}
async function read(fresh = false) {
  if (fresh) return load()
  if (cached && cached.until > Date.now()) return cached.value
  if (!inflight) inflight = load().then(value => { cached = { value, until: Date.now() + 15000 }; return value }).finally(() => { inflight = undefined })
  return inflight
}
async function save(kind: TerritoryKind, record: TerritoryRow, existingId?: string) {
  try {
    const { api, config } = await sheets(true)
    const sheet = territorySheets[kind]
    // Re-read exact headers and ID positions immediately before writing; preserve other cells.
    const response = await api.spreadsheets.values.get({ spreadsheetId: config.territory, range: ranges[["ligues", "ententes", "clubs"].indexOf(kind)], valueRenderOption: "FORMATTED_VALUE" }, { timeout: 15000 })
    const values = response.data.values ?? []
    sheetRows(values, territoryHeaders[kind])
    const headers = values[0].map(String)
    const index = headers.indexOf(idHeader(kind))
    const matches = values.map((row, i) => ({ row, i })).slice(1).filter(({ row }) => String(row[index] ?? "") === (existingId || record[idHeader(kind)]))
    if ((!existingId && matches.length) || (existingId && matches.length !== 1)) throw new TerritoryError("Identifiant déjà présent ou fiche non unique. Rechargez les données.", 409)
    const row = headers.map((key, i) => record[key] ?? (existingId ? String(matches[0].row[i] ?? "") : ""))
    if (existingId) {
      const rowNumber = matches[0].i + 1
      const lastColumn = String.fromCharCode(64 + headers.length)
      await api.spreadsheets.values.update({ spreadsheetId: config.territory, range: `${sheet}!A${rowNumber}:${lastColumn}${rowNumber}`, valueInputOption: "RAW", requestBody: { values: [row] } }, { timeout: 15000 })
    } else {
      await api.spreadsheets.values.append({ spreadsheetId: config.territory, range: `${sheet}!A:${String.fromCharCode(64 + headers.length)}`, valueInputOption: "RAW", insertDataOption: "INSERT_ROWS", requestBody: { values: [row] } }, { timeout: 15000 })
    }
  } catch (error) {
    if (error instanceof TerritoryError) throw error
    throw new TerritoryError("Enregistrement non confirmé. Rechargez la liste avant de réessayer ; vérifiez les droits Google Sheets.", 503)
  } finally { cached = undefined; inflight = undefined }
}

export const territoryFixtureMode = process.env.NODE_ENV === "development" && process.env.FEACO_TERRITORY_QA === "1" && process.env.FEACO_TERRITORY_TEST_FIXTURE === "1"
const fixtureGlobal = globalThis as typeof globalThis & { __feacoTerritoryFixture?: Promise<TerritorySnapshot> }
async function testData() {
  if (!territoryFixtureMode) throw new TerritoryError("Test adapter disabled.", 403)
  fixtureGlobal.__feacoTerritoryFixture ??= import("node:fs/promises").then(fs => fs.readFile(`${process.cwd()}/docs/territory-qa/fixture.json`, "utf8")).then(text => JSON.parse(text) as TerritorySnapshot)
  return fixtureGlobal.__feacoTerritoryFixture
}
export const territoryService = createTerritoryService(territoryFixtureMode ? {
  read: async () => structuredClone(await testData()),
  save: async (kind, row, id) => {
    const data = await testData()
    data[kind] = id ? data[kind].map(current => current[idHeader(kind)] === id ? { ...current, ...row } : current) : [...data[kind], row]
  },
} : { read, save })
