import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const syncAllMock = vi.fn()
const kvGetMock = vi.fn()
const kvSetMock = vi.fn()

vi.mock('@/lib/notion-sync/syncAll', () => ({
  syncAll: (since?: string) => syncAllMock(since),
}))

vi.mock('@vercel/kv', () => ({
  kv: {
    get: (key: string) => kvGetMock(key),
    set: (key: string, value: unknown) => kvSetMock(key, value),
  },
}))

const SECRET = 'cron-secret'

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/api/cron-sync', {
    method: 'POST',
    headers,
  })
}

describe('POST /api/cron-sync', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = SECRET
    syncAllMock.mockReset()
    kvGetMock.mockReset()
    kvSetMock.mockReset()
  })

  afterEach(() => {
    delete process.env.CRON_SECRET
  })

  it('returns 401 Problem JSON when Authorization header is missing or wrong', async () => {
    const { POST } = await import('@/app/api/cron-sync/route')
    const req = makeRequest({ authorization: 'Bearer wrong-secret-xx' })
    const res = await POST(req as unknown as import('next/server').NextRequest)
    expect(res.status).toBe(401)
    expect(res.headers.get('Content-Type')).toBe('application/problem+json')
    const json = await res.json()
    expect(json.type).toBe('/errors/unauthorized')
    expect(json.status).toBe(401)
    expect(json.instance).toBe('/api/cron-sync')
    expect(syncAllMock).not.toHaveBeenCalled()
  })

  it('calls syncAll with last_run, updates KV and returns sync summary', async () => {
    kvGetMock.mockResolvedValueOnce('2026-06-01T00:00:00.000Z')
    syncAllMock.mockResolvedValueOnce({
      synced: 2,
      skipped: 1,
      failed: 0,
      failedSlugs: [],
      syncedAt: '2026-06-14T12:00:00.000Z',
    })
    kvSetMock.mockResolvedValueOnce('OK')

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const { POST } = await import('@/app/api/cron-sync/route')
    const req = makeRequest({ authorization: `Bearer ${SECRET}` })
    const res = await POST(req as unknown as import('next/server').NextRequest)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({
      synced: 2,
      failed: 0,
      syncedAt: '2026-06-14T12:00:00.000Z',
    })
    expect(kvGetMock).toHaveBeenCalledWith('sync:last_run')
    expect(syncAllMock).toHaveBeenCalledWith('2026-06-01T00:00:00.000Z')
    expect(kvSetMock).toHaveBeenCalledWith('sync:last_run', '2026-06-14T12:00:00.000Z')

    logSpy.mockRestore()
  })

  it('still returns 200 when KV set fails (graceful degradation)', async () => {
    kvGetMock.mockResolvedValueOnce(null)
    syncAllMock.mockResolvedValueOnce({
      synced: 1,
      skipped: 0,
      failed: 0,
      failedSlugs: [],
      syncedAt: '2026-06-14T12:00:00.000Z',
    })
    kvSetMock.mockRejectedValueOnce(new Error('KV down'))

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const { POST } = await import('@/app/api/cron-sync/route')
    const req = makeRequest({ authorization: `Bearer ${SECRET}` })
    const res = await POST(req as unknown as import('next/server').NextRequest)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.synced).toBe(1)
    expect(syncAllMock).toHaveBeenCalledWith(undefined)
    expect(warnSpy).toHaveBeenCalled()

    warnSpy.mockRestore()
    logSpy.mockRestore()
  })
})
