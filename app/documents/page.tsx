import { Header } from "@/components/dashboard/header"
import { DocumentsClient } from "@/components/documents/documents-client"
import { loadDocuments } from "@/lib/documents"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function DocumentsPage() {
  let bundle: Awaited<ReturnType<typeof loadDocuments>> = { documents: [], typeOptions: [] }
  let error = ""
  try { bundle = await loadDocuments() } catch (reason) { error = reason instanceof Error ? reason.message : "Lecture des documents impossible." }
  return <><Header title="Documents" subtitle="Gestion documentaire de la FEACO" /><main className="space-y-6 p-4 sm:p-6"><DocumentsClient documents={bundle.documents} types={bundle.typeOptions} initialError={error} /></main></>
}
