// @ts-expect-error Explicit extension for the Node TypeScript test runner.
import { formatDateForSheet } from "./compact-date.ts"

export type TerritoryKind = "ligues" | "ententes" | "clubs"
export type TerritoryRow = Record<string, string>
export const territorySheets = { ligues: "LIGUES", ententes: "ENTENTES", clubs: "CLUBS" } as const
export const territoryHeaders = {
  ligues: ["id_ligue", "nom_ligue", "pseudo_ligue", "email_ligue", "id_province", "statut", "observations"],
  ententes: ["id_entente", "code_entente", "nom_entente", "pseudo_entente", "id_ligue", "id_ville", "email_entente", "statut", "observations"],
  clubs: ["id_club", "nom_club", "id_categorie", "id_sexe", "date_affiliation", "id_ville", "id_entente", "id_ligue", "statut", "observations", "code_club"],
} as const
export class TerritoryError extends Error {
  status: number
  constructor(message: string, status = 400) { super(message); this.status = status }
}
export type TerritorySnapshot = Record<TerritoryKind, TerritoryRow[]> & {
  provinces: TerritoryRow[]; categories: TerritoryRow[]; sexes: TerritoryRow[]
}
const string = (v: unknown) => typeof v === "string" ? v.trim() : ""
const fail = (message: string, status = 400): never => { throw new TerritoryError(message, status) }
const leagueCode = (id: string) => /^(0[1-9]|1[0-9]|2[0-6])$/.test(id)
export const idHeader = (kind: TerritoryKind) => territoryHeaders[kind][0]

export function sheetRows(values: unknown[][], required: readonly string[]): TerritoryRow[] {
  const headers = (values[0] ?? []).map(value => String(value ?? "").trim())
  if (required.some(key => !headers.includes(key)) || new Set(headers.filter(Boolean)).size !== headers.filter(Boolean).length) {
    fail("Les colonnes du classeur ne correspondent pas au mapping FEACO attendu.", 503)
  }
  return values.slice(1).filter(row => row.some(v => v !== "" && v !== null && v !== undefined)).map(row =>
    Object.fromEntries(headers.filter(Boolean).map(key => [key, String(row[headers.indexOf(key)] ?? "").trim()])))
}

/** Produces only real FEACO columns. IDs, codes and parents are immutable on update. */
export function prepareTerritoryMutation(kind: TerritoryKind, payload: unknown, snapshot: TerritorySnapshot, existingId?: string) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) fail("Formulaire invalide.")
  const input = payload as Record<string, unknown>
  const get = (key: string) => string(input[key])
  const current = existingId ? snapshot[kind].find(row => row[idHeader(kind)] === existingId) : undefined
  if (existingId && !current) fail("Fiche introuvable.", 404)
  const unchanged = (key: string, value: string) => {
    if (current && value !== current[key]) fail("L’identifiant, le code et le parent sont immuables lors d’une modification.", 409)
  }
  let status = get("statut").toUpperCase()
  if (status === "ACTIVE") status = "ACTIF"
  if (status === "INACTIVE") status = "INACTIF"
  if (!["", "ACTIF", "INACTIF"].includes(status)) fail("Statut invalide.")
  const record: TerritoryRow = { statut: status, observations: get("observations") }
  let id: string
  if (kind === "ligues") {
    id = current?.id_ligue || get("idLigue")
    if (!leagueCode(id)) fail("Le code de ligue doit être compris entre 01 et 26.")
    if (current && get("idLigue") && get("idLigue") !== id) fail("L’identifiant de la ligue est immuable.", 409)
    Object.assign(record, { id_ligue: id, nom_ligue: get("nomLigue"), pseudo_ligue: get("sigleLigue"), email_ligue: get("emailLigue"), id_province: get("idProvince") })
    if (!snapshot.provinces.some(row => row.id_province === record.id_province)) fail("Province introuvable.")
  } else if (kind === "ententes") {
    const parent = get("idLigue"), code = get("codeEntente")
    if (!leagueCode(parent) || !snapshot.ligues.some(row => row.id_ligue === parent)) fail("Ligue introuvable.")
    if (!/^\d{2}$/.test(code)) fail("Le code d’entente doit contenir exactement deux chiffres.")
    unchanged("id_ligue", parent); unchanged("code_entente", code)
    id = current?.id_entente || parent + code
    Object.assign(record, { id_entente: id, code_entente: code, nom_entente: get("nomEntente"), pseudo_entente: get("pseudoEntente"), id_ligue: parent, id_ville: get("idVille"), email_entente: get("emailEntente") })
  } else {
    const parent = get("idEntente"), code = get("codeClub")
    const entente = snapshot.ententes.find(row => row.id_entente === parent)
    if (!entente || !/^\d{4}$/.test(parent)) throw new TerritoryError("Une entente parente est obligatoire ; le rattachement direct à une ligue n’est pas disponible.")
    const ligue = entente.id_ligue
    if (!snapshot.ligues.some(row => row.id_ligue === ligue) || parent !== ligue + entente.code_entente) fail("Rattachement de l’entente incohérent.")
    if (get("idLigue") && get("idLigue") !== ligue) fail("La ligue ne correspond pas à l’entente.")
    if (!/^\d{3}$/.test(code)) fail("code_club doit contenir exactement trois chiffres.")
    unchanged("id_entente", parent); unchanged("code_club", code)
    id = current?.id_club || parent + code
    const category = get("idCategorieClub"), sex = get("idSexe")
    if (category && !snapshot.categories.some(row => row.id_categorie_club === category)) fail("Catégorie invalide.")
    if (sex && !snapshot.sexes.some(row => row.id_sexe === sex)) fail("Sexe invalide.")
    let date = ""
    try { date = get("dateAffiliationClub") ? formatDateForSheet(get("dateAffiliationClub")) : "" } catch { fail("Date d’affiliation invalide.") }
    Object.assign(record, { id_club: id, code_club: code, nom_club: get("nomClub"), id_categorie: category, id_sexe: sex, date_affiliation: date, id_ville: get("idVille"), id_entente: parent, id_ligue: ligue })
  }
  const nameKey = kind === "ligues" ? "nom_ligue" : kind === "ententes" ? "nom_entente" : "nom_club"
  if (!record[nameKey]) fail("Le nom est obligatoire.")
  for (const key of ["email_ligue", "email_entente"]) {
    if (record[key] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record[key])) fail("Adresse e-mail invalide.")
  }
  if (get(kind === "ententes" ? "idEntente" : kind === "clubs" ? "idClub" : "idLigue") && get(kind === "ententes" ? "idEntente" : kind === "clubs" ? "idClub" : "idLigue") !== id) fail("L’identifiant ne peut pas être remplacé.", 409)
  if (snapshot[kind].some(row => row !== current && (row[idHeader(kind)] === id ||
    (kind === "ententes" && row.id_ligue === record.id_ligue && row.code_entente === record.code_entente) ||
    (kind === "clubs" && row.id_entente === record.id_entente && row.code_club === record.code_club)))) fail("Cet identifiant ou ce code existe déjà.", 409)
  return { id, record }
}

export interface TerritoryStore {
  read(fresh?: boolean): Promise<TerritorySnapshot>
  save(kind: TerritoryKind, record: TerritoryRow, existingId?: string): Promise<void>
}

/** Per-process serialization: this local-only app does not allow multi-instance writes. */
export function createTerritoryService(store: TerritoryStore) {
  let queue: Promise<unknown> = Promise.resolve()
  return {
    read: () => store.read(),
    mutate(kind: TerritoryKind, payload: unknown, existingId?: string) {
      const operation = queue.then(async () => {
        const snapshot = await store.read(true)
        const { id, record } = prepareTerritoryMutation(kind, payload, snapshot, existingId)
        await store.save(kind, record, existingId)
        // Return only after successful persistence; no fake fallback on write failure.
        return { id, snapshot: { ...snapshot, [kind]: existingId ? snapshot[kind].map(row => row[idHeader(kind)] === existingId ? { ...row, ...record } : row) : [...snapshot[kind], record] } as TerritorySnapshot }
      })
      queue = operation.catch(() => undefined)
      return operation
    },
  }
}
