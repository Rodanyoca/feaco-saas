"use client"

import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { AutreActeurDetail } from "@/components/autres-acteurs/autre-acteur-detail"
import { AutreActeurFormDialog } from "@/components/autres-acteurs/autre-acteur-form-dialog"
import { AutresActeursTable } from "@/components/autres-acteurs/autres-acteurs-table"
import { Input } from "@/components/ui/input"
import { ActorListPagination, useActorPagination } from "@/components/actors/actor-list-pagination"
import { compareLabels } from "@/lib/sort-utils"
import type { ActorSexOption } from "@/lib/actor-references"
import type { AutreActeur, TypeAutreActeur } from "@/lib/types"

export function AutresActeursClient({ acteurs, types, sexes }: { acteurs: AutreActeur[]; types: TypeAutreActeur[]; sexes: ActorSexOption[] }) {
  const [rows, setRows] = useState(acteurs)
  const [selected, setSelected] = useState<AutreActeur | null>(null)
  const [search, setSearch] = useState("")
  useEffect(() => setRows(acteurs), [acteurs])
  useEffect(() => { const back = (event: Event) => { if ((event as CustomEvent<string>).detail === "/autres-acteurs") setSelected(null) }; window.addEventListener("feaco:navigate", back); return () => window.removeEventListener("feaco:navigate", back) }, [])
  const save = (saved: AutreActeur) => { setRows((current) => current.some((item) => item.idAutreActeur === saved.idAutreActeur) ? current.map((item) => item.idAutreActeur === saved.idAutreActeur ? saved : item) : [saved, ...current]); setSelected((current) => current?.idAutreActeur === saved.idAutreActeur ? saved : current) }
  const filtered = useMemo(() => rows.filter((item) => {
    const term = search.trim().toLowerCase()
    return !term || `${item.idAutreActeur} ${item.nomComplet} ${item.telephone} ${item.typeAutreActeur}`.toLowerCase().includes(term)
  }).sort((a, b) => compareLabels(a.nomComplet, b.nomComplet)), [rows, search])
  const pagination = useActorPagination(filtered)
  if (selected) return <AutreActeurDetail acteur={selected} sexes={sexes} types={types} onBack={() => setSelected(null)} onUpdated={save} />
  return <div className="space-y-6"><div className="flex justify-end"><AutreActeurFormDialog sexes={sexes} types={types} onSaved={save} /></div>
    <div className="flex flex-wrap items-center gap-4"><div className="relative min-w-[200px] max-w-md flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input type="search" aria-label="Rechercher un autre acteur" className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un autre acteur..." /></div>
    </div><AutresActeursTable acteurs={pagination.items} onView={setSelected} /><ActorListPagination {...pagination} /></div>
}
