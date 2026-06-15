import { timingSafeEqual } from 'crypto'

import { kv } from '@vercel/kv'
import { NextResponse, type NextRequest } from 'next/server'

import { apiError } from '@/lib/api-error'
import { syncAll } from '@/lib/notion-sync/syncAll'

/**
 * POST /api/cron-sync — daily Vercel Cron trigger (TAD AD-04).
 *
 * Reads `sync:last_run` from KV to perform an incremental sync, calls
 * `syncAll`, then persists the new run timestamp. Auth uses a constant-time
 * comparison against `CRON_SECRET` (Convention §10).
 *
 * Refs: API Design §5.2, REQ-FUNC-015, REQ-OBS-001.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = request.headers.get('authorization') ?? ''
  const secret = process.env.CRON_SECRET
  const expected = `Bearer ${secret ?? ''}`

  if (
    !secret ||
    auth.length !== expected.length ||
    !timingSafeEqual(Buffer.from(auth), Buffer.from(expected))
  ) {
    return apiError(
      401,
      'unauthorized',
      'Unauthorized',
      'Invalid authorization',
      '/api/cron-sync'
    )
  }

  const lastRun = await kv.get<string>('sync:last_run').catch(() => null)

  const result = await syncAll(lastRun ?? undefined)

  await kv.set('sync:last_run', result.syncedAt).catch((err) => {
    console.warn(
      'Failed to update sync:last_run:',
      err instanceof Error ? err.message : err
    )
  })

  console.log(
    JSON.stringify({
      timestamp: result.syncedAt,
      trigger: 'cron',
      synced: result.synced,
      skipped: result.skipped,
      failed: result.failed,
      failedSlugs: result.failedSlugs,
    })
  )

  return NextResponse.json({
    synced: result.synced,
    failed: result.failed,
    syncedAt: result.syncedAt,
  })
}
