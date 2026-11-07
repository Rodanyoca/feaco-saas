import { territoryApi } from "@/lib/territory-api"
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const GET = (request: Request) => territoryApi(request, "ententes")
export const POST = (request: Request) => territoryApi(request, "ententes")

