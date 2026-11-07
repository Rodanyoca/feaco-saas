"use client"

import { ActorTable } from "@/components/actors/actor-table"
import type { Arbitre } from "@/lib/types"

export function ArbitresTable({ arbitres, onViewArbitre }: { arbitres: Arbitre[]; onViewArbitre: (item: Arbitre) => void }) {
  return (
    <ActorTable
      title="Liste des arbitres"
      items={arbitres}
      onView={onViewArbitre}
      showId={false}
      firstColumn={{ label: "ID fédéral", value: (arbitre) => arbitre.idArbitre }}
      showCount={false}
      stackSexAge
      showGrade
      showNationalite
      emptyMessage="Aucun arbitre enregistré."
      toRow={(item) => ({
        id: item.idArbitre, nomComplet: item.nomComplet, sexe: item.sexe,
        dateNaissance: item.dateDeNaissance, idNational: item.idNational, idFivb: item.idFivb,
        avatarDriveId: item.avatarDriveId, avatarDriveUrl: item.avatarDriveUrl, statut: item.statut,
        grade: item.grade, nationalite: item.nationalite,
      })}
    />
  )
}
