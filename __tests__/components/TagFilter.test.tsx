// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TagFilter } from '@/components/TagFilter'

const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

beforeEach(() => {
  pushMock.mockReset()
})

describe('TagFilter', () => {
  it('renders an item for each tag', () => {
    render(<TagFilter allTags={['nextjs', 'react']} />)
    expect(screen.getByLabelText('Lọc theo tag nextjs')).toBeInTheDocument()
    expect(screen.getByLabelText('Lọc theo tag react')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tất cả' })).not.toBeInTheDocument()
  })

  it('marks active tag and shows "Tất cả" when activeTag is set', () => {
    render(<TagFilter allTags={['nextjs', 'react']} activeTag="nextjs" />)
    const active = screen.getByLabelText('Lọc theo tag nextjs')
    expect(active).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Tất cả' })).toBeInTheDocument()
  })

  it('calls router.push with /?tag=<tag> on click', () => {
    render(<TagFilter allTags={['nextjs', 'react']} />)
    fireEvent.click(screen.getByLabelText('Lọc theo tag react'))
    expect(pushMock).toHaveBeenCalledWith('/?tag=react')
  })

  it('does not render "Tất cả" without activeTag', () => {
    render(<TagFilter allTags={['nextjs']} />)
    expect(screen.queryByRole('button', { name: 'Tất cả' })).not.toBeInTheDocument()
  })

  it('"Tất cả" navigates to /', () => {
    render(<TagFilter allTags={['nextjs']} activeTag="nextjs" />)
    fireEvent.click(screen.getByRole('button', { name: 'Tất cả' }))
    expect(pushMock).toHaveBeenCalledWith('/')
  })
})
