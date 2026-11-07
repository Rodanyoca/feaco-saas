"use client"

import { paginateActorRows } from "@/lib/actor-list-state"
import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function useActorPagination<T>(rows: T[]) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const pagination = paginateActorRows(rows, page, pageSize)
  useEffect(() => setPage(1), [rows, pageSize])
  return { ...pagination, pageSize, setPage, setPageSize }
}

export function ActorListPagination({ page, pageSize, pageCount, total, setPage, setPageSize }: {
  page: number; pageSize: number; pageCount: number; total: number
  setPage: (value: number) => void; setPageSize: (value: number) => void
}) {
  return <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="flex items-center gap-2 text-sm text-muted-foreground"><span>Afficher</span>
      <Select value={String(pageSize)} onValueChange={value => setPageSize(Number(value))}><SelectTrigger className="w-[70px]" aria-label="Nombre de lignes"><SelectValue /></SelectTrigger><SelectContent>{[10,25,50,100].map(size => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent></Select>
      <span aria-live="polite">sur {total} résultat{total > 1 ? "s" : ""}</span>
    </div>
    <nav aria-label="Pagination" className="flex items-center gap-2"><Button type="button" variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Page précédente"><ChevronLeft className="size-4" /></Button><span className="text-sm text-muted-foreground">Page {page} sur {pageCount}</span><Button type="button" variant="outline" size="sm" disabled={page === pageCount} onClick={() => setPage(page + 1)} aria-label="Page suivante"><ChevronRight className="size-4" /></Button></nav>
  </div>
}
