import { Skeleton } from "@/components/ui/skeleton"
import { Header } from "@/components/dashboard/header"

export default function Loading() {
  return (
    <>
      <Header title="Licences des athlètes" subtitle="Licences enregistrées par saison et par structure territoriale" />
      <main className="space-y-6 p-4 sm:p-6">
        <Skeleton className="h-9 w-36" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </main>
    </>
  )
}
