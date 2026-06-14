import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const queryMock = vi.fn()
const syncPageObjectMock = vi.fn()

vi.mock('@/lib/notion-sync/client', async () => {
  const actual = await vi.importActual<
    typeof import('@/lib/notion-sync/client')
  >('@/lib/notion-sync/client')
  return {
    ...actual,
    getNotionClient: () => ({
      databases: { query: queryMock },
    }),
  }
})

vi.mock('@/lib/notion-sync/syncPost', () => ({
  syncPageObject: (page: PageObjectResponse) => syncPageObjectMock(page),
}))

import { syncAll } from '@/lib/notion-sync/syncAll'

function makePage(id: string, slug: string): PageObjectResponse {
  return {
    id,
    properties: {
      Slug: { type: 'rich_text', rich_text: [{ plain_text: slug }] },
    },
  } as unknown as PageObjectResponse
}

describe('syncAll', () => {
  beforeEach(() => {
    process.env.NOTION_DATABASE_ID = 'db-1'
    queryMock.mockReset()
    syncPageObjectMock.mockReset()
  })

  afterEach(() => {
    delete process.env.NOTION_DATABASE_ID
  })

  it('syncs 3 pages successfully', async () => {
    queryMock.mockResolvedValueOnce({
      results: [makePage('p1', 'slug1'), makePage('p2', 'slug2'), makePage('p3', 'slug3')],
      has_more: false,
      next_cursor: null,
    })
    syncPageObjectMock.mockResolvedValue('synced')

    const result = await syncAll()

    expect(result.synced).toBe(3)
    expect(result.skipped).toBe(0)
    expect(result.failed).toBe(0)
    expect(result.failedSlugs).toEqual([])
    expect(() => new Date(result.syncedAt).toISOString()).not.toThrow()
    expect(result.syncedAt).toBe(new Date(result.syncedAt).toISOString())
  })

  it('isolates a failing page so others still sync', async () => {
    queryMock.mockResolvedValueOnce({
      results: [makePage('p1', 'slug1'), makePage('p2', 'slug2'), makePage('p3', 'slug3')],
      has_more: false,
      next_cursor: null,
    })
    syncPageObjectMock
      .mockResolvedValueOnce('synced')
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce('synced')

    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await syncAll()

    expect(result.synced).toBe(2)
    expect(result.failed).toBe(1)
    expect(result.failedSlugs).toEqual(['slug2'])
    errSpy.mockRestore()
  })

  it('paginates across multiple pages', async () => {
    queryMock
      .mockResolvedValueOnce({
        results: [makePage('p1', 'slug1'), makePage('p2', 'slug2')],
        has_more: true,
        next_cursor: 'cursor-2',
      })
      .mockResolvedValueOnce({
        results: [makePage('p3', 'slug3')],
        has_more: false,
        next_cursor: null,
      })
    syncPageObjectMock.mockResolvedValue('synced')

    const result = await syncAll()

    expect(queryMock).toHaveBeenCalledTimes(2)
    expect(queryMock.mock.calls[1]?.[0].start_cursor).toBe('cursor-2')
    expect(syncPageObjectMock).toHaveBeenCalledTimes(3)
    expect(result.synced).toBe(3)
  })
})
