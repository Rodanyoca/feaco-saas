import { getAthleteReadSnapshot } from "@/lib/athletes-sheets-read"
import { AthleteReadError } from "@/lib/athlete-read-domain"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"

export const runtime = "nodejs"

export async function POST(request: Request) {
  if (!isActeursGoogleSheetsConfigured()) return NextResponse.json({ message: "Le classeur Acteurs n’est pas configuré." }, { status: 503 })
  try {
    const { createAthlete } = await import("@/lib/athlete-mutations")
    const athlete = await createAthlete(await request.json())
    revalidatePath("/athletes")
    return NextResponse.json({ message: "L’athlète a été créé avec succès.", athlete }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Création impossible."
    return NextResponse.json({ message }, { status: message.includes("existe déjà") ? 409 : 400 })
  }
}

export async function GET() {
  try {
    return NextResponse.json(await getAthleteReadSnapshot(), { headers: { "Cache-Control": "private, no-store" } })
  } catch (error) {
    return NextResponse.json({ message: error instanceof AthleteReadError ? error.message : "Lecture FEACO indisponible." }, { status: 503, headers: { "Cache-Control": "private, no-store" } })
  }
}
