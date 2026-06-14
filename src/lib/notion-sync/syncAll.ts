import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

import { getNotionClient, getTextProp } from './client'
import { syncPageObject } from './syncPost'

/**
 * Result of a batch sync run. `synced` and `skipped` follow `SyncStatus`
 * from `syncPost.ts`; `failed` tracks pages whose `syncPageObject` threw
 * (REQ-REL-002 — batch isolation, one bad page does not abort the run).
 */
export interface SyncResult {
  synced: number
  skipped: number
  failed: number
  failedSlugs: string[]
  /** ISO 8601 UTC timestamp captured at end of run. */
  syncedAt: string
}

/**
 * Syncs every Published/Archived page in the configured Notion database
 * (DB Design §2.1 — Draft pages are filtered out). When `sinceTimestamp`
 * is provided, only pages with `last_edited_time` after it are fetched
 * (TAD AD-04 — incremental filter).
 *
 * Each page is processed in isolation: a failure is logged as structured
 * JSON and counted, but does not stop the batch. The caller (route handler,
 * T-041/T-042) is responsible for updating `sync:last_run` and the
 * `sync:running` mutex.
 */
export async function syncAll(sinceTimestamp?: string): Promise<SyncResult> {
  const databaseId = process.env.NOTION_DATABASE_ID
  if (!databaseId) {
    throw new Error('Missing required env var: NOTION_DATABASE_ID')
  }

  const client = getNotionClient()

  const statusFilter = {
    or: [
      { property: 'Status', select: { equals: 'Published' } },
      { property: 'Status', select: { equals: 'Archived' } },
    ],
  }
  const timeFilter = sinceTimestamp
    ? {
        timestamp: 'last_edited_time' as const,
        last_edited_time: { after: sinceTimestamp },
      }
    : undefined
  const filter = timeFilter
    ? { and: [statusFilter, timeFilter] }
    : statusFilter

  const allPages: PageObjectResponse[] = []
  let cursor: string | undefined = undefined
  do {
    const response = await client.databases.query({
      database_id: databaseId,
      filter,
      start_cursor: cursor,
      page_size: 100,
    })
    for (const p of response.results) {
      if ('properties' in p) allPages.push(p as PageObjectResponse)
    }
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
  } while (cursor)

  const result: SyncResult = {
    synced: 0,
    skipped: 0,
    failed: 0,
    failedSlugs: [],
    syncedAt: '',
  }

  for (const page of allPages) {
    const slug = getTextProp(page.properties.Slug)
    try {
      const status = await syncPageObject(page)
      if (status === 'synced') result.synced++
      else result.skipped++
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          trigger: 'batch',
          pageId: page.id,
          slug,
          result: 'failed',
          error: message,
        }),
      )
      result.failed++
      result.failedSlugs.push(slug)
    }
  }

  result.syncedAt = new Date().toISOString()
  return result
}
