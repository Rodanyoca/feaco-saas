"use client"

import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/dashboard/status-badge"
import type { AutreActeur } from "@/lib/types"

const shown = (value: unknown) => String(value ?? "").trim() || "-"
export function AutresActeursTable({ acteurs, onView }: { acteurs: AutreActeur[]; onView: (item: AutreActeur) => void }) {
  const rows = acteurs

  const action = (item: AutreActeur) => <Button variant="ghost" size="icon" onClick={() => onView(item)} aria-label={`Voir ${item.nomComplet}`}><Eye className="size-4" /></Button>
  return <section className="space-y-4" aria-label="Liste des autres acteurs"><h2 className="sr-only">Liste des autres acteurs</h2>
    <div className="grid gap-3 md:hidden">{rows.map((item) => <article key={item.idAutreActeur} className="rounded-xl border bg-card p-4 shadow-sm"><div className="flex justify-between gap-3"><div><p className="font-medium">{shown(item.nomComplet)}</p></div><StatusBadge status={item.statut} /></div><div className="mt-4 grid grid-cols-2 gap-4 text-sm"><div><p className="text-xs text-muted-foreground">Sexe</p><p>{shown(item.sexe)}</p></div><div><p className="text-xs text-muted-foreground">ID fédéral</p><p className="break-all font-mono">{shown(item.idAutreActeur)}</p></div><div><p className="text-xs text-muted-foreground">Téléphone</p><p>{shown(item.telephone)}</p></div></div><div className="flex justify-end">{action(item)}</div></article>)}{!rows.length && <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Aucun autre acteur enregistré.</p>}</div>
    <div className="hidden overflow-hidden rounded-xl border border-border/80 bg-card/90 shadow-[0_12px_30px_rgba(1,10,20,0.12)] md:block"><Table className="min-w-[750px] table-fixed"><TableHeader><TableRow className="bg-muted/70 hover:bg-muted/70"><TableHead className="w-[17%]">ID fédéral</TableHead><TableHead className="w-[32%]">Nom complet</TableHead><TableHead className="w-[10%]">Sexe</TableHead><TableHead className="w-[19%]">Téléphone</TableHead><TableHead className="w-[12%]">Statut</TableHead><TableHead className="w-[10%] text-center">Actions</TableHead></TableRow></TableHeader><TableBody>{rows.map((item) => <TableRow key={item.idAutreActeur}><TableCell className="whitespace-normal break-all font-mono">{shown(item.idAutreActeur)}</TableCell><TableCell className="whitespace-normal break-words font-medium">{shown(item.nomComplet)}</TableCell><TableCell>{shown(item.sexe)}</TableCell><TableCell>{shown(item.telephone)}</TableCell><TableCell><StatusBadge status={item.statut} /></TableCell><TableCell className="text-center">{action(item)}</TableCell></TableRow>)}{!rows.length && <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Aucun autre acteur enregistré.</TableCell></TableRow>}</TableBody></Table></div>
  </section>
}
