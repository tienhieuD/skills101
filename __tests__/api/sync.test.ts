import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const kvGetMock = vi.fn()
const kvSetMock = vi.fn()
const kvDelMock = vi.fn()
const syncAllMock = vi.fn()

vi.mock('@vercel/kv', () => ({
  kv: {
    get: (...args: unknown[]) => kvGetMock(...args),
    set: (...args: unknown[]) => kvSetMock(...args),
    del: (...args: unknown[]) => kvDelMock(...args),
  },
}))

vi.mock('@/lib/notion-sync/syncAll', () => ({
  syncAll: (...args: unknown[]) => syncAllMock(...args),
}))

import { POST } from '@/app/api/sync/route'

function makeRequest(token?: string): NextRequest {
  const headers: Record<string, string> = {}
  if (token !== undefined) headers.authorization = `Bearer ${token}`
  return new NextRequest('http://localhost/api/sync', {
    method: 'POST',
    headers,
  })
}

describe('POST /api/sync', () => {
  beforeEach(() => {
    process.env.SYNC_SECRET = 'test-secret'
    kvGetMock.mockReset()
    kvSetMock.mockReset()
    kvDelMock.mockReset()
    syncAllMock.mockReset()
    kvSetMock.mockResolvedValue('OK')
    kvDelMock.mockResolvedValue(1)
  })

  afterEach(() => {
    delete process.env.SYNC_SECRET
  })

  it('returns 401 when SYNC_SECRET is wrong', async () => {
    const res = await POST(makeRequest('wrong-secret'))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.type).toBe('/errors/unauthorized')
    expect(body.title).toBe('Unauthorized')
    expect(syncAllMock).not.toHaveBeenCalled()
  })

  it('returns 409 RFC 7807 when sync:running lock exists', async () => {
    kvGetMock.mockResolvedValueOnce('1')
    const res = await POST(makeRequest('test-secret'))
    expect(res.status).toBe(409)
    expect(res.headers.get('content-type')).toContain('application/problem+json')
    const body = await res.json()
    expect(body).toMatchObject({
      type: '/errors/sync-in-progress',
      title: 'Sync đang chạy',
      status: 409,
      instance: '/api/sync',
    })
    expect(syncAllMock).not.toHaveBeenCalled()
    expect(kvSetMock).not.toHaveBeenCalled()
  })

  it('happy path: sets lock with TTL 120, runs syncAll, deletes lock, returns 200', async () => {
    kvGetMock.mockImplementation(async (key: string) => {
      if (key === 'sync:running') return null
      if (key === 'sync:last_run') return '2026-01-01T00:00:00.000Z'
      return null
    })
    syncAllMock.mockResolvedValueOnce({
      synced: 2,
      skipped: 1,
      failed: 0,
      failedSlugs: [],
      syncedAt: '2026-06-15T00:00:00.000Z',
    })

    const res = await POST(makeRequest('test-secret'))

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({
      synced: 2,
      failed: 0,
      syncedAt: '2026-06-15T00:00:00.000Z',
    })

    expect(kvSetMock).toHaveBeenCalledWith('sync:running', '1', { ex: 120 })
    expect(syncAllMock).toHaveBeenCalledWith('2026-01-01T00:00:00.000Z')
    expect(kvSetMock).toHaveBeenCalledWith(
      'sync:last_run',
      '2026-06-15T00:00:00.000Z',
    )
    expect(kvDelMock).toHaveBeenCalledWith('sync:running')
  })

  it('releases lock (finally) when syncAll throws and returns 500', async () => {
    kvGetMock.mockResolvedValue(null)
    syncAllMock.mockRejectedValueOnce(new Error('boom'))

    const res = await POST(makeRequest('test-secret'))

    expect(res.status).toBe(500)
    expect(kvSetMock).toHaveBeenCalledWith('sync:running', '1', { ex: 120 })
    expect(kvDelMock).toHaveBeenCalledWith('sync:running')
  })
})
