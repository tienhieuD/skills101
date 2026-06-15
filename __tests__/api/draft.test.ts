import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { NextRequest } from 'next/server'

const enableMock = vi.fn()
const redirectMock = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`)
})

vi.mock('next/headers', () => ({
  draftMode: vi.fn(async () => ({ enable: enableMock })),
}))

vi.mock('next/navigation', () => ({
  redirect: (url: string) => redirectMock(url),
}))

const SECRET = 'test-secret-value-of-sufficient-length-32'

function makeRequest(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost/api/draft')
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }
  return {
    nextUrl: url,
  } as unknown as NextRequest
}

describe('GET /api/draft', () => {
  beforeEach(() => {
    process.env.DRAFT_SECRET = SECRET
    enableMock.mockReset()
    redirectMock.mockClear()
  })

  afterEach(() => {
    delete process.env.DRAFT_SECRET
  })

  it('returns 401 Unauthorized when secret is wrong', async () => {
    const { GET } = await import('@/app/api/draft/route')
    const req = makeRequest({ secret: 'wrong-secret', slug: 'hello' })
    const res = await GET(req)
    expect(res.status).toBe(401)
    expect(await res.text()).toBe('Unauthorized')
    expect(enableMock).not.toHaveBeenCalled()
  })

  it('returns 400 Invalid slug for path traversal attempts', async () => {
    const { GET } = await import('@/app/api/draft/route')
    const req = makeRequest({ secret: SECRET, slug: '../etc/passwd' })
    const res = await GET(req)
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('Invalid slug')
    expect(enableMock).not.toHaveBeenCalled()
  })

  it('enables draft mode and redirects to /posts/<slug> on success', async () => {
    const { GET } = await import('@/app/api/draft/route')
    const req = makeRequest({ secret: SECRET, slug: 'my-post' })
    await expect(GET(req)).rejects.toThrow('NEXT_REDIRECT:/posts/my-post')
    expect(enableMock).toHaveBeenCalledOnce()
    expect(redirectMock).toHaveBeenCalledWith('/posts/my-post')
  })
})
