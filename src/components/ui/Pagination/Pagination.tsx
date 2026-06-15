import Link from 'next/link'
import { buttonVariants } from '../Button/Button.variants'
import { cn } from '../theme/cn'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath?: string
  /** Additional query params to preserve in pagination links. */
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

/**
 * Previous/Next pagination with disabled edges. Renders nothing when totalPages ≤ 1.
 *
 * Uses Next.js `<Link>` styled with `buttonVariants` so SPA prefetching is preserved.
 *
 * @example
 * <Pagination currentPage={2} totalPages={5} basePath="/" searchParams={{ tag: 'nextjs' }} />
 */
export function Pagination({
  currentPage,
  totalPages,
  basePath = '/',
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null

  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages
  const linkClass = buttonVariants({ variant: 'secondary' })
  const disabledClass = cn(linkClass, 'opacity-50 cursor-not-allowed')

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
