import { createHmac } from 'crypto'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const syncPageObjectMock = vi.fn()
const retrieveMock = vi.fn()

vi.mock('@/lib/notion-sync/syncPost', () => ({
  syncPageObject: syncPageObjectMock,
}))

vi.mock('@/lib/notion-sync/client', () => ({
  getNotionClient: () => ({
    pages: { retrieve: retrieveMock },
  }),
}))

const SECRET = 'test-secret'

function sign(body: string): string {
  return `sha256=${createHmac('sha256', SECRET).update(body).digest('hex')}`
}

async function makeRequest(
  body: string,
  headers: Record<string, string> = {},
): Promise<Request> {
  return new Request('http://localhost/api/notion-webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body,
  })
}

describe('POST /api/notion-webhook', () => {
  beforeEach(() => {
    process.env.NOTION_WEBHOOK_SECRET = SECRET
    syncPageObjectMock.mockReset()
    retrieveMock.mockReset()
  })

  afterEach(() => {
    delete process.env.NOTION_WEBHOOK_SECRET
  })

  it('returns 401 Problem JSON when signature header is missing', async () => {
    const { POST } = await import('@/app/api/notion-webhook/route')
    const body = JSON.stringify({ type: 'page.updated' })
    const req = await makeRequest(body)
    const res = await POST(req as unknown as import('next/server').NextRequest)
    expect(res.status).toBe(401)
    expect(res.headers.get('Content-Type')).toBe('application/problem+json')
    const json = await res.json()
    expect(json.type).toBe('/errors/unauthorized')
    expect(json.status).toBe(401)
    expect(json.instance).toBe('/api/notion-webhook')
  })

  it('returns 401 when signature is invalid', async () => {
    const { POST } = await import('@/app/api/notion-webhook/route')
    const body = JSON.stringify({ type: 'page.updated' })
    const req = await makeRequest(body, {
      'notion-signature': 'sha256=deadbeef',
    })
    const res = await POST(req as unknown as import('next/server').NextRequest)
    expect(res.status).toBe(401)
  })

  it('responds with challenge for url_verification', async () => {
    const { POST } = await import('@/app/api/notion-webhook/route')
    const body = JSON.stringify({
      type: 'url_verification',
      challenge: 'abc123',
    })
    const req = await makeRequest(body, { 'notion-signature': sign(body) })
    const res = await POST(req as unknown as import('next/server').NextRequest)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ challenge: 'abc123' })
  })

  it('syncs on page.updated with valid signature', async () => {
    retrieveMock.mockResolvedValueOnce({
      id: 'page-1',
      properties: {},
    })
    syncPageObjectMock.mockResolvedValueOnce('synced')

    const { POST } = await import('@/app/api/notion-webhook/route')
    const body = JSON.stringify({
      type: 'page.updated',
      entity: { id: 'page-1' },
    })
    const req = await makeRequest(body, { 'notion-signature': sign(body) })
    const res = await POST(req as unknown as import('next/server').NextRequest)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ synced: true, skipped: false })
    expect(retrieveMock).toHaveBeenCalledWith({ page_id: 'page-1' })
    expect(syncPageObjectMock).toHaveBeenCalledTimes(1)
  })
})
