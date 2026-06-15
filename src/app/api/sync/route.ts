import { timingSafeEqual } from 'node:crypto'

import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { apiError } from '@/lib/api-error'
import { syncAll } from '@/lib/notion-sync/syncAll'

/**
 * Manual sync route. Protected by Bearer `SYNC_SECRET` (REQ-SEC-004 — secret
 * tách biệt với `CRON_SECRET`). Serializes concurrent runs via a `sync:running`
 * KV mutex with 120s TTL safety net (REQ-FUNC-028, TAD AD-11).
 *
 * See API Design §5.3.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Verify Bearer SYNC_SECRET (constant-time compare).
  const auth = request.headers.get('authorization') ?? ''
  const secret = process.env.SYNC_SECRET
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
      '/api/sync',
    )
  }

  // 2. Check mutex.
  const running = await kv.get<string>('sync:running')
  if (running) {
    return apiError(
      409,
      'sync-in-progress',
      'Sync đang chạy',
      'Một tiến trình sync khác đang chạy. Thử lại sau 120 giây.',
      '/api/sync',
    )
  }

  // 3. Acquire mutex with 120s TTL (safety net if Function crashes before del).
  await kv.set('sync:running', '1', { ex: 120 })

  // 4. Run syncAll inside try/catch/finally to guarantee lock release.
  try {
    const lastRun = await kv.get<string>('sync:last_run').catch(() => null)
    const result = await syncAll(lastRun ?? undefined)
    await kv.set('sync:last_run', result.syncedAt).catch((err) => {
      console.error(
        'Failed to update sync:last_run:',
        err instanceof Error ? err.message : err,
      )
    })
    console.log(
      JSON.stringify({
        timestamp: result.syncedAt,
        trigger: 'manual',
        synced: result.synced,
        skipped: result.skipped,
        failed: result.failed,
        failedSlugs: result.failedSlugs,
      }),
    )
    return NextResponse.json({
      synced: result.synced,
      failed: result.failed,
      syncedAt: result.syncedAt,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        trigger: 'manual',
        result: 'error',
        error: message,
      }),
    )
    return apiError(
      500,
      'internal-error',
      'Internal Server Error',
      'Sync failed unexpectedly',
      '/api/sync',
    )
  } finally {
    await kv.del('sync:running').catch((err) => {
      console.error(
        'Failed to delete sync:running lock:',
        err instanceof Error ? err.message : err,
      )
    })
  }
}
