import fs from 'fs'
import os from 'os'
import path from 'path'

import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/notion-sync/convert', () => ({
  pageToMarkdown: vi.fn(async () => '# Body\n\nHello world.\n'),
}))

vi.mock('@/lib/notion-sync/images', () => ({
  reHostMarkdownImages: vi.fn(async (md: string) => md),
  reHostImage: vi.fn(async (_url: string, pathname: string) =>
    `https://blob.vercel-storage.com/${pathname}`,
  ),
}))

function makePage(overrides: {
  id?: string
  lastEditedTime?: string
  title?: string
  slug?: string
  status?: 'Published' | 'Archived' | 'Draft' | null
  tags?: string[]
  date?: string | null
  excerpt?: string
  coverUrl?: string | null
}): PageObjectResponse {
  const {
    id = 'page-1',
    lastEditedTime = '2026-06-01T00:00:00.000Z',
    title = 'Hello',
    slug = 'hello',
    status = 'Published',
    tags = ['one'],
    date = '2026-06-01',
    excerpt = 'Short excerpt',
    coverUrl = null,
  } = overrides

  const properties: Record<string, unknown> = {
    Title: { type: 'title', title: [{ plain_text: title }] },
    Slug: { type: 'rich_text', rich_text: [{ plain_text: slug }] },
    Status:
      status === null
        ? { type: 'select', select: null }
        : { type: 'select', select: { name: status } },
    Tags: { type: 'multi_select', multi_select: tags.map((n) => ({ name: n })) },
    Date: { type: 'date', date: date ? { start: date } : null },
    Excerpt: { type: 'rich_text', rich_text: [{ plain_text: excerpt }] },
    Cover: {
      type: 'files',
      files: coverUrl
        ? [{ type: 'external', external: { url: coverUrl } }]
        : [],
    },
  }

  return {
    id,
    last_edited_time: lastEditedTime,
    properties,
  } as unknown as PageObjectResponse
}

describe('syncPageObject', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'syncpost-'))
    vi.stubEnv('POSTS_DIR', tmpDir)
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('writes a new MDX file when the post does not yet exist', async () => {
    const { syncPageObject } = await import('@/lib/notion-sync/syncPost')
    const page = makePage({ slug: 'new-post' })

    const result = await syncPageObject(page)

    expect(result).toBe('synced')
    const filePath = path.join(tmpDir, 'new-post.mdx')
    expect(fs.existsSync(filePath)).toBe(true)
    const text = fs.readFileSync(filePath, 'utf8')
    expect(text).toContain('slug: "new-post"')
    expect(text).toContain('status: "published"')
    expect(text).toContain('viewCount: 0')
    expect(text).toContain('# Body')
  })

  it('skips writing when notionLastEditedTime matches existing file', async () => {
    const { syncPageObject } = await import('@/lib/notion-sync/syncPost')
    const lastEdited = '2026-06-10T12:00:00.000Z'
    const slug = 'same-edit'
    const filePath = path.join(tmpDir, `${slug}.mdx`)
    fs.writeFileSync(
      filePath,
      `---\ntitle: "old"\nslug: "${slug}"\nstatus: "published"\ntags: []\ndate: null\nexcerpt: null\ncover: null\nnotionPageId: "p"\nnotionLastEditedTime: "${lastEdited}"\nviewCount: 42\n---\nold content`,
    )
    const before = fs.readFileSync(filePath, 'utf8')

    const convertMod = await import('@/lib/notion-sync/convert')
    vi.mocked(convertMod.pageToMarkdown).mockClear()

    const page = makePage({ slug, lastEditedTime: lastEdited })
    const result = await syncPageObject(page)

    expect(result).toBe('skipped')
    expect(fs.readFileSync(filePath, 'utf8')).toBe(before)
    expect(convertMod.pageToMarkdown).not.toHaveBeenCalled()
  })

  it('updates the file when notionLastEditedTime is newer, preserving viewCount', async () => {
    const { syncPageObject } = await import('@/lib/notion-sync/syncPost')
    const slug = 'updated'
    const filePath = path.join(tmpDir, `${slug}.mdx`)
    fs.writeFileSync(
      filePath,
      `---\ntitle: "old"\nslug: "${slug}"\nstatus: "published"\ntags: []\ndate: null\nexcerpt: null\ncover: null\nnotionPageId: "p"\nnotionLastEditedTime: "2026-06-01T00:00:00.000Z"\nviewCount: 99\n---\nold content`,
    )

    const page = makePage({
      slug,
      lastEditedTime: '2026-06-12T00:00:00.000Z',
      title: 'New title',
    })
    const result = await syncPageObject(page)

    expect(result).toBe('synced')
    const text = fs.readFileSync(filePath, 'utf8')
    expect(text).toContain('title: "New title"')
    expect(text).toContain('viewCount: 99')
    expect(text).toContain('notionLastEditedTime: "2026-06-12T00:00:00.000Z"')
  })

  it('returns skipped for Draft status without invoking pageToMarkdown', async () => {
    const convertMod = await import('@/lib/notion-sync/convert')
    vi.mocked(convertMod.pageToMarkdown).mockClear()
    const { syncPageObject } = await import('@/lib/notion-sync/syncPost')

    const page = makePage({ slug: 'draft-post', status: 'Draft' })
    const result = await syncPageObject(page)

    expect(result).toBe('skipped')
    expect(convertMod.pageToMarkdown).not.toHaveBeenCalled()
    expect(fs.existsSync(path.join(tmpDir, 'draft-post.mdx'))).toBe(false)
  })

  it('writes status: archived for an Archived page', async () => {
    const { syncPageObject } = await import('@/lib/notion-sync/syncPost')
    const page = makePage({ slug: 'archived-post', status: 'Archived' })

    const result = await syncPageObject(page)

    expect(result).toBe('synced')
    const text = fs.readFileSync(
      path.join(tmpDir, 'archived-post.mdx'),
      'utf8',
    )
    expect(text).toContain('status: "archived"')
  })
})
