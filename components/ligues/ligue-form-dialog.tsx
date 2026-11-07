"use client"
import type { ReactNode } from "react"
import type { Ligue, Province } from "@/lib/types"
import { TerritoryForm, territoryStatus } from "@/components/territory/territory-form"
export type SavedLigue = Ligue
export function LigueFormDialog({ provinces, ligue, onSaved, trigger }: { provinces: Province[]; ligue?: Ligue; onSaved: (value: SavedLigue) => void; trigger?: ReactNode }) {
  return <TerritoryForm<SavedLigue> kind="ligues" entityId={ligue?.idLigue} provinces={provinces} onSaved={onSaved} trigger={trigger} initial={{
    idLigue:ligue?.idLigue || "", nomLigue:ligue?.nomLigue || "", sigleLigue:ligue?.sigleLigue || "", emailLigue:ligue?.emailLigue || "", idProvince:ligue?.idProvince || "", statut:territoryStatus(ligue?.statut), observations:ligue?.observations || ""
  }} />
}

