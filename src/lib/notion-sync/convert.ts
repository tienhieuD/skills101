import { NotionToMarkdown } from 'notion-to-md'
import { getNotionClient } from './client'

let _n2m: NotionToMarkdown | null = null

/**
 * Returns a singleton `NotionToMarkdown` instance, lazily initialized with
 * the shared Notion client (TAD §5.2). Matches the lazy-init pattern in
 * `getNotionClient()`.
 */
function getNotionToMarkdown(): NotionToMarkdown {
  if (_n2m) return _n2m
  _n2m = new NotionToMarkdown({ notionClient: getNotionClient() })
  return _n2m
}

/**
 * Converts a Notion page (by id) into a Markdown string.
 *
 * Re-throws with `pageId` context per coding convention §11 — never swallows
 * the underlying error.
 */
export async function pageToMarkdown(pageId: string): Promise<string> {
  try {
    const n2m = getNotionToMarkdown()
    const blocks = await n2m.pageToMarkdown(pageId)
    const result = n2m.toMarkdownString(blocks)
    return result.parent ?? ''
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`pageToMarkdown failed for pageId=${pageId}: ${message}`)
  }
}
