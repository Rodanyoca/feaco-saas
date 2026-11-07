import { Header } from "@/components/dashboard/header"
import { ActivitiesClient } from "@/components/activities/activities-client"
import { loadActivities } from "@/lib/activities"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function ActivitesPage() {
  let bundle: Awaited<ReturnType<typeof loadActivities>> = { activities: [], typeOptions: [] }
  let error = ""
  try { bundle = await loadActivities() } catch (reason) { error = reason instanceof Error ? reason.message : "Lecture des activités impossible." }
  return <><Header title="Activités" subtitle="Gestion des activités fédérales" /><main className="space-y-6 p-4 sm:p-6"><ActivitiesClient activities={bundle.activities} types={bundle.typeOptions} initialError={error} /></main></>
}
