import "server-only"
import { athleteReadConfiguration, AthleteReadError, loadAthleteReadSnapshot } from "@/lib/athlete-read-domain"

/** Live FEACO reads only: no demo adapter, no fixture flag, no write scope. */
export async function getAthleteReadSnapshot() {
  return loadAthleteReadSnapshot(async () => {
    const config = athleteReadConfiguration(process.env)
    const { google } = await import("googleapis")
    const auth = new google.auth.JWT({ email: config.email, key: config.key, scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"] })
    const api = google.sheets({ version: "v4", auth })
    const options = { timeout: 15000 }
    const [actors, references] = await Promise.all([
      api.spreadsheets.get({ spreadsheetId: config.actors, fields: "properties.title,sheets.properties.title" }, options),
      api.spreadsheets.get({ spreadsheetId: config.references, fields: "properties.title,sheets.properties.title" }, options),
    ])
    if (actors.data.properties?.title !== "02_FEACO_ACTEURS" || !actors.data.sheets?.some(sheet => sheet.properties?.title === "ATHLETES") ||
        references.data.properties?.title !== "00_FEACO_REFERENTIEL" || !references.data.sheets?.some(sheet => sheet.properties?.title === "SEXES")) {
      throw new AthleteReadError("Les ressources Google Sheets ne correspondent pas à ATHLETES / 02_FEACO_ACTEURS et au référentiel FEACO attendus.")
    }
    const [athletes, sexes] = await Promise.all([
      api.spreadsheets.values.get({ spreadsheetId: config.actors, range: "ATHLETES!A:ZZ", valueRenderOption: "FORMATTED_VALUE" }, options),
      api.spreadsheets.values.get({ spreadsheetId: config.references, range: "SEXES!A:C", valueRenderOption: "FORMATTED_VALUE" }, options),
    ])
    return { athletes: athletes.data.values ?? [], sexes: sexes.data.values ?? [] }
  })
}
