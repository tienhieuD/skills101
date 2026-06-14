import { Client } from '@notionhq/client'
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

/**
 * Property value as returned inside `PageObjectResponse.properties[key]`.
 * Matches the shape used in DB Design §2.1 (title/rich_text as arrays).
 */
export type NotionPageProperty = PageObjectResponse['properties'][string]

let _client: Client | null = null

/**
 * Returns a singleton Notion Client. Fails fast at first call if
 * `NOTION_API_KEY` is missing (per coding convention §11.1–11.2).
 */
export function getNotionClient(): Client {
  if (_client) return _client
  const apiKey = process.env.NOTION_API_KEY
  if (!apiKey) throw new Error('Missing required env var: NOTION_API_KEY')
  _client = new Client({ auth: apiKey })
  return _client
}

/**
 * Returns the joined plain_text of a `title` or `rich_text` property.
 * Returns `''` for undefined or other property types.
 */
export function getTextProp(prop: NotionPageProperty | undefined): string {
  if (!prop) return ''
  if (prop.type === 'title') {
    return prop.title.map((t) => t.plain_text).join('')
  }
  if (prop.type === 'rich_text') {
    return prop.rich_text.map((t) => t.plain_text).join('')
  }
  return ''
}

/**
 * Returns the name of a `select` property, or `null`.
 */
export function getSelectProp(prop: NotionPageProperty | undefined): string | null {
  if (!prop || prop.type !== 'select') return null
  return prop.select?.name ?? null
}

/**
 * Returns the list of names from a `multi_select` property, or `[]`.
 */
export function getMultiSelectProp(prop: NotionPageProperty | undefined): string[] {
  if (!prop || prop.type !== 'multi_select') return []
  return prop.multi_select.map((s) => s.name)
}

/**
 * Returns the `start` value of a `date` property (YYYY-MM-DD), or `null`.
 */
export function getDateProp(prop: NotionPageProperty | undefined): string | null {
  if (!prop || prop.type !== 'date') return null
  return prop.date?.start ?? null
}

/**
 * Returns the URL of the first file in a `files` property, or `null`.
 *
 * - `external` files: returns `external.url`
 * - `file` (Notion-hosted) files: returns `file.url` (signed URL, will be
 *   re-hosted by T-021)
 */
export function getFileProp(prop: NotionPageProperty | undefined): string | null {
  if (!prop || prop.type !== 'files') return null
  const first = prop.files[0]
  if (!first) return null
  if (first.type === 'external') return first.external.url
  if (first.type === 'file') return first.file.url
  return null
}
