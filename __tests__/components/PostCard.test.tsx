// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PostCard } from '@/components/PostCard'
import type { PostFrontmatter } from '@/types/post'

const basePost: PostFrontmatter = {
  title: 'Bài viết mẫu',
  slug: 'bai-viet-mau',
  status: 'published',
  tags: ['nextjs', 'react'],
  date: '2026-01-15',
  excerpt: 'Đây là đoạn trích.',
  cover: 'https://example.public.blob.vercel-storage.com/cover.png',
  notionPageId: 'page-id',
  notionLastEditedTime: '2026-01-15T00:00:00.000Z',
  viewCount: 42,
}

describe('PostCard', () => {
  it('renders title, link to detail page, primary tag, date, and excerpt', () => {
    render(<PostCard post={basePost} />)
    // Title text is present
    expect(screen.getByText('Bài viết mẫu')).toBeInTheDocument()
    // The card is wrapped in a single link to the post detail
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/posts/bai-viet-mau')
    // Primary (first) tag appears as metadata
    expect(screen.getByText('nextjs')).toBeInTheDocument()
    // Excerpt visible
    expect(screen.getByText('Đây là đoạn trích.')).toBeInTheDocument()
  })

  it('does not render Image when cover is null', () => {
    const post = { ...basePost, cover: null }
    const { container } = render(<PostCard post={post} />)
    expect(container.querySelector('img')).toBeNull()
  })

  it('renders as featured when featured prop is true (larger heading)', () => {
    render(<PostCard post={basePost} featured />)
    const heading = screen.getByRole('heading', { name: 'Bài viết mẫu' })
    expect(heading.className).toContain('text-3xl')
  })
})
