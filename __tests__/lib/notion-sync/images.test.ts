import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock @vercel/blob's `put` so we never make a real network call.
vi.mock('@vercel/blob', () => ({
  put: vi.fn(async (pathname: string) => ({
    url: `https://blob.vercel-storage.com/${pathname}`,
  })),
}))

describe('reHostImage (dev fallback)', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
    vi.restoreAllMocks()
  })

  it('returns the original URL when BLOB_READ_WRITE_TOKEN is unset', async () => {
    vi.resetModules()
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', '')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const mod = await import('@/lib/notion-sync/images')

    const url = 'https://prod-files-secure.s3.us-west-2.amazonaws.com/abc/img.png'
    const result = await mod.reHostImage(url, 'posts/foo/img.png')

    expect(result).toBe(url)
    expect(warn).toHaveBeenCalled()
  })
})

describe('reHostMarkdownImages', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
    vi.restoreAllMocks()
  })

  it('returns markdown unchanged when there are no matching URLs', async () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'tok_test')
    const mod = await import('@/lib/notion-sync/images')

    const md = '# Hello\n\nNo images here, just text and a [link](https://example.com).'
    const result = await mod.reHostMarkdownImages(md, 'my-post')
    expect(result).toBe(md)
  })

  it('replaces a single matched Notion image URL with the Blob URL', async () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'tok_test')
    const blobMod = await import('@vercel/blob')
    const putMock = vi.mocked(blobMod.put)
    putMock.mockClear()

    // Mock fetch to return a fake image response.
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(new ArrayBuffer(8), {
        status: 200,
        headers: { 'content-type': 'image/png' },
      }),
    )

    const mod = await import('@/lib/notion-sync/images')

    const url =
      'https://prod-files-secure.s3.us-west-2.amazonaws.com/abc/img.png?X-Amz=1'
    const md = `Look at this image: ![alt](${url})`

    const result = await mod.reHostMarkdownImages(md, 'my-post')

    expect(fetchSpy).toHaveBeenCalledWith(url)
    expect(putMock).toHaveBeenCalledTimes(1)
    expect(putMock.mock.calls[0][0]).toBe('posts/my-post/img.png')
    expect(result).toContain(
      'https://blob.vercel-storage.com/posts/my-post/img.png',
    )
    expect(result).not.toContain(url)
  })

  it('replaces multiple distinct Notion image URLs in the same markdown', async () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'tok_test')
    const blobMod = await import('@vercel/blob')
    const putMock = vi.mocked(blobMod.put)
    putMock.mockClear()

    vi.spyOn(globalThis, 'fetch').mockImplementation(
      async () =>
        new Response(new ArrayBuffer(8), {
          status: 200,
          headers: { 'content-type': 'image/png' },
        }),
    )

    const mod = await import('@/lib/notion-sync/images')

    const url1 =
      'https://prod-files-secure.s3.us-west-2.amazonaws.com/aaa/one.png?sig=1'
    const url2 = 'https://secure.notion-static.com/bbb/two.jpg'

    const md = `# Post\n\n![a](${url1})\n\nMid text\n\n![b](${url2})\n`
    const result = await mod.reHostMarkdownImages(md, 'multi')

    expect(putMock).toHaveBeenCalledTimes(2)
    expect(result).toContain('https://blob.vercel-storage.com/posts/multi/one.png')
    expect(result).toContain('https://blob.vercel-storage.com/posts/multi/two.jpg')
    expect(result).not.toContain(url1)
    expect(result).not.toContain(url2)
  })
})
