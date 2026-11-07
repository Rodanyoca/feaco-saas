import { NextResponse } from 'next/server'
import { territoryAccess } from '@/lib/territory-access'
import { AffiliationError, affiliationKinds, type AffiliationKind } from '@/lib/feaco-affiliations-domain'
import { affiliationHistory, mutateAffiliation } from '@/lib/feaco-affiliations-sheets'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
async function handle(request: Request, context: { params: Promise<{ kind: string }> }) {
  try {
    const denied = territoryAccess(request)
    if (denied) return NextResponse.json({ message: 'Accès local uniquement.' }, { status: denied })
    const { kind } = await context.params
    if (!affiliationKinds.includes(kind as AffiliationKind)) throw new AffiliationError('Catégorie hors périmètre.', 404)
    const data = request.method === 'GET'
      ? await affiliationHistory(kind as AffiliationKind, new URL(request.url).searchParams.get('actorId') || '')
      : await mutateAffiliation(kind as AffiliationKind, await request.json(), request.method === 'POST' ? 'create' : request.method === 'PATCH' ? 'terminate' : 'update')
    return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return NextResponse.json({ message: error instanceof AffiliationError ? error.message : 'Requête affiliations impossible.' }, { status: error instanceof AffiliationError ? error.status : 400 })
  }
}
export { handle as GET, handle as POST, handle as PUT, handle as PATCH }
