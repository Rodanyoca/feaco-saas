import { NextRequest, NextResponse } from "next/server"
import { territoryAccess } from "./lib/territory-access"
export function proxy(request: NextRequest) {
  if (/^\/api\/.*licences(?:\/|$)/.test(request.nextUrl.pathname)) return NextResponse.json({ message: "Le module Licences FEACO sera disponible prochainement." }, { status: 410 })
  if (/^\/(athletes|coachs|medecins)(?:\/|$)/.test(request.nextUrl.pathname)) {
    const denied = territoryAccess(request)
    if (denied) return NextResponse.json({ message: "Acces local uniquement." }, { status: denied })
    const response = NextResponse.next(); response.headers.set("Cache-Control", "private, no-store"); return response
  }
  if (/^\/api\/affiliations\/(athlete|coach|medecin)$/.test(request.nextUrl.pathname)) {
    const denied = territoryAccess(request)
    return denied ? NextResponse.json({ message: "Acces local uniquement." }, { status: denied }) : NextResponse.next()
  }
  if (/^\/(?:api\/)?(?:ligues|ententes|clubs)(?:\/|$)/.test(request.nextUrl.pathname)) {
    const denied = territoryAccess(request)
    if (denied) return NextResponse.json({ message: "Accès territorial local uniquement." }, { status: denied })
    if (request.nextUrl.pathname.startsWith("/api/") && !/^\/api\/(ligues|ententes|clubs)(\/[^/]+)?$/.test(request.nextUrl.pathname)) {
      return NextResponse.json({ message: "Route hors périmètre territorial." }, { status: 403 })
    }
    const response = NextResponse.next()
    response.headers.set("Cache-Control", "private, no-store")
    return response
  }
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const message = "Démonstration locale : aucune sauvegarde, suppression ou transmission de fichier n’a été effectuée."
    return NextResponse.json({ error: message, message }, { status: 409 })
  }
  return NextResponse.next()
}
export const config = { matcher: ["/api/:path*", "/ligues/:path*", "/ententes/:path*", "/clubs/:path*", "/athletes/:path*", "/coachs/:path*", "/medecins/:path*"] }
