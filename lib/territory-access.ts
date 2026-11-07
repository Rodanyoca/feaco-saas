/** Local-only boundary until FEACO user/session resources exist. No FEVOCO cookies. */
export function territoryAccess(request: Request): number | null {
  const url = new URL(request.url)
  const host = request.headers.get("host") || url.host
  let authority: URL
  try { authority = new URL(`${url.protocol}//${host}`) } catch { return 403 }
  if (!["127.0.0.1", "localhost", "[::1]"].includes(authority.hostname)) return 403
  // Never trust forwarded identity/authority headers in a local application.
  if (request.headers.has("x-forwarded-host") && request.headers.get("x-forwarded-host") !== host) return 403
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    if (request.headers.get("origin") !== authority.origin) return 403
    if (!request.headers.get("content-type")?.startsWith("application/json")) return 415
  }
  return null
}
