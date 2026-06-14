import fs from 'fs'
import os from 'os'
import path from 'path'
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'

let tempDir: string
let posts: typeof import('@/lib/posts')

type FM = {
  title?: string
  slug?: string
  status?: string
  tags?: string[]
  date?: string | null
  excerpt?: string | null
  cover?: string | null
  notionPageId?: string
  notionLastEditedTime?: string
  viewCount?: number
}

function writePost(slug: string, fm: FM, content = '# Hello\n\nBody.') {
  const lines = ['---']
  for (const [k, v] of Object.entries(fm)) {
    if (Array.isArray(v)) {
      lines.push(`${k}: [${v.map((x) => `"${x}"`).join(', ')}]`)
    } else if (v === null) {
      lines.push(`${k}: null`)
    } else if (typeof v === 'string') {
      lines.push(`${k}: "${v}"`)
    } else {
      lines.push(`${k}: ${v}`)
    }
  }
  lines.push('---', '', content)
  fs.writeFileSync(path.join(tempDir, `${slug}.mdx`), lines.join('\n'))
}

function validFM(over: Partial<FM> = {}): FM {
  return {
    title: 'Title',
    slug: 'placeholder',
    status: 'published',
    tags: ['a'],
    date: '2025-01-01',
    excerpt: 'ex',
    cover: null,
    notionPageId: 'page-id',
    notionLastEditedTime: '2025-01-01T00:00:00.000Z',
    viewCount: 0,
    ...over,
  }
}

beforeEach(async () => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-test-'))
  vi.stubEnv('POSTS_DIR', tempDir)
  vi.resetModules()
  posts = await import('@/lib/posts')
})

afterEach(() => {
  fs.rmSync(tempDir, { recursive: true, force: true })
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('getPost', () => {
  it('returns Post for existing slug', () => {
    writePost('hello', validFM({ slug: 'hello', title: 'Hello' }), '# Body')
    const p = posts.getPost('hello')
    expect(p).not.toBeNull()
    expect(p!.title).toBe('Hello')
    expect(p!.slug).toBe('hello')
    expect(p!.content).toContain('# Body')
  })

  it('returns null for missing slug', () => {
    expect(posts.getPost('nope')).toBeNull()
  })
})

describe('getAllPosts', () => {
  it('returns only published, sorted by date desc', () => {
    writePost('a', validFM({ slug: 'a', date: '2025-01-01' }))
    writePost('b', validFM({ slug: 'b', date: '2025-03-01' }))
    writePost('c', validFM({ slug: 'c', date: '2025-02-01' }))
    const all = posts.getAllPosts()
    expect(all.map((p) => p.slug)).toEqual(['b', 'c', 'a'])
  })

  it('excludes archived posts', () => {
    writePost('pub', validFM({ slug: 'pub', status: 'published' }))
    writePost('arc', validFM({ slug: 'arc', status: 'archived' }))
    const all = posts.getAllPosts()
    expect(all.map((p) => p.slug)).toEqual(['pub'])
  })
})

describe('getAllSlugs', () => {
  it('returns slugs from filenames (not frontmatter)', () => {
    writePost('file-slug', validFM({ slug: 'different-slug' }))
    const slugs = posts.getAllSlugs()
    expect(slugs).toEqual(['file-slug'])
  })
})

describe('paginatePosts', () => {
  it('paginates correctly with 25 posts', () => {
    const list: import('@/types/post').PostFrontmatter[] = Array.from({ length: 25 }, (_, i) => ({
      title: `T${i}`,
      slug: `s${i}`,
      status: 'published' as const,
      tags: [],
      date: '2025-01-01',
      excerpt: null,
      cover: null,
      notionPageId: `p${i}`,
      notionLastEditedTime: '2025-01-01T00:00:00.000Z',
      viewCount: 0,
    }))
    const p1 = posts.paginatePosts(list, 1)
    expect(p1.totalPages).toBe(3)
    expect(p1.currentPage).toBe(1)
    expect(p1.posts).toHaveLength(10)
    expect(p1.posts[0]!.slug).toBe('s0')

    const p3 = posts.paginatePosts(list, 3)
    expect(p3.currentPage).toBe(3)
    expect(p3.posts).toHaveLength(5)

    const clamped = posts.paginatePosts(list, 99)
    expect(clamped.currentPage).toBe(3)
  })
})

describe('malformed handling', () => {
  it('console.warn on malformed file and skips', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // Missing required fields (no notionPageId)
    writePost('bad', { title: 'X', slug: 'bad', status: 'published', tags: [] })
    const result = posts.getPost('bad')
    expect(result).toBeNull()
    expect(warn).toHaveBeenCalled()
  })
})
