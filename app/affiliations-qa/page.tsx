import { notFound } from 'next/navigation'
import { AffiliationActorsClient } from '@/components/actors/affiliation-actors-client'
export default function Page() {
  if (process.env.NODE_ENV !== 'development' || process.env.FEACO_AFFILIATIONS_QA !== '1') notFound()
  return <main className="space-y-8 p-6"><h1>Test Affiliations — données simulées uniquement</h1>{(['athlete', 'coach', 'medecin'] as const).map(kind => <section key={kind} data-testid={kind}><h2>{kind}</h2><AffiliationActorsClient kind={kind} actors={[{ id: 'TEST', name: `Acteur test ${kind}`, idWa: 'WA-TEST' }]} /></section>)}</main>
}
