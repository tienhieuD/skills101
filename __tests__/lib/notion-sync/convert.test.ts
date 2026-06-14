import { beforeEach, describe, expect, it, vi } from 'vitest'

const pageToMarkdownMock = vi.fn()
const toMarkdownStringMock = vi.fn()

vi.mock('notion-to-md', () => ({
  NotionToMarkdown: vi.fn().mockImplementation(() => ({
    pageToMarkdown: pageToMarkdownMock,
    toMarkdownString: toMarkdownStringMock,
  })),
}))

vi.mock('@/lib/notion-sync/client', () => ({
  getNotionClient: vi.fn(() => ({ __fake: 'notion-client' })),
}))

describe('pageToMarkdown', () => {
  beforeEach(() => {
    vi.resetModules()
    pageToMarkdownMock.mockReset()
    toMarkdownStringMock.mockReset()
  })

  it('returns the markdown string for a page', async () => {
    const blocks = [{ parent: '# Hello', children: [] }]
    pageToMarkdownMock.mockResolvedValue(blocks)
    toMarkdownStringMock.mockReturnValue({ parent: '# Hello\n\nWorld' })

    const { pageToMarkdown } = await import('@/lib/notion-sync/convert')
    const md = await pageToMarkdown('page-123')

    expect(md).toBe('# Hello\n\nWorld')
    expect(pageToMarkdownMock).toHaveBeenCalledWith('page-123')
    expect(toMarkdownStringMock).toHaveBeenCalledWith(blocks)
  })

  it("returns '' when toMarkdownString yields no parent", async () => {
    pageToMarkdownMock.mockResolvedValue([])
    toMarkdownStringMock.mockReturnValue({ parent: undefined })

    const { pageToMarkdown } = await import('@/lib/notion-sync/convert')
    expect(await pageToMarkdown('page-empty')).toBe('')
  })

  it('re-throws with pageId context when the underlying call fails', async () => {
    pageToMarkdownMock.mockRejectedValue(new Error('Notion 404'))

    const { pageToMarkdown } = await import('@/lib/notion-sync/convert')
    await expect(pageToMarkdown('page-bad')).rejects.toThrow(
      /pageToMarkdown failed for pageId=page-bad: Notion 404/,
    )
  })
})
