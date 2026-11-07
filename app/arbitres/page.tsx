import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { ArbitresClient } from "@/components/arbitres/arbitres-client"
import { getIdentityArbitres as getArbitres } from "@/lib/actor-identity-reads"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"
import { ActorsConfigNotice } from "@/components/actors/actors-config-notice"
import { getArbitreLicences } from "@/lib/actor-records"
import { getActorSexes, getArbitreGrades } from "@/lib/actor-references"
import { ActorsLoadNotice } from "@/components/actors/actors-load-notice"
import { safeDataLoad } from "@/lib/safe-data-load"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function ArbitresPage() {
  const [arbitres, licences, sexes, grades] = await Promise.all([
    safeDataLoad(getArbitres, []), safeDataLoad(getArbitreLicences, []), safeDataLoad(getActorSexes, []), safeDataLoad(getArbitreGrades, []),
  ])

  return (
    <DashboardLayout>
      <Header title="Arbitres" subtitle="Gérez les arbitres officiels de la FEACO" />
      <div className="space-y-6 p-6">
        {!isActeursGoogleSheetsConfigured() && <ActorsConfigNotice />}
        <ActorsLoadNotice errors={[arbitres.error, licences.error, sexes.error, grades.error]} />
        <ArbitresClient arbitres={arbitres.data} licences={licences.data} sexes={sexes.data} grades={grades.data} />
      </div>
    </DashboardLayout>
  )
}
