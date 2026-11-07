import "server-only"
import { territoryService, territoryFixtureMode } from "@/lib/territory-sheets"
import { territoryView } from "@/lib/territory-view"
import { TerritoryError, type TerritoryKind } from "@/lib/territory-domain"
import { territoryAccess } from "@/lib/territory-access"

const singular = { ligues: "ligue", ententes: "entente", clubs: "club" } as const
export async function territoryApi(request: Request, kind: TerritoryKind, id?: string) {
  const access = territoryAccess(request)
  const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } })
  if (access) return json({ message: "Accès territorial local uniquement ; origine ou type de requête non autorisé." }, access)
  try {
    if (request.method === "GET") {
      const view = territoryView(await territoryService.read())
      if (id) {
        const found = view[kind].find(item => item.id === id)
        if (!found) throw new TerritoryError("Fiche introuvable.", 404)
        return json({ [singular[kind]]: found })
      }
      return json({ [kind]: view[kind], configured: true, source: territoryFixtureMode ? "test" : "sheets", diagnostics: view.diagnostics })
    }
    if (request.method !== "POST" && request.method !== "PATCH") return json({ message: "Méthode non autorisée." }, 405)
    if ((request.method === "PATCH") !== Boolean(id)) return json({ message: "Route invalide." }, 400)
    const body = await request.text()
    if (body.length > 16000) return json({ message: "Formulaire trop volumineux." }, 413)
    let payload: unknown
    try { payload = JSON.parse(body) } catch { return json({ message: "Formulaire JSON invalide." }, 400) }
    const saved = await territoryService.mutate(kind, payload, id)
    const view = territoryView(saved.snapshot)
    return json({ [singular[kind]]: view[kind].find(item => item.id === saved.id), message: "Enregistrement effectué." }, id ? 200 : 201)
  } catch (error) {
    return json({ message: error instanceof TerritoryError ? error.message : "Service territorial indisponible.", [kind]: [] }, error instanceof TerritoryError ? error.status : 503)
  }
}
