export const FEACO_ACTORS_WORKBOOK = "1tzQVTioloQfbWjpcQzK5utLJLs5l3lUuO0z6s4x7FT8"
export const FEACO_REFERENCES_WORKBOOK = "1Kk1Vlr8QeJh-EkKh1pc7ZdxKqc3sOCwG_qzL2N8ZxR4"

export class AthleteReadError extends Error {
  status: number
  constructor(message: string, status = 503) { super(message); this.status = status }
}

/** Explicit public projection. No national identifier or raw Sheet row crosses this boundary. */
export type AthleteReadRecord = {
  id: string; idAthlete: string; idWa: string; nomComplet: string
  idSexe: string; sexe: string; genre: string
  dateDeNaissance: string; dateNaissance: string; lieuNaissance: string
  nationalite: string; telephone: string; email: string; adresse: string
  observations: string; statut: string; avatarDriveId: string; avatarDriveUrl: string
}
export type AthleteReadSnapshot = { athletes: AthleteReadRecord[]; source: "FEACO_ATHLETES" }

export function athleteReadConfiguration(values: Record<string, string | undefined>) {
  const required = (key: string) => {
    const value = values[key]?.trim()
    if (!value) throw new AthleteReadError("Configuration manquante : " + key + ".")
    return value
  }
  const actors = required("FEACO_ACTEURS_SPREADSHEET_ID")
  const references = required("FEACO_REFERENTIELS_SPREADSHEET_ID")
  if (actors !== FEACO_ACTORS_WORKBOOK || references !== FEACO_REFERENCES_WORKBOOK) {
    throw new AthleteReadError("Les classeurs configurés ne correspondent pas aux ressources FEACO validées.")
  }
  return { actors, references, email: required("GOOGLE_CLIENT_EMAIL"), key: required("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n") }
}

type Cells = unknown[][]
const text = (value: unknown) => String(value ?? "").trim()
function sheetRows(values: Cells, required: string[]) {
  if (!values.length) return []
  const headers = values[0].map(value => text(value).toLowerCase())
  if (required.some(key => !headers.includes(key))) throw new AthleteReadError("En-têtes de la feuille FEACO incomplets ou incompatibles.")
  return values.slice(1).filter(row => row.some(value => text(value))).map(row =>
    Object.fromEntries(headers.map((key, index) => [key, text(row[index])])) as Record<string, string>)
}

export function projectAthleteRows(values: Cells, sexes: Cells): AthleteReadRecord[] {
  const names = new Map(sheetRows(sexes, ["id_sexe", "nom_sexe"]).map(row => [row.id_sexe, row.nom_sexe]))
  const ids = new Set<string>()
  return sheetRows(values, ["id_athlete", "nom_complet"]).map(row => {
    const id = row.id_athlete
    if (!id || ids.has(id)) throw new AthleteReadError("La feuille ATHLETES contient un identifiant fédéral absent ou dupliqué.")
    ids.add(id)
    const birth = row.date_naissance || row.date_de_naissance || ""
    const sex = names.get(row.id_sexe) || row.nom_sexe || row.sexe || row.id_sexe || ""
    const rawStatus = row.statut || row.staut || ""
    const status = ({ active: "actif", inactive: "inactif", "blessé": "blesse" } as Record<string, string>)[rawStatus.toLowerCase()] || rawStatus.toLowerCase()
    return {
      id, idAthlete: id, idWa: row.id_wa || "", nomComplet: row.nom_complet,
      idSexe: row.id_sexe || "", sexe: sex, genre: sex,
      dateDeNaissance: birth, dateNaissance: birth,
      lieuNaissance: row.lieu_naissance || row.lieu_de_naissance || "",
      nationalite: row.nationalite || "", telephone: row.telephone || "", email: row.email || "",
      adresse: row.adresse || "", observations: row.observations || "", statut: status,
      // Media connections remain outside this read-only lot.
      avatarDriveId: "", avatarDriveUrl: "",
    }
  })
}

export async function loadAthleteReadSnapshot(read: () => Promise<{ athletes: Cells; sexes: Cells }>): Promise<AthleteReadSnapshot> {
  try {
    const values = await read()
    return { athletes: projectAthleteRows(values.athletes, values.sexes), source: "FEACO_ATHLETES" }
  } catch (error) {
    if (error instanceof AthleteReadError) throw error
    // Never propagate SDK errors: they can include credentials, URLs and private rows.
    throw new AthleteReadError("Lecture Google Sheets impossible. Vérifiez l’accès du compte de service aux classeurs FEACO et réessayez.")
  }
}
