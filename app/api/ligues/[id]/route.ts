import { territoryApi } from "@/lib/territory-api"
export const runtime = "nodejs"
type Context = { params: Promise<{ id: string }> }
export async function GET(request: Request, context: Context) { return territoryApi(request, "ligues", (await context.params).id) }
export async function PATCH(request: Request, context: Context) { return territoryApi(request, "ligues", (await context.params).id) }

