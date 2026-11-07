"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { AthleteReadDetail } from "@/components/athletes/athlete-read-detail"
import { AthletesFilters } from "@/components/athletes/athletes-filters"
import { AthletesTable } from "@/components/athletes/athletes-table"
import { ActorListPagination, useActorPagination } from "@/components/actors/actor-list-pagination"
import { compareLabels } from "@/lib/sort-utils"
import type { AthleteReadRecord } from "@/lib/athlete-read-domain"

export function AthletesReadClient({ athletes }: { athletes: AthleteReadRecord[] }) {
  const [selected, setSelected] = useState<AthleteReadRecord | null>(null)
  const [search, setSearch] = useState("")
  const [genre, setGenre] = useState("all")
  const [statut, setStatut] = useState("all")
  useEffect(() => {
    const back = (event: Event) => { if ((event as CustomEvent<string>).detail === "/athletes") setSelected(null) }
    window.addEventListener("feaco:navigate", back)
    return () => window.removeEventListener("feaco:navigate", back)
  }, [])
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return athletes.filter(athlete => (genre === "all" || athlete.genre === genre) && (statut === "all" || athlete.statut === statut) &&
      (!term || (athlete.idAthlete + " " + athlete.nomComplet + " " + athlete.idWa).toLowerCase().includes(term)))
      .sort((a, b) => compareLabels(a.nomComplet, b.nomComplet))
  }, [athletes, genre, search, statut])
  const pagination = useActorPagination(filtered)
  if (selected) return <AthleteReadDetail athlete={selected} onBack={() => setSelected(null)} />
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Lecture seule — création et modification indisponibles.</p><Button disabled className="bg-brand-gold text-[#071827]">Créer un athlète</Button></div>
    <AthletesFilters athletes={athletes} search={search} genre={genre} statut={statut} onSearchChange={setSearch} onGenreChange={setGenre} onStatutChange={setStatut} />
    <AthletesTable athletes={pagination.items} onViewAthlete={setSelected} emptyMessage={athletes.length ? "Aucun athlète ne correspond aux filtres." : "Aucun athlète enregistré"} />
    <ActorListPagination {...pagination} />
  </div>
}
