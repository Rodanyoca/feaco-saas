"use client"

import { ActorTable } from "@/components/actors/actor-table"
import type { Athlete } from "@/lib/types"

type AthleteListItem = Pick<Athlete, "idAthlete" | "nomComplet" | "sexe" | "dateDeNaissance" | "idWa" | "avatarDriveId" | "avatarDriveUrl" | "statut">

export function AthletesTable<T extends AthleteListItem>({
  athletes,
  title = "Liste des Athlètes",
  emptyMessage = "Aucun athlète enregistré.",
  onViewAthlete,
}: {
  athletes: T[]
  title?: string
  emptyMessage?: string
  onViewAthlete?: (athlete: T) => void
}) {
  return (
    <ActorTable
      title={title}
      items={athletes}
      onView={onViewAthlete}
      showId={false}
      showCount={false}
      firstColumn={{ label: "ID fédéral", value: (athlete) => athlete.idAthlete }}
      showNationalId={false}
      showWa
      stackSexAge
      emptyMessage={emptyMessage}
      toRow={(item) => ({
        id: item.idAthlete,
        nomComplet: item.nomComplet,
        sexe: item.sexe,
        dateNaissance: item.dateDeNaissance,
        idWa: item.idWa,
        avatarDriveId: item.avatarDriveId,
        avatarDriveUrl: item.avatarDriveUrl,
        statut: item.statut,
      })}
    />
  )
}
