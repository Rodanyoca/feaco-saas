import { notFound } from "next/navigation"
import { CompetitionDetailV2 } from "@/components/competitions/competition-detail-v2"
import { competitionData, loadCompetitionBundle } from "@/lib/competitions-v2"
import { competitionEntryOptions } from "@/lib/competition-entries"
import { competitionPeopleOptions } from "@/lib/competition-people"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function CompetitionPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  const [bundle, entryOptions] = await Promise.all([loadCompetitionBundle(), competitionEntryOptions()])
  const peopleOptions = await competitionPeopleOptions(decodeURIComponent(id), bundle)
  const detail = competitionData(bundle, decodeURIComponent(id))
  if (!detail) notFound()
  const distinctionTargets = Object.fromEntries((bundle.referenceData.TYPES_DISTINCTIONS ?? []).map((row) => [String(row.id_type_distinction ?? ""), String(row.cible_autorisee ?? "")]))
  return <CompetitionDetailV2 detail={detail} references={bundle.references} entryOptions={entryOptions} peopleOptions={peopleOptions} distinctionTargets={distinctionTargets} activeTab={query.tab ?? "general"} />
}
