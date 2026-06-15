import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sismemberMock = vi.fn()
const saddMock = vi.fn()
const sendMock = vi.fn()

vi.mock('@vercel/kv', () => ({
  kv: {
    sismember: (...args: unknown[]) => sismemberMock(...args),
    sadd: (...args: unknown[]) => saddMock(...args),
  },
}))

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: (...args: unknown[]) => sendMock(...args),
    },
  })),
}))

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

describe('POST /api/newsletter', () => {
  beforeEach(() => {
    sismemberMock.mockReset()
    saddMock.mockReset()
    sendMock.mockReset()
    sendMock.mockResolvedValue({ id: 'mock-id' })
    process.env.RESEND_API_KEY = 'test-key'
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 Problem JSON for invalid email', async () => {
    const { POST } = await import('@/app/api/newsletter/route')
    const req = makeRequest({ email: 'notanemail' })
    const res = await POST(req as never)
    expect(res.status).toBe(400)
    expect(res.headers.get('content-type')).toContain('application/problem+json')
    const data = await res.json()
    expect(data.type).toBe('/errors/invalid-request')
    expect(data.status).toBe(400)
  })

  it('adds new email via kv.sadd and returns 200', async () => {
    sismemberMock.mockResolvedValue(0)
    saddMock.mockResolvedValue(1)
    const { POST } = await import('@/app/api/newsletter/route')
    const req = makeRequest({ email: 'user@example.com' })
    const res = await POST(req as never)
    expect(res.status).toBe(200)
    expect(saddMock).toHaveBeenCalledWith(
      'newsletter:subscribers',
      'user@example.com',
    )
    const data = await res.json()
    expect(data).toEqual({ subscribed: true })
  })

  it('returns 200 without sadd/Resend when email already subscribed', async () => {
    sismemberMock.mockResolvedValue(1)
    const { POST } = await import('@/app/api/newsletter/route')
    const req = makeRequest({ email: 'exists@example.com' })
    const res = await POST(req as never)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual({ subscribed: true })
    expect(saddMock).not.toHaveBeenCalled()
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('returns 400 when body is missing email field', async () => {
    const { POST } = await import('@/app/api/newsletter/route')
    const req = makeRequest({})
    const res = await POST(req as never)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.type).toBe('/errors/invalid-request')
    expect(data.detail).toBe('Missing email field')
  })
})
