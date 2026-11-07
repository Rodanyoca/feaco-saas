/** FEACO contracts grounded in docs/feaco-sheets-schema.json. No I/O or mutations. */
type Row = Record<string, unknown>
const text = (row: Row, key: string) => String(row[key] ?? "").trim()

export const actorSheets = {
  ATHLETES: "id_athlete", COACHS: "id_coach", OFFICIELS: "id_officiel",
  ARBITRES: "id_arbitre", MEDECINS: "id_medecin", AUTRES: "id_autre_acteur",
} as const

/** Only public list fields; never forward passport/contact/Drive columns. */
export function actorListItem(sheet: keyof typeof actorSheets, row: Row) {
  return { id: text(row, actorSheets[sheet]), nom: text(row, "nom_complet"), statut: text(row, "statut") }
}

export function actorIdentity(sheet: keyof typeof actorSheets, row: Row) {
  return { ...actorListItem(sheet, row), idNational: text(row, "id_national"), idWa: text(row, "id_wa") }
}

export function clubIdForEntente(idEntente: string, codeClub: string) {
  if (!/^\d{4}$/.test(idEntente) || !/^\d{3}$/.test(codeClub)) {
    throw new Error("Entente à quatre chiffres et code_club à trois chiffres requis ; rattachement direct à une ligue à valider.")
  }
  if (!/^(0[1-9]|1[0-9]|2[0-6])/.test(idEntente)) throw new Error("Code ligue FEACO inconnu.")
  return idEntente + codeClub
}

const affiliationKeys = {
  athlete: ["id_affiliation_athlete", "id_athlete"],
  coach: ["id_affiliation_coach", "id_coach"],
  medecin: ["id_affiliation_medecin", "id_medecin"],
} as const

export function affiliationItem(kind: keyof typeof affiliationKeys, row: Row) {
  const [idKey, actorKey] = affiliationKeys[kind]
  return { id: text(row, idKey), actorId: text(row, actorKey), clubId: text(row, "id_club"),
    saisonId: text(row, "id_saison"), statutId: text(row, "id_statut_affiliation"),
    dateDebut: text(row, "date_debut"), dateFin: text(row, "date_fin") }
}

export function numericPerformance(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null
  if (typeof value === "string" && !value.trim()) return null
  if (typeof value !== "number" && typeof value !== "string") throw new Error("Performance numérique requise.")
  const normalized = typeof value === "string" ? value.trim().replace(",", ".") : value
  if (typeof normalized === "string" && !/^\d+(\.\d+)?$/.test(normalized)) throw new Error("Performance numérique requise.")
  const result = Number(normalized)
  if (!Number.isFinite(result) || result < 0) throw new Error("Performance numérique positive ou nulle requise.")
  return result
}

export function formatPerformance(value: unknown, unit: string): string {
  const number = numericPerformance(value)
  if (number === null) return ""
  const decimal = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false })
  switch (unit) {
    case "SECONDE": {
      const hundredths = Math.round(number * 100)
      const minutes = Math.floor(hundredths / 6000)
      const seconds = (hundredths % 6000) / 100
      return `${minutes ? `${minutes} min ` : ""}${decimal(seconds)} s`
    }
    case "METRE": return `${decimal(number)} m`
    case "POINT": return `${number.toLocaleString("fr-FR", { useGrouping: false })} points`
    default: throw new Error(`Unité FEACO non prise en charge : ${unit}`)
  }
}

/** Filter the edition and requested event before joining; reject cross-event results. */
export function individualResults(editionId: string, eventId: string, tables: {
  events: Row[]; references: Row[]; participants: Row[]; phases: Row[]; results: Row[];
}) {
  const event = tables.events.find(row => text(row, "id_competition") === editionId && text(row, "id_competition_epreuve") === eventId)
  if (!event) return []
  const reference = tables.references.find(row => text(row, "id_epreuve") === text(event, "id_epreuve"))
  if (!reference || text(reference, "type_participation") !== "INDIVIDUEL") throw new Error("Épreuve individuelle FEACO requise.")
  const participants = new Map(tables.participants.filter(row => text(row, "id_competition_epreuve") === eventId).map(row => [text(row, "id_participation"), row]))
  const phases = new Set(tables.phases.filter(row => text(row, "id_competition_epreuve") === eventId).map(row => text(row, "id_phase_competition")))
  return tables.results.filter(row => phases.has(text(row, "id_phase_competition")) && participants.has(text(row, "id_participation"))).map(row => ({
    id: text(row, "id_resultat"), athleteId: text(participants.get(text(row, "id_participation"))!, "id_athlete"),
    phaseId: text(row, "id_phase_competition"), performance: numericPerformance(row.performance),
    affichage: formatPerformance(row.performance, text(reference, "unite_resultat")),
    statutId: text(row, "id_statut_resultat"), rang: text(row, "rang"),
  }))
}
