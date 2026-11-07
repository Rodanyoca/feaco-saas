import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { ActorsConfigNotice } from "@/components/actors/actors-config-notice"
import { ActorsLoadNotice } from "@/components/actors/actors-load-notice"
import { AutresActeursClient } from "@/components/autres-acteurs/autres-acteurs-client"
import { loadAutresActeurs } from "@/lib/autres-acteurs"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"
import { safeDataLoad } from "@/lib/safe-data-load"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function AutresActeursPage() {
  const loaded = await safeDataLoad(loadAutresActeurs, { acteurs: [], types: [], sexes: [] })
  return <DashboardLayout><Header title="Autres acteurs" subtitle="Gérez les personnes de contact et les autres acteurs de la FEACO" /><main className="space-y-6 p-4 sm:p-6">{!isActeursGoogleSheetsConfigured() && <ActorsConfigNotice />}<ActorsLoadNotice errors={[loaded.error]} /><AutresActeursClient {...loaded.data} /></main></DashboardLayout>
}
