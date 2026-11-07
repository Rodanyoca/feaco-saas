"use client"

import { ActorTable } from "@/components/actors/actor-table"
import type { Medecin } from "@/lib/types"

export function MedecinsTable({ medecins, onViewMedecin }: { medecins: Medecin[]; onViewMedecin: (item: Medecin) => void }) {

  return <div className="space-y-4">
    <ActorTable
      title="Liste des médecins"
      items={medecins}
      onView={onViewMedecin}
      showId={false}
      firstColumn={{ label: "ID fédéral", value: (medecin) => medecin.idMedecin }}
      showCount={false}
      identityLayout="avatar-in-name"
      stackSexAge
      showSpecialite
      emptyMessage="Aucun médecin enregistré."
      toRow={(item) => ({
        id: item.idMedecin, nomComplet: item.nomComplet, sexe: item.sexe,
        dateNaissance: item.dateDeNaissance, specialite: item.specialite,
        idNational: item.idNational, idFivb: item.idFivb,
        avatarDriveId: item.avatarDriveId, avatarDriveUrl: item.avatarDriveUrl, statut: item.statut,
      })}
    />
  </div>
}
