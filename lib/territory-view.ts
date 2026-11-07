import { mapLigueRow } from "@/lib/mappers/ligues"
import { mapEntenteRow } from "@/lib/mappers/ententes"
import { mapClubRow } from "@/lib/mappers/clubs"
import { mapProvinceRow } from "@/lib/mappers/provinces"
import type { TerritorySnapshot } from "@/lib/territory-domain"

export function territoryView(data: TerritorySnapshot) {
  const provinces = data.provinces.map(mapProvinceRow)
  const provinceNames = new Map(data.provinces.map(row => [row.id_province, row.nom_province]))
  const categories = data.categories.map(row => ({ id: row.id_categorie_club, nom: row.nom_categorie_club }))
  const sexes = data.sexes.map(row => ({ id: row.id_sexe, nom: row.nom_sexe }))
  const ligues = data.ligues.map(row => mapLigueRow({ ...row, nom_province: provinceNames.get(row.id_province) || row.id_province }))
  const leagues = new Map(ligues.map(row => [row.idLigue, row]))
  const ententes = data.ententes.map(row => {
    const league = leagues.get(row.id_ligue)
    return mapEntenteRow({ ...row, nom_ligue: league?.nomLigue || row.id_ligue, id_province: league?.idProvince || "", nom_province: league?.nomProvince || "" })
  })
  const agreements = new Map(ententes.map(row => [row.idEntente, row]))
  const diagnostics: string[] = []
  const clubs = data.clubs.map(row => {
    const parent = agreements.get(row.id_entente)
    const league = parent ? leagues.get(parent.idLigue) : undefined
    if (!parent || (row.id_ligue && row.id_ligue !== parent.idLigue)) diagnostics.push(`Rattachement à vérifier pour le club ${row.id_club}.`)
    return mapClubRow({ ...row, id_ligue: parent?.idLigue || row.id_ligue, nom_ligue: league?.nomLigue || row.id_ligue,
      nom_entente: parent?.nomEntente || row.id_entente, pseudo_entente: parent?.nomEntente || row.id_entente,
      nom_province: league?.nomProvince || "", id_province: league?.idProvince || "",
      nom_categorie_club: categories.find(item => item.id === row.id_categorie)?.nom || row.id_categorie,
      nom_sexe: sexes.find(item => item.id === row.id_sexe)?.nom || row.id_sexe })
  })
  return { ligues, ententes, clubs, provinces, categories, sexes, diagnostics }
}
