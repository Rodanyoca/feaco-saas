import { getAthleteReadSnapshot } from "@/lib/athletes-sheets-read"
import { AthleteReadError } from "@/lib/athlete-read-domain"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"

export const runtime = "nodejs"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isActeursGoogleSheetsConfigured()) return NextResponse.json({ message: "Le classeur Acteurs n’est pas configuré." }, { status: 503 })
  try {
    const { updateAthlete } = await import("@/lib/athlete-mutations")
    const { id } = await context.params
    const athlete = await updateAthlete(decodeURIComponent(id), await request.json())
    revalidatePath("/athletes")
    return NextResponse.json({ message: "L’athlète a été modifié avec succès.", athlete })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Modification impossible."
    return NextResponse.json({ message }, { status: message === "Athlète introuvable." ? 404 : 400 })
  }
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const snapshot = await getAthleteReadSnapshot()
    const athlete = snapshot.athletes.find(row => row.idAthlete === id)
    if (!athlete) return NextResponse.json({ message: "Athlete introuvable." }, { status: 404, headers: { "Cache-Control": "private, no-store" } })
    return NextResponse.json({ athlete, source: snapshot.source }, { headers: { "Cache-Control": "private, no-store" } })
  } catch (error) {
    return NextResponse.json({ message: error instanceof AthleteReadError ? error.message : "Lecture FEACO indisponible." }, { status: 503, headers: { "Cache-Control": "private, no-store" } })
  }
}
