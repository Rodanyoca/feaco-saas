"use client"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ActorListPagination, useActorPagination } from '@/components/actors/actor-list-pagination'
import { AffiliationsPanel } from '@/components/actors/affiliations-panel'
import { LicencesComingSoon } from '@/components/licences/licences-coming-soon'
import type { AffiliationKind } from '@/lib/feaco-affiliations-domain'
export type AffiliationActor = { id: string; name: string; idWa: string }
export function AffiliationActorsClient({ kind, actors }: { kind: AffiliationKind; actors: AffiliationActor[] }) {
  const [selected, setSelected] = useState<AffiliationActor | null>(null), [search, setSearch] = useState('')
  const filtered = actors.filter(actor => `${actor.id} ${actor.name} ${actor.idWa}`.toLowerCase().includes(search.toLowerCase()))
  const pagination = useActorPagination(filtered)
  if (selected) return <div className="space-y-6"><Button variant="outline" onClick={() => setSelected(null)}>Retour à la liste</Button><div className="rounded-xl border p-6"><h2 className="text-2xl font-bold">{selected.name || selected.id}</h2><p>ID fédéral : {selected.id}</p><p>ID WA : {selected.idWa || 'Non renseigné'}</p></div><Tabs defaultValue="affiliations"><TabsList><TabsTrigger value="affiliations">Affiliations</TabsTrigger><TabsTrigger value="licence">Licence</TabsTrigger></TabsList><TabsContent value="affiliations"><AffiliationsPanel key={selected.id} kind={kind} actorId={selected.id} /></TabsContent><TabsContent value="licence"><LicencesComingSoon /></TabsContent></Tabs></div>
  return <div className="space-y-4"><Input aria-label="Rechercher un acteur" placeholder="Nom, ID fédéral, ID WA…" value={search} onChange={event => setSearch(event.target.value)} /><div className="rounded-lg border"><Table><TableHeader><TableRow><TableHead>ID fédéral</TableHead><TableHead>Nom complet</TableHead><TableHead>ID WA</TableHead><TableHead>Fiche</TableHead></TableRow></TableHeader><TableBody>{pagination.items.map(actor => <TableRow key={actor.id}><TableCell>{actor.id}</TableCell><TableCell>{actor.name}</TableCell><TableCell>{actor.idWa || '—'}</TableCell><TableCell><Button variant="outline" onClick={() => setSelected(actor)}>Voir la fiche</Button></TableCell></TableRow>)}{!filtered.length && <TableRow><TableCell colSpan={4} className="py-8 text-center">Aucun acteur trouvé.</TableCell></TableRow>}</TableBody></Table></div><ActorListPagination {...pagination} /></div>
}
