import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { AthletesReadClient } from "@/components/athletes/athletes-read-client"
import { getAthleteReadSnapshot } from "@/lib/athletes-sheets-read"
import { AthleteReadError } from "@/lib/athlete-read-domain"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function AthletesPage() {
  let content
  try {
    const snapshot = await getAthleteReadSnapshot()
    content = <AthletesReadClient athletes={snapshot.athletes} />
  } catch (error) {
    const message = error instanceof AthleteReadError ? error.message : "Lecture des athlètes FEACO indisponible."
    content = <div role="alert" className="space-y-3 rounded-xl border border-destructive/50 p-6"><h2 className="font-semibold">Lecture des athlètes indisponible</h2><p>{message}</p><a href="/athletes" className="underline">Réessayer</a></div>
  }
  return <DashboardLayout>
    <Header title="Athlètes" subtitle="Liste des athlètes affiliés à la FEACO" statusLabel="Athlètes FEACO · Google Sheets · accès local" />
    <main className="space-y-6 p-4 sm:p-6">{content}</main>
  </DashboardLayout>
}