"use client"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ReactNode } from "react"
import type { Entente, Ligue } from "@/lib/types"
import { TerritoryForm, territoryStatus } from "@/components/territory/territory-form"
export type SavedEntente = Entente & { previousIdEntente?: string }
type Props = { entente?: Entente; ligues: Ligue[]; lockedLigue?: Ligue; onSaved: (value: SavedEntente) => void; trigger?: ReactNode }
function EntenteFormDialog({ entente, ligues, lockedLigue, onSaved, trigger }: Props) {
 return <TerritoryForm<SavedEntente> kind="ententes" entityId={entente?.idEntente} ligues={ligues} lockedLigue={lockedLigue} onSaved={onSaved} trigger={trigger} initial={{
 codeEntente:entente?.codeEntente || "", nomEntente:entente?.nomEntente || "", pseudoEntente:entente?.pseudoEntente || "", idLigue:entente?.idLigue || lockedLigue?.idLigue || "", idVille:entente?.idVille || "", emailEntente:entente?.emailEntente || "", statut:territoryStatus(entente?.statut), observations:entente?.observations || ""
 }} />
}
export function CreateEntenteDialog(props: Omit<Props, "entente">) { return <EntenteFormDialog {...props} /> }
export function EditEntenteDialog(props: Props & { entente: Entente }) { return <EntenteFormDialog {...props} trigger={props.trigger ?? <Button variant="ghost" size="icon" aria-label={`Modifier ${props.entente.nomEntente}`}><Pencil className="size-4" /></Button>} /> }

