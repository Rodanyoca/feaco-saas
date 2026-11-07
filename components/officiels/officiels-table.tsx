"use client"

import { Eye } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { getActorAvatarUrl } from "@/lib/actor-avatar"
import { calculateAge } from "@/lib/date-utils"
import { normalize } from "@/lib/sheet-values"
import type { Officiel } from "@/lib/types"

const shown = (value: unknown) => String(value ?? "").trim() || "-"
const initials = (name: string) => { const parts = name.trim().split(/\s+/).filter(Boolean); return parts.length ? `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}`.toUpperCase() : "OF" }
const sex = (value: string) => { const v = normalize(value); return v === "M" || v === "MASCULIN" ? "M" : v === "F" || v === "FEMININ" ? "F" : "-" }

export function OfficielsTable({ officiels, onViewOfficiel }: { officiels: Officiel[]; onViewOfficiel: (item: Officiel) => void }) {
  const rows = officiels

  const identity = (item: Officiel) => {
    const avatar = getActorAvatarUrl(item.avatarDriveUrl, item.avatarDriveId)
    return <div className="flex min-w-0 items-center gap-3"><Avatar className="size-10 shrink-0"><AvatarImage src={avatar || undefined} alt={item.nomComplet || "Avatar"} /><AvatarFallback className="text-xs">{initials(item.nomComplet)}</AvatarFallback></Avatar><span className="min-w-0 whitespace-normal break-words font-medium leading-snug">{shown(item.nomComplet)}</span></div>
  }
  const sexAge = (item: Officiel) => { const age = calculateAge(item.dateDeNaissance); return <div className="space-y-1"><span className="block">{sex(item.sexe)}</span><span className="block text-xs text-muted-foreground">{age === null ? "-" : `${age} ans`}</span></div> }

  return <section className="space-y-4" aria-label="Liste des officiels">
    <h2 className="sr-only">Liste des officiels</h2>
    <div className="grid gap-3 md:hidden">{rows.map(item => <article key={item.idOfficiel} className="rounded-xl border bg-card p-4 shadow-sm"><div className="flex items-start justify-between gap-3">{identity(item)}<StatusBadge status={item.statut} /></div><div className="mt-4 grid grid-cols-2 gap-4 text-sm"><div className="col-span-2"><p className="text-xs text-muted-foreground">ID fédéral</p><p className="break-all font-mono">{shown(item.idOfficiel)}</p></div><div><p className="text-xs text-muted-foreground">Sexe / Âge</p>{sexAge(item)}</div><div><p className="text-xs text-muted-foreground">ID national</p><p className="break-all font-mono text-xs">{shown(item.idNational)}</p></div></div><div className="mt-3 flex justify-end"><Button variant="ghost" size="icon" onClick={() => onViewOfficiel(item)} aria-label={`Voir ${item.nomComplet}`}><Eye className="size-4" /></Button></div></article>)}{!rows.length && <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Aucun officiel enregistré.</p>}</div>
    <div className="hidden overflow-hidden rounded-xl border border-border/80 bg-card/90 shadow-[0_12px_30px_rgba(1,10,20,0.12)] md:block"><Table className="min-w-[980px] table-fixed"><TableHeader><TableRow className="bg-muted/70 hover:bg-muted/70"><TableHead className="w-[11%]">ID fédéral</TableHead><TableHead className="w-[27%]">Nom complet</TableHead><TableHead className="w-[12%]">Sexe / Âge</TableHead><TableHead className="w-[16%]">ID national</TableHead><TableHead className="w-[10%]">Statut</TableHead><TableHead className="w-[9%] text-center">Actions</TableHead></TableRow></TableHeader><TableBody>{rows.map(item => <TableRow key={item.idOfficiel} className="hover:bg-muted/30"><TableCell className="break-all font-mono">{shown(item.idOfficiel)}</TableCell><TableCell>{identity(item)}</TableCell><TableCell>{sexAge(item)}</TableCell><TableCell className="whitespace-nowrap font-mono text-xs">{shown(item.idNational)}</TableCell><TableCell><StatusBadge status={item.statut} /></TableCell><TableCell className="text-center"><Button variant="ghost" size="icon" onClick={() => onViewOfficiel(item)} aria-label={`Voir ${item.nomComplet}`}><Eye className="size-4" /></Button></TableCell></TableRow>)}{!rows.length && <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Aucun officiel enregistré.</TableCell></TableRow>}</TableBody></Table></div>
  </section>
}
