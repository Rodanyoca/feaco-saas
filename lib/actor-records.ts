import "server-only"

import { affiliationSnapshot } from "@/lib/feaco-affiliations-sheets"
import type { AffiliationKind } from "@/lib/feaco-affiliations-domain"
import { getSheetDataFrom } from "@/lib/google-sheets"
import { env } from "@/lib/env"
import {
  mapAthleteAffiliation,
  mapAthleteLicence,
  mapCoachAffiliation,
  mapLicence,
  mapMedecinAffiliation,
  mapOfficielAffiliation,
} from "@/lib/mappers/actor-records"
import type {
  AthleteAffiliation,
  AthleteLicence,
  BaseActorLicence,
  CoachAffiliation,
  MedecinAffiliation,
  OfficielAffiliation,
} from "@/lib/types"
import { isMissingSheetRangeError } from "@/lib/optional-sheet"

async function rows(sheet: string) {
  if (!env.googleSheets.affiliationsSpreadsheetId) return []
  return getSheetDataFrom(env.googleSheets.affiliationsSpreadsheetId, `${sheet}!A:Z`)
}

async function licenceRows(_sheet: string): Promise<Record<string, string>[]> {
  void _sheet
  // FEACO licences are unavailable: never read demonstration or legacy licence rows.
  return []
}

async function feacoRows(kind: AffiliationKind) {
  const data = await affiliationSnapshot()
  return data.affiliations[kind].map(row => {
    const club = data.clubs.find(club => club.id_club === row.id_club)
    return { ...row, id_club_beneficiaire: row.id_club, nom_club: club?.nom_club || row.id_club, nom_club_beneficiaire: club?.nom_club || row.id_club, saison: data.seasons.find(season => season.id_saison === row.id_saison)?.nom_saison || row.id_saison }
  })
}

export const getAthleteAffiliations = async (): Promise<AthleteAffiliation[]> =>
  (await feacoRows("athlete")).map(mapAthleteAffiliation).filter((item) => item.actorId)
export const getCoachAffiliations = async (): Promise<CoachAffiliation[]> =>
  (await feacoRows("coach")).map(mapCoachAffiliation).filter((item) => item.actorId)
export const getMedecinAffiliations = async (): Promise<MedecinAffiliation[]> =>
  (await feacoRows("medecin")).map(mapMedecinAffiliation).filter((item) => item.actorId)
export const getOfficielAffiliations = async (): Promise<OfficielAffiliation[]> => {
  const affiliations = await rows("OFFICIELS_AFFILIATIONS")
  return affiliations.map(mapOfficielAffiliation).filter((item) => item.actorId)
}

async function optionalLicenceRows(sheet: string) {
  try { return await licenceRows(sheet) } catch (error) {
    if (isMissingSheetRangeError(error, sheet)) {
      console.warn(`Onglet facultatif ${sheet} absent : les licences seront affichées comme non renseignées.`)
      return []
    }
    throw error
  }
}

export const getAthleteLicences = async (): Promise<AthleteLicence[]> =>
  (await optionalLicenceRows("ATHLETE_LICENCES")).map(mapAthleteLicence).filter((item) => item.idLicence && item.actorId)

const actorTypeIds = { coach: "TAC002", officiel: "TAC003", arbitre: "TAC004", medecin: "TAC005" } as const
async function licences(kind: keyof typeof actorTypeIds) {
  return (await optionalLicenceRows("ACTEURS_LICENCES"))
    .filter((row) => String(row.id_type_acteur ?? "").trim() === actorTypeIds[kind])
    .map((row) => mapLicence(row, kind)).filter((item) => item.idLicence && item.actorId)
}
export const getCoachLicences = (): Promise<BaseActorLicence[]> => licences("coach")
export const getMedecinLicences = (): Promise<BaseActorLicence[]> => licences("medecin")
export const getOfficielLicences = (): Promise<BaseActorLicence[]> => licences("officiel")
export const getArbitreLicences = (): Promise<BaseActorLicence[]> => licences("arbitre")
