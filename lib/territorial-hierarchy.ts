import type { Club, Entente, Ligue } from "@/lib/types"

export interface LigueHierarchy {
  ententes: Entente[]
  clubs: Club[]
  clubsByEntenteId: Map<string, Club[]>
  diagnostics: string[]
}

function uniqueById<T>(items: T[], getId: (item: T) => string): T[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const id = getId(item).trim()
    if (!id || seen.has(id)) return false
    seen.add(id)
    return true
  })
}

export function buildLigueHierarchy(
  ligue: Pick<Ligue, "idLigue">,
  ententes: Entente[],
  clubs: Club[],
): LigueHierarchy {
  const diagnostics: string[] = []
  const ligueEntentes = uniqueById(
    ententes.filter((entente) => entente.idLigue === ligue.idLigue),
    (entente) => entente.idEntente,
  )
  const ententeIds = new Set(ligueEntentes.map((entente) => entente.idEntente))

  const ligueClubs = uniqueById(
    clubs.filter((club) => ententeIds.has(club.idEntente)),
    (club) => club.idClub,
  )
  for (const club of ligueClubs) {
    if (club.idLigue && club.idLigue !== ligue.idLigue) {
      diagnostics.push(`Club ${club.idClub}: id_ligue=${club.idLigue} incoherent avec l'entente ${club.idEntente}.`)
    }
  }

  const clubsByEntenteId = new Map<string, Club[]>()
  for (const club of ligueClubs) {
    clubsByEntenteId.set(club.idEntente, [...(clubsByEntenteId.get(club.idEntente) ?? []), club])
  }

  return { ententes: ligueEntentes, clubs: ligueClubs, clubsByEntenteId, diagnostics }
}
