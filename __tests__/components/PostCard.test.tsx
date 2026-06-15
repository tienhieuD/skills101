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
  it('renders title, link, tags and excerpt', () => {
    render(<PostCard post={basePost} />)
    expect(screen.getByText('Bài viết mẫu')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: 'Bài viết mẫu' })
    expect(link).toHaveAttribute('href', '/posts/bai-viet-mau')
    expect(screen.getByText('nextjs')).toBeInTheDocument()
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('Đây là đoạn trích.')).toBeInTheDocument()
    expect(screen.getByText('42 lượt xem')).toBeInTheDocument()
  })

  it('does not render Image when cover is null', () => {
    const post = { ...basePost, cover: null }
    const { container } = render(<PostCard post={post} />)
    expect(container.querySelector('img')).toBeNull()
  })

  it('does not render viewCount when it is 0', () => {
    const post = { ...basePost, viewCount: 0 }
    render(<PostCard post={post} />)
    expect(screen.queryByText(/lượt xem/)).toBeNull()
  })
})
