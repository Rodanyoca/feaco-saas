import { createRequire } from "node:module"
import { athleteReadConfiguration, AthleteReadError, loadAthleteReadSnapshot } from "../lib/athlete-read-domain.ts"
const require = createRequire(import.meta.url)
require("@next/env").loadEnvConfig(process.cwd())
try {
  const config = athleteReadConfiguration(process.env)
  const { google } = require("googleapis")
  const auth = new google.auth.JWT({ email: config.email, key: config.key, scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"] })
  const api = google.sheets({ version: "v4", auth })
  const options = { timeout: 15000 }
  const meta = await api.spreadsheets.get({ spreadsheetId: config.actors, fields: "properties.title,sheets.properties.title" }, options)
  if (meta.data.properties?.title !== "02_FEACO_ACTEURS" || !meta.data.sheets?.some(sheet => sheet.properties?.title === "ATHLETES")) throw new AthleteReadError("Ressource FEACO inattendue.")
  const snapshot = await loadAthleteReadSnapshot(async () => {
    const [athletes, sexes] = await Promise.all([
      api.spreadsheets.values.get({ spreadsheetId: config.actors, range: "ATHLETES!A:ZZ", valueRenderOption: "FORMATTED_VALUE" }, options),
      api.spreadsheets.values.get({ spreadsheetId: config.references, range: "SEXES!A:C", valueRenderOption: "FORMATTED_VALUE" }, options),
    ])
    return { athletes: athletes.data.values ?? [], sexes: sexes.data.values ?? [] }
  })
  console.log(JSON.stringify({ workbook: "02_FEACO_ACTEURS", sheet: "ATHLETES", source: snapshot.source, rows: snapshot.athletes.length, nationalIdentifierExposed: snapshot.athletes.some(row => Object.keys(row).some(key => /id.?national/i.test(key))) }))
} catch (error) {
  console.error(error instanceof AthleteReadError ? error.message : "Lecture FEACO indisponible ; aucun détail de configuration affiché.")
  process.exitCode = 1
}
