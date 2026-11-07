import { NextResponse } from "next/server"
import { territoryAccess } from "@/lib/territory-access"
import { affiliationHistory } from "@/lib/feaco-affiliations-sheets"
import { AffiliationError } from "@/lib/feaco-affiliations-domain"
export const dynamic = "force-dynamic"
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
 const denied = territoryAccess(request)
 if (denied) return NextResponse.json({ message: "Acces local uniquement." }, { status: denied })
 try { const { id } = await context.params; return NextResponse.json(await affiliationHistory("coach", id), { headers: { "Cache-Control": "private, no-store" } }) }
 catch (error) { return NextResponse.json({ message: error instanceof AffiliationError ? error.message : "Lecture FEACO impossible." }, { status: error instanceof AffiliationError ? error.status : 503 }) }
}
