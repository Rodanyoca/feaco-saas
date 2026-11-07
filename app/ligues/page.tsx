import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { LiguesClient } from "@/components/ligues/ligues-client"
import { territoryService, territoryFixtureMode } from "@/lib/territory-sheets"
import { territoryView } from "@/lib/territory-view"
import { TerritoryError } from "@/lib/territory-domain"
import { Header } from "@/components/dashboard/header"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function Page() {
  try {
    const data = territoryView(await territoryService.read())
    return <DashboardLayout>{territoryFixtureMode && <p role="status" className="border-b border-amber-500 p-3 text-sm">TEST SIMULE : stockage en memoire, aucune ecriture Google Sheets.</p>}<LiguesClient ligues={data.ligues} ententes={data.ententes} clubs={data.clubs} provinceOptions={data.provinces} relationsReady={true} />{data.diagnostics.length > 0 && <p role="alert" className="p-6 text-destructive">{data.diagnostics.join(" ")}</p>}</DashboardLayout>
  } catch (error) {
    return <DashboardLayout><Header title="Ligues" /><div role="alert" className="m-6 rounded-xl border border-destructive/30 p-6"><h2 className="font-semibold">Chargement impossible</h2><p>{error instanceof TerritoryError ? error.message : "Service territorial indisponible."}</p><a className="mt-4 inline-block underline" href="/ligues">Réessayer</a></div></DashboardLayout>
  }
}
