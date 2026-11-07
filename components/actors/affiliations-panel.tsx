"use client"
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CompactDateInput } from '@/components/ui/compact-date-input'
import { formatDateForDisplay } from '@/lib/compact-date'
import type { AffiliationHistory, AffiliationItem, AffiliationKind } from '@/lib/feaco-affiliations-domain'

const empty = { id: '', actorId: '', clubId: '', seasonId: '', dateDebut: '', dateFin: '', statusId: '', observations: '' }
export function AffiliationsPanel({ kind, actorId }: { kind: AffiliationKind; actorId: string }) {
  const [data, setData] = useState<AffiliationHistory | null>(null)
  const [error, setError] = useState(''), [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'create' | 'update' | 'terminate' | 'view' | null>(null)
  const [values, setValues] = useState<AffiliationItem>(empty), [saving, setSaving] = useState(false), [formError, setFormError] = useState('')
  const [search, setSearch] = useState('')
  const url = `/api/affiliations/${kind}?actorId=${encodeURIComponent(actorId)}`
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError(''); setData(null)
    try { const response = await fetch(url, { cache: 'no-store', signal }); const body = await response.json(); if (!response.ok) throw new Error(body.message); setData(body) }
    catch (e) { if (!signal?.aborted) setError(e instanceof Error ? e.message : 'Lecture impossible.') }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [url])
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort() }, [load])
  function open(next: NonNullable<typeof mode>, item = { ...empty, actorId }) { setValues({ ...item, dateDebut: formatDateForDisplay(item.dateDebut), dateFin: formatDateForDisplay(item.dateFin) }); setFormError(''); setMode(next) }
  async function save(event: React.FormEvent) {
    event.preventDefault(); if (saving || mode === 'view') return
    setSaving(true); setFormError('')
    try {
      const response = await fetch(url, { method: mode === 'create' ? 'POST' : mode === 'terminate' ? 'PATCH' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, actorId }) })
      const body = await response.json(); if (!response.ok) throw new Error(body.message)
      setData(body); setMode(null)
    } catch (e) { setFormError(e instanceof Error ? e.message : 'Enregistrement impossible.') }
    finally { setSaving(false) }
  }
  const club = (id: string) => data?.clubs.find(row => row.id === id)
  const date = (value: string) => value ? formatDateForDisplay(value) || value : '—'
  const field = (key: keyof AffiliationItem, value: string) => setValues(previous => ({ ...previous, [key]: value }))
  const selected = club(values.clubId)
  const readOnly = mode === 'view', finishing = mode === 'terminate'
  return <section className="space-y-5 border-t pt-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Affiliations</h2><p className="text-sm text-muted-foreground">Rattachements aux clubs et historique territorial</p></div><div className="flex gap-2"><Button variant="outline" disabled={loading || saving} onClick={() => void load()}>Actualiser</Button><Button disabled={!data || saving} onClick={() => open('create')}>Ajouter une affiliation</Button></div></div>
    {loading && <p role="status">Chargement des affiliations…</p>}
    {error && <div role="alert" className="rounded-lg border border-destructive p-4">{error}</div>}
    {data && <>
      <p className="text-sm text-muted-foreground">Les règles FEACO de chevauchement et de nouveau rattachement à un club inactif restent à valider. Aucun autre rattachement ne sera terminé automatiquement.</p>
      <Input aria-label="Rechercher une affiliation" placeholder="Rechercher un club, une saison…" value={search} onChange={event => setSearch(event.target.value)} />
      <div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>Club · Entente · Ligue</TableHead><TableHead>Saison</TableHead><TableHead>Début</TableHead><TableHead>Fin</TableHead><TableHead>Statut</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>
        {data.items.filter(item => `${club(item.clubId)?.label || item.clubId} ${data.seasons.find(row => row.id === item.seasonId)?.label || item.seasonId}`.toLowerCase().includes(search.toLowerCase())).map(item => <TableRow key={item.id}>
          <TableCell><p className="font-medium">{club(item.clubId)?.label || `${item.clubId} (club introuvable)`}</p><p className="text-xs text-muted-foreground">{club(item.clubId)?.entente} · {club(item.clubId)?.ligue}</p><p className="text-xs">{club(item.clubId)?.status || 'Statut non renseigné'}{club(item.clubId)?.anomaly ? ' · Rattachement territorial à vérifier' : ''}</p></TableCell>
          <TableCell>{data.seasons.find(row => row.id === item.seasonId)?.label || item.seasonId}</TableCell><TableCell>{date(item.dateDebut)}</TableCell><TableCell>{date(item.dateFin)}</TableCell><TableCell>{data.statuses.find(row => row.id === item.statusId)?.label || item.statusId}</TableCell>
          <TableCell><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => open('view', item)}>Voir</Button><Button variant="outline" size="sm" onClick={() => open('update', item)}>Corriger</Button><Button variant="outline" size="sm" onClick={() => open('terminate', item)}>Terminer</Button></div></TableCell>
        </TableRow>)}
        {!data.items.length && <TableRow><TableCell colSpan={6} className="py-8 text-center">Aucune affiliation enregistrée.</TableCell></TableRow>}
      </TableBody></Table></div>
    </>}
    <Sheet open={mode !== null} onOpenChange={open => { if (!open && !saving) setMode(null) }}><SheetContent className="overflow-y-auto sm:max-w-md"><SheetHeader><SheetTitle>{mode === 'create' ? 'Ajouter une affiliation' : finishing ? 'Terminer le rattachement' : readOnly ? 'Détail de l’affiliation' : 'Corriger l’affiliation'}</SheetTitle><SheetDescription>{finishing ? 'Seuls la date de fin et le statut SAF002 seront modifiés sur cette ligne.' : 'Rattachement FEACO à un club. Les dates sont indépendantes du libellé de la saison.'}</SheetDescription></SheetHeader>
      <form onSubmit={save} className="space-y-4 p-4">
        {values.id && <p className="break-all text-xs text-muted-foreground">{values.id}</p>}
        <div className="space-y-2"><Label htmlFor="aff-club">Club</Label><select id="aff-club" className="h-10 w-full rounded-md border bg-background px-3" disabled={readOnly || finishing || saving} required value={values.clubId} onChange={event => field('clubId', event.target.value)}><option value="">Sélectionner un club</option>{values.clubId && !selected && <option value={values.clubId}>{values.clubId} (introuvable)</option>}{data?.clubs.map(row => <option key={row.id} value={row.id}>{row.label} · {row.status || 'statut non renseigné'}</option>)}</select><p className="text-sm text-muted-foreground">{selected?.entente} · {selected?.ligue}</p></div>
        <div className="space-y-2"><Label htmlFor="aff-season">Saison</Label><select id="aff-season" className="h-10 w-full rounded-md border bg-background px-3" disabled={readOnly || finishing || saving} required value={values.seasonId} onChange={event => field('seasonId', event.target.value)}><option value="">Sélectionner une saison</option>{data?.seasons.map(row => <option key={row.id} value={row.id}>{row.label}</option>)}</select></div>
        <div className="space-y-2"><Label htmlFor="aff-start">Date de début</Label><CompactDateInput id="aff-start" disabled={readOnly || finishing || saving} required value={values.dateDebut} onValueChange={value => field('dateDebut', value)} /></div>
        <div className="space-y-2"><Label htmlFor="aff-end">Date de fin</Label><CompactDateInput id="aff-end" optional={!finishing} disabled={readOnly || saving} required={finishing} value={values.dateFin} onValueChange={value => field('dateFin', value)} /></div>
        <div className="space-y-2"><Label htmlFor="aff-status">Statut</Label><select id="aff-status" className="h-10 w-full rounded-md border bg-background px-3" disabled={readOnly || finishing || saving} required value={finishing ? 'SAF002' : values.statusId} onChange={event => field('statusId', event.target.value)}><option value="">Sélectionner un statut</option>{data?.statuses.map(row => <option key={row.id} value={row.id}>{row.label}</option>)}</select></div>
        <div className="space-y-2"><Label htmlFor="aff-notes">Observations</Label><Textarea id="aff-notes" disabled={readOnly || finishing || saving} maxLength={5000} value={values.observations} onChange={event => field('observations', event.target.value)} /></div>
        {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
        {!readOnly && <Button disabled={saving} type="submit">{saving ? 'Enregistrement…' : finishing ? 'Confirmer la fin' : 'Enregistrer'}</Button>}
      </form>
    </SheetContent></Sheet>
  </section>
}
