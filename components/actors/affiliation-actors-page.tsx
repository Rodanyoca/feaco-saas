import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Header } from '@/components/dashboard/header'
import { AffiliationActorsClient } from '@/components/actors/affiliation-actors-client'
import { affiliationSnapshot } from '@/lib/feaco-affiliations-sheets'
import { affiliationSchema, AffiliationError, type AffiliationKind } from '@/lib/feaco-affiliations-domain'
export async function AffiliationActorsPage({ kind, title }: { kind: AffiliationKind; title: string }) {
  let content
  try {
    const data = await affiliationSnapshot()
    const actors = data.actors[kind].map(row => ({ id: row[affiliationSchema[kind].actor], name: row.nom_complet, idWa: row.id_wa }))
    content = <AffiliationActorsClient kind={kind} actors={actors} />
  } catch (error) { content = <div role="alert" className="rounded-lg border border-destructive p-6">{error instanceof AffiliationError ? error.message : 'Lecture FEACO indisponible.'}</div> }
  return <DashboardLayout><Header title={title} subtitle="Fiches FEACO et affiliations aux clubs" statusLabel="FEACO · Google Sheets · accès local" /><main className="space-y-6 p-6">{content}</main></DashboardLayout>
}
