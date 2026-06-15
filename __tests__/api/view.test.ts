import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const incrMock = vi.fn()
const getAllSlugsMock = vi.fn()

vi.mock('@vercel/kv', () => ({
  kv: {
    incr: (...args: unknown[]) => incrMock(...args),
  },
}))

vi.mock('@/lib/posts', () => ({
  getAllSlugs: () => getAllSlugsMock(),
}))

async function makeRequest(body: unknown): Promise<Request> {
  return new Request('http://localhost/api/view', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

describe('POST /api/view', () => {
  beforeEach(() => {
    incrMock.mockReset()
    getAllSlugsMock.mockReset()
    getAllSlugsMock.mockReturnValue(['hello-world', 'my-post'])
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when body has no slug', async () => {
    const { POST } = await import('@/app/api/view/route')
    const req = await makeRequest({})
    const res = await POST(req as never)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Missing or invalid slug')
  })

  it('returns 400 when slug has special characters', async () => {
    const { POST } = await import('@/app/api/view/route')
    const req = await makeRequest({ slug: 'bad slug!' })
    const res = await POST(req as never)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Invalid slug format')
  })

  it('returns 404 when slug not in getAllSlugs()', async () => {
    const { POST } = await import('@/app/api/view/route')
    const req = await makeRequest({ slug: 'nonexistent-slug' })
    const res = await POST(req as never)
    expect(res.status).toBe(404)
    const data = await res.json()
    expect(data.error).toBe('Slug not found')
    expect(incrMock).not.toHaveBeenCalled()
  })

  it('increments KV and returns views for valid slug', async () => {
    incrMock.mockResolvedValue(42)
    const { POST } = await import('@/app/api/view/route')
    const req = await makeRequest({ slug: 'hello-world' })
    const res = await POST(req as never)
    expect(res.status).toBe(200)
    expect(incrMock).toHaveBeenCalledWith('views:hello-world')
    const data = await res.json()
    expect(data).toEqual({ views: 42 })
  })
})
