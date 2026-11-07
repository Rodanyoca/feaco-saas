"use client"

import { useMemo } from "react"
import { ArrowLeft, Building2, MapPin, Network, Pencil, Shield, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable, type Column } from "@/components/dashboard/data-table"
import { DetailCard } from "@/components/dashboard/detail-card"
import { StatCard } from "@/components/dashboard/stat-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { LigueFormDialog, type SavedLigue } from "@/components/ligues/ligue-form-dialog"
import { buildLigueHierarchy } from "@/lib/territorial-hierarchy"
import type { Club, Entente, Ligue, Province } from "@/lib/types"

export function LigueDetail({ ligue, ententes, clubs, provinces, onBack, onUpdated, relationsReady }: {
  ligue: Ligue; ententes: Entente[]; clubs: Club[]; provinces: Province[]
  onBack: () => void; onUpdated: (ligue: SavedLigue) => void; relationsReady: boolean
}) {
  const hierarchy = useMemo(() => buildLigueHierarchy(ligue, ententes, clubs), [ligue, ententes, clubs])
  const ententesById = useMemo(() => new Map(hierarchy.ententes.map((item) => [item.idEntente, item])), [hierarchy.ententes])
  const ententeColumns: Column<Entente>[] = [
    { key: "idEntente", header: "ID", className: "font-mono text-sm" }, { key: "nomEntente", header: "Nom", className: "font-medium" },
    { key: "pseudoEntente", header: "Sigle" }, { key: "ville", header: "Ville" },
    { key: "statut", header: "Statut", render: (item) => <StatusBadge status={item.statut} /> },
  ]
  const clubColumns: Column<Club>[] = [
    { key: "idClub", header: "ID", className: "font-mono text-sm" }, { key: "nomClub", header: "Nom", className: "font-medium" },
    { key: "idEntente", header: "Entente", render: (item) => ententesById.get(item.idEntente)?.nomEntente || item.idEntente },
    { key: "ville", header: "Ville" }, { key: "categorie", header: "Catégorie" },
    { key: "statut", header: "Statut", render: (item) => <StatusBadge status={item.statut} /> },
  ]
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 size-4" />Retour à la liste</Button><LigueFormDialog ligue={ligue} provinces={provinces} onSaved={onUpdated} trigger={<Button className="bg-brand-gold text-[#071827] hover:bg-brand-gold/90" aria-label={`Modifier ${ligue.nomLigue}`} title="Modifier"><Pencil className="size-4" />Modifier</Button>} /></div>
    <div className="grid gap-6 lg:grid-cols-2">
      <DetailCard title="Informations générales" icon={MapPin} iconClassName="text-brand-gold" fields={[{ label: "ID Ligue", value: ligue.idLigue }, { label: "Nom", value: ligue.nomLigue }, { label: "Pseudo", value: ligue.sigleLigue }, { label: "Province", value: ligue.nomProvince }, { label: "E-mail", value: ligue.emailLigue }, { label: "Statut", value: ligue.statut }]} />
      <DetailCard title="Observations" icon={Shield} iconClassName="text-brand-gold" fields={[{ label: "Observations", value: ligue.observations }]} />
    </div>
    <div className="grid gap-4 md:grid-cols-3"><StatCard className="[&_svg]:text-brand-gold" title="Ententes liées" value={relationsReady ? hierarchy.ententes.length : "—"} icon={Network} /><StatCard className="[&_svg]:text-brand-gold" title="Clubs liés" value={relationsReady ? hierarchy.clubs.length : "—"} icon={Building2} /><StatCard className="[&_svg]:text-brand-gold" title="Athlètes liés" value={"—"} icon={Users} /></div>
    {!relationsReady && <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-5" role="status">Certaines relations territoriales sont temporairement indisponibles.</p>}
    <Card><CardHeader><CardTitle>Ententes liées</CardTitle></CardHeader><CardContent><DataTable responsive data={hierarchy.ententes} columns={ententeColumns} searchPlaceholder="Rechercher une entente..." idKey="idEntente" /></CardContent></Card>
    <Card><CardHeader><CardTitle>Clubs liés</CardTitle></CardHeader><CardContent><DataTable responsive data={hierarchy.clubs} columns={clubColumns} searchPlaceholder="Rechercher un club..." idKey="idClub" /></CardContent></Card>
  </div>
}
