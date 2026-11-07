"use client"
import type { ReactNode } from "react"
import type { Club, Entente, Ligue } from "@/lib/types"
import type { ClubReferenceOption } from "@/lib/club-references"
import { compactDateFromSheet } from "@/lib/compact-date"
import { TerritoryForm, territoryStatus } from "@/components/territory/territory-form"
export type SavedClub = Club & { previousIdClub?: string }
export function ClubFormDialog({club, ententes, ligues = [], categories, sexes, onSaved, trigger}: {club?:Club; ententes:Entente[]; ligues?:Ligue[]; categories:ClubReferenceOption[]; sexes:ClubReferenceOption[]; onSaved:(value:SavedClub)=>void; trigger?:ReactNode}) {
 return <TerritoryForm<SavedClub> kind="clubs" entityId={club?.idClub} ententes={ententes} ligues={ligues} categories={categories} sexes={sexes} onSaved={onSaved} trigger={trigger} initial={{
 codeClub:club?.codeClub || "", nomClub:club?.nomClub || "", idEntente:club?.idEntente || "", idLigue:club?.idLigue || "", idCategorieClub:club?.idCategorieClub || "", idSexe:club?.idSexe || "", dateAffiliationClub:compactDateFromSheet(club?.dateAffiliationClub || ""), idVille:club?.idVille || "", statut:territoryStatus(club?.statut), observations:club?.observations || ""
 }} />
}

