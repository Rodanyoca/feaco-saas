"use client"

import { useId, useState, type ReactNode } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { CompactDateInput } from "@/components/ui/compact-date-input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Ligue, Entente, Province } from "@/lib/types"
import type { TerritoryKind } from "@/lib/territory-domain"

type Option = { id: string; nom: string }
type Props<T> = {
  kind: TerritoryKind; entityId?: string; initial: Record<string, string>; onSaved: (value: T) => void;
  trigger?: ReactNode; provinces?: Province[]; ligues?: Ligue[]; ententes?: Entente[];
  categories?: Option[]; sexes?: Option[]; lockedLigue?: Ligue
}
const labels = { ligues: "ligue", ententes: "entente", clubs: "club" }
const singular = { ligues: "ligue", ententes: "entente", clubs: "club" }

export function TerritoryForm<T>({ kind, entityId, initial, onSaved, trigger, provinces = [], ligues = [], ententes = [], categories = [], sexes = [], lockedLigue }: Props<T>) {
  const editing = Boolean(entityId), noun = labels[kind]
  const prefix = useId()
  const [open, setOpen] = useState(false), [pending, setPending] = useState(false), [error, setError] = useState("")
  const [form, setForm] = useState(initial)
  const set = (key: string, value: string) => setForm(previous => ({ ...previous, [key]: value }))
  const chooseLeague = (value: string) => setForm(previous => ({ ...previous, idLigue: value, ...(kind === "clubs" ? { idEntente: "" } : {}) }))
  const chooseEntente = (value: string) => {
    const entente = ententes.find(item => item.idEntente === value)
    setForm(previous => ({ ...previous, idEntente: value, ...(kind === "clubs" ? { idLigue: entente?.idLigue ?? "" } : {}) }))
  }
  const title = `${editing ? "Modifier" : "Ajouter"} ${noun === "club" ? "un" : "une"} ${noun}`
  const fields = {
    text(key: string, label: string, required = false, length?: number, disabled = false, type = "text") {
      return <div className="space-y-2" key={key}><Label htmlFor={`${prefix}-${key}`}>{label}{required && " *"}</Label><Input id={`${prefix}-${key}`} type={type} required={required} disabled={disabled} value={form[key] ?? ""} inputMode={length ? "numeric" : undefined} pattern={length ? `[0-9]{${length}}` : undefined} maxLength={length} onChange={event => set(key, length ? event.target.value.replace(/\D/g, "").slice(0, length) : event.target.value)} /></div>
    },
    select(key: string, label: string, options: Option[], required = false, disabled = false) {
      return <div className="space-y-2" key={key}><Label htmlFor={`${prefix}-${key}`}>{label}{required && " *"}</Label><Select required={required} disabled={disabled} value={form[key] || (required ? "" : "__EMPTY")} onValueChange={value => key === "idLigue" ? chooseLeague(value) : key === "idEntente" ? chooseEntente(value === "__EMPTY" ? "" : value) : set(key, value === "__EMPTY" ? "" : value)}><SelectTrigger id={`${prefix}-${key}`}><SelectValue placeholder={`Sélectionner ${label.toLowerCase()}`} /></SelectTrigger><SelectContent>{!required && <SelectItem value="__EMPTY">Non renseigné</SelectItem>}{options.filter(option => option.id).map(option => <SelectItem key={option.id} value={option.id}>{option.nom}</SelectItem>)}</SelectContent></Select></div>
    },
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setPending(true)
    try {
      const response = await fetch(`/api/${kind}${editing ? `/${encodeURIComponent(entityId!)}` : ""}`, {
        method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || "Enregistrement impossible.")
      onSaved(result[singular[kind]] as T)
      toast.success(result.message)
      setOpen(false)
      if (!editing) setForm(initial)
    } catch (cause) { const message = cause instanceof Error ? cause.message : "Enregistrement impossible."; setError(message); toast.error(message) }
    finally { setPending(false) }
  }
  return <Sheet open={open} onOpenChange={value => { if (!pending) { setOpen(value); if (value) { setForm(initial); setError("") } } }}>
    <SheetTrigger asChild>{trigger ?? <Button variant={editing ? "outline" : "default"} className={editing ? "hover:border-brand-gold/60 hover:bg-brand-gold/10 hover:text-brand-gold" : "bg-brand-gold text-[#071827] hover:bg-brand-gold/90"}>{title}</Button>}</SheetTrigger>
    <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
      <SheetHeader><SheetTitle>{title}</SheetTitle><SheetDescription>{editing ? "L’identifiant, le code et le parent restent inchangés." : kind === "ligues" ? "Utiliser uniquement un code absent parmi les 26 codes existants." : kind === "ententes" ? "Identifiant : code ligue + code entente sur deux chiffres." : "Identifiant : ID entente + code club sur trois chiffres."}</SheetDescription></SheetHeader>
      <form onSubmit={submit} className="space-y-6 px-4 pb-24">
        <div className="grid gap-4 sm:grid-cols-2">
          {editing && <div className="space-y-2"><Label htmlFor={`${prefix}-id`}>Identifiant</Label><Input id={`${prefix}-id`} value={entityId} disabled /></div>}
          {kind === "ligues" && <>{!editing && fields.text("idLigue", "Code ligue", true, 2)}{fields.text("nomLigue", "Nom de la ligue", true)}{fields.text("sigleLigue", "Pseudo")}{fields.select("idProvince", "Province", provinces.map(p => ({ id: p.idProvince, nom: p.nomProvince })), true)}{fields.text("emailLigue", "Adresse e-mail", false, undefined, false, "email")}</>}
          {kind === "ententes" && <>{fields.text("codeEntente", "Code de l’entente", true, 2, editing)}{fields.select("idLigue", "Ligue", ligues.map(l => ({ id: l.idLigue, nom: `${l.idLigue} · ${l.nomLigue}` })), true, editing || Boolean(lockedLigue))}{fields.text("nomEntente", "Nom de l’entente", true)}{fields.text("pseudoEntente", "Pseudo")}{fields.text("emailEntente", "Adresse e-mail", false, undefined, false, "email")}{fields.text("idVille", "Identifiant de ville")}</>}
          {kind === "clubs" && <>{fields.text("codeClub", "Code du club", true, 3, editing)}{fields.select("idEntente", "Entente", ententes.map(e => ({ id: e.idEntente, nom: `${e.idEntente} · ${e.nomEntente}` })), true, editing || ententes.length === 0)}{ententes.length === 0 && <p className="text-sm text-muted-foreground sm:col-span-2">Aucune entente disponible. Créez d’abord une entente.</p>}{fields.text("nomClub", "Nom du club", true)}{fields.select("idCategorieClub", "Catégorie", categories)}{fields.select("idSexe", "Sexe", sexes)}{fields.text("idVille", "Identifiant de ville")}<div className="space-y-2"><Label htmlFor={`${prefix}-date`}>Date d’affiliation</Label><CompactDateInput id={`${prefix}-date`} optional value={form.dateAffiliationClub || ""} onValueChange={value => set("dateAffiliationClub", value)} /></div></>}
          {fields.select("statut", "Statut", [{ id: "ACTIF", nom: "Actif" }, { id: "INACTIF", nom: "Inactif" }])}
          <div className="space-y-2 sm:col-span-2"><Label htmlFor={`${prefix}-observations`}>Observations</Label><Textarea id={`${prefix}-observations`} value={form.observations || ""} onChange={event => set("observations", event.target.value)} /></div>
        </div>
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        <SheetFooter className="px-0"><Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>Annuler</Button><Button type="submit" disabled={pending} className="bg-brand-gold text-[#071827] hover:bg-brand-gold/90">{pending ? "Enregistrement…" : "Enregistrer"}</Button></SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
}

export function territoryStatus(value?: string) {
  const normalized = (value || "").toUpperCase()
  return normalized === "ACTIVE" ? "ACTIF" : normalized === "INACTIVE" ? "INACTIF" : normalized
}
