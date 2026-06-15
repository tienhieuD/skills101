import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

export interface BlogPaginationProps {
  currentPage: number
  totalPages: number
  basePath?: string
  searchParams?: Record<string, string | undefined>
}

function buildHref(
  basePath: string,
  page: number,
  params: Record<string, string | undefined>
): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v)
  }
  if (page > 1) sp.set('page', String(page))
  const qs = sp.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

export function BlogPagination({
  currentPage,
  totalPages,
  basePath = '/',
  searchParams = {},
}: BlogPaginationProps) {
  if (totalPages <= 1) return null

  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          {hasPrev ? (
            <PaginationPrevious
              href={buildHref(basePath, currentPage - 1, searchParams)}
              rel="prev"
              aria-label="Trang trước"
            />
          ) : (
            <PaginationPrevious
              aria-disabled="true"
              className="pointer-events-none opacity-50"
            />
          )}
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            {currentPage}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <span className="px-3 text-sm text-muted-foreground">/ {totalPages}</span>
        </PaginationItem>
        <PaginationItem>
          {hasNext ? (
            <PaginationNext
              href={buildHref(basePath, currentPage + 1, searchParams)}
              rel="next"
              aria-label="Trang sau"
            />
          ) : (
            <PaginationNext aria-disabled="true" className="pointer-events-none opacity-50" />
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
