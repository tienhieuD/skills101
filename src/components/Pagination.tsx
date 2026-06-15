import Link from 'next/link'

interface PaginationProps {
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

export function Pagination({
  currentPage,
  totalPages,
  basePath = '/',
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null

  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages

  const linkClass =
    'inline-flex items-center px-4 py-2 min-h-[44px] rounded border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--gray-100)] dark:hover:bg-[var(--gray-800)]'
  const disabledClass =
    'inline-flex items-center px-4 py-2 min-h-[44px] rounded border border-[var(--border)] text-[var(--gray-400)] opacity-50 cursor-not-allowed'

  return (
    <nav aria-label="Phân trang" className="flex items-center justify-between gap-4 py-4">
      {hasPrev ? (
        <Link
          href={buildHref(basePath, currentPage - 1, searchParams)}
          className={linkClass}
          aria-label="Trang trước"
          rel="prev"
        >
          Previous
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled="true">
          Previous
        </span>
      )}

      <span className="text-sm text-[var(--gray-600)]">
        Trang {currentPage} / {totalPages}
      </span>

      {hasNext ? (
        <Link
          href={buildHref(basePath, currentPage + 1, searchParams)}
          className={linkClass}
          aria-label="Trang sau"
          rel="next"
        >
          Next
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled="true">
          Next
        </span>
      )}
    </nav>
  )
}
