export function paginateActorRows<T>(rows: T[], requestedPage: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const page = Math.max(1, Math.min(requestedPage, pageCount))
  return { items: rows.slice((page - 1) * pageSize, page * pageSize), page, pageCount, total: rows.length }
}