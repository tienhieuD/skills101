// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Pagination } from '@/components/ui'

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

describe('Pagination', () => {
  it('renders nothing when totalPages <= 1', () => {
    const { container } = render(<Pagination currentPage={1} totalPages={1} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders Previous and Next links with correct hrefs when in middle', () => {
    render(<Pagination currentPage={2} totalPages={3} />)
    const prev = screen.getByRole('link', { name: /trang trước/i })
    const next = screen.getByRole('link', { name: /trang sau/i })
    expect(prev).toHaveAttribute('href', '/')
    expect(next).toHaveAttribute('href', '/?page=3')
    expect(screen.getByText('Trang 2 / 3')).toBeInTheDocument()
  })

  it('disables Previous on first page', () => {
    render(<Pagination currentPage={1} totalPages={3} />)
    expect(screen.queryByRole('link', { name: /trang trước/i })).toBeNull()
    const disabled = screen.getByText('Previous')
    expect(disabled.tagName).toBe('SPAN')
    expect(disabled).toHaveAttribute('aria-disabled', 'true')
  })

  it('disables Next on last page', () => {
    render(<Pagination currentPage={3} totalPages={3} />)
    expect(screen.queryByRole('link', { name: /trang sau/i })).toBeNull()
    const disabled = screen.getByText('Next')
    expect(disabled.tagName).toBe('SPAN')
    expect(disabled).toHaveAttribute('aria-disabled', 'true')
  })

  it('preserves searchParams in href', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        searchParams={{ tag: 'nextjs', empty: '', undef: undefined }}
      />
    )
    const prev = screen.getByRole('link', { name: /trang trước/i })
    const next = screen.getByRole('link', { name: /trang sau/i })
    expect(prev).toHaveAttribute('href', '/?tag=nextjs')
    expect(next).toHaveAttribute('href', '/?tag=nextjs&page=3')
  })
})
