"use client"

import { useId } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Athlete } from "@/lib/types"
import { Search } from "lucide-react"

export function AthletesFilters({
  athletes,
  search,
  genre,
  statut,
  onSearchChange,
  onGenreChange,
  onStatutChange,
}: {
  athletes: Pick<Athlete, "genre" | "statut">[]
  search: string
  genre: string
  statut: string
  onSearchChange: (value: string) => void
  onGenreChange: (value: string) => void
  onStatutChange: (value: string) => void
}) {

  const id = useId()
  const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }))
  const genres = unique(athletes.map(athlete => athlete.genre))
  const statuts = unique(athletes.map(athlete => athlete.statut))
  const sexLabel = (value: string) => ({ M: "Masculin", F: "Féminin", MASCULIN: "Masculin", FEMININ: "Féminin" }[value.toUpperCase()] || value)
  const statusLabel = (value: string) => ({ actif: "Actif", inactif: "Inactif", blesse: "Blessé", active: "Actif", inactive: "Inactif" }[value.toLowerCase()] || value.replaceAll("_", " "))

  return <div className="flex flex-wrap items-end gap-4">
    <div className="w-full min-w-0 space-y-1.5 sm:w-80 sm:max-w-full">
      <label htmlFor={`${id}-search`} className="text-sm font-medium">Recherche</label>
      <div className="relative"><Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input id={`${id}-search`} type="search" placeholder="Nom, identifiant fédéral ou WA…" className="pl-9" value={search} onChange={event => onSearchChange(event.target.value)} />
      </div>
    </div>
    <div className="w-full min-w-0 space-y-1.5 sm:w-[160px]">
      <label htmlFor={`${id}-sex`} className="text-sm font-medium">Sexe</label>
      <Select value={genre} onValueChange={onGenreChange}><SelectTrigger id={`${id}-sex`} className="w-full" aria-label="Filtrer par sexe"><SelectValue /></SelectTrigger><SelectContent>
        <SelectItem value="all">Tous les sexes</SelectItem>{genres.map(value => <SelectItem key={value} value={value}>{sexLabel(value)}</SelectItem>)}
      </SelectContent></Select>
    </div>
    <div className="w-full min-w-0 space-y-1.5 sm:w-[170px]">
      <label htmlFor={`${id}-status`} className="text-sm font-medium">Statut</label>
      <Select value={statut} onValueChange={onStatutChange}><SelectTrigger id={`${id}-status`} className="w-full" aria-label="Filtrer par statut"><SelectValue /></SelectTrigger><SelectContent>
        <SelectItem value="all">Tous les statuts</SelectItem>{statuts.map(value => <SelectItem key={value} value={value}>{statusLabel(value)}</SelectItem>)}
      </SelectContent></Select>
    </div>
  </div>
}
