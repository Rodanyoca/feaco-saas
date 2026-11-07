import { Header } from "@/components/dashboard/header"
import { CompetitionsClient } from "@/components/competitions/competitions-client"
import { loadCompetitionBundle } from "@/lib/competitions-v2"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function CompetitionsPage() {
  let bundle: Awaited<ReturnType<typeof loadCompetitionBundle>> = { competitions: [], references: {}, referenceData: {}, data: {} }
  let error = ""
  try { bundle = await loadCompetitionBundle() } catch (reason) { error = reason instanceof Error ? reason.message : "Lecture des compétitions impossible." }
  return <>
    <Header title="Compétitions" subtitle="Toutes les compétitions FEACO" />
    <main className="space-y-6 p-4 sm:p-6"><CompetitionsClient competitions={bundle.competitions} references={bundle.references} initialError={error} /></main>
  </>
}
