// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BlogPagination } from '@/components/BlogPagination'

// shadcn pagination uses Next Link transparently via plain <a href>
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string
    children: React.ReactNode
    [key: string]: unknown
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

describe('BlogPagination', () => {
  it('renders nothing when totalPages <= 1', () => {
    const { container } = render(<BlogPagination currentPage={1} totalPages={1} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders previous and next anchors with correct hrefs in middle', () => {
    render(<BlogPagination currentPage={2} totalPages={3} />)
    const prev = screen.getByLabelText('Trang trước')
    const next = screen.getByLabelText('Trang sau')
    expect(prev).toHaveAttribute('href', '/')
    expect(next).toHaveAttribute('href', '/?page=3')
    expect(screen.getByText('/ 3')).toBeInTheDocument()
  })

  it('disables previous (aria-disabled) on first page', () => {
    render(<BlogPagination currentPage={1} totalPages={3} />)
    const prev = screen.getByLabelText('Go to previous page')
    expect(prev).toHaveAttribute('aria-disabled', 'true')
  })

  it('disables next (aria-disabled) on last page', () => {
    render(<BlogPagination currentPage={3} totalPages={3} />)
    const next = screen.getByLabelText('Go to next page')
    expect(next).toHaveAttribute('aria-disabled', 'true')
  })

  it('preserves searchParams in hrefs', () => {
    render(
      <BlogPagination
        currentPage={2}
        totalPages={5}
        searchParams={{ tag: 'nextjs', empty: '', undef: undefined }}
      />
    )
    const prev = screen.getByLabelText('Trang trước')
    const next = screen.getByLabelText('Trang sau')
    expect(prev).toHaveAttribute('href', '/?tag=nextjs')
    expect(next).toHaveAttribute('href', '/?tag=nextjs&page=3')
  })
})
