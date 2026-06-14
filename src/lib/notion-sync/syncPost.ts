import fs from 'fs'
import path from 'path'

import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import matter from 'gray-matter'

import type { PostFrontmatter } from '@/types/post'

import {
  getDateProp,
  getFileProp,
  getMultiSelectProp,
  getSelectProp,
  getTextProp,
} from './client'
import { pageToMarkdown } from './convert'
import { reHostImage, reHostMarkdownImages } from './images'

export type SyncStatus = 'synced' | 'skipped'

const POSTS_DIR =
  process.env.POSTS_DIR ?? path.join(process.cwd(), 'content/posts')

/**
 * Maps Notion `Status` select values to the PostFrontmatter status union.
 * Returns `null` for any value that should be skipped (Draft, unknown, or
 * missing) per DB Design §3.3.
 */
function mapStatus(
  raw: string | null,
): PostFrontmatter['status'] | null {
  if (raw === 'Published') return 'published'
  if (raw === 'Archived') return 'archived'
  return null
}

/**
 * Builds the YAML frontmatter block for a PostFrontmatter object.
 * Values are JSON.stringify-ed to avoid YAML injection from user-provided
 * tags/titles (DB Design §3.3, REQ-SEC-002).
 */
function buildFrontmatter(data: PostFrontmatter): string {
  const lines = [
    '---',
    `title: ${JSON.stringify(data.title)}`,
    `slug: ${JSON.stringify(data.slug)}`,
    `status: ${JSON.stringify(data.status)}`,
    'tags:',
    ...data.tags.map((t) => `  - ${JSON.stringify(t)}`),
    `date: ${data.date ? JSON.stringify(data.date) : 'null'}`,
    `excerpt: ${data.excerpt ? JSON.stringify(data.excerpt) : 'null'}`,
    `cover: ${data.cover ? JSON.stringify(data.cover) : 'null'}`,
    `notionPageId: ${JSON.stringify(data.notionPageId)}`,
    `notionLastEditedTime: ${JSON.stringify(data.notionLastEditedTime)}`,
    `viewCount: ${data.viewCount}`,
    '---',
    '',
  ]
  return lines.join('\n')
}

/**
 * Returns true if `url` points to a Notion-hosted asset (signed S3 or
 * legacy notion-static). Anything else (e.g. already-rehosted Blob URL,
 * external user URL) is left as-is.
 */
function isNotionHostedUrl(url: string): boolean {
  return /(?:amazonaws\.com|notion-static\.com)/.test(url)
}

/**
 * Commits the synced MDX file to GitHub via Contents API when the
 * `GITHUB_TOKEN` and `GITHUB_REPO` env vars are configured. No-op (with an
 * info log) in dev so local-only sync still works (TAD AD-08).
 */
async function commitToGitHub(
  slug: string,
  fileContent: string,
): Promise<void> {
  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO
  if (!token || !repo) {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event: 'github_commit_skipped',
        slug,
        reason: 'missing GITHUB_TOKEN or GITHUB_REPO',
      }),
    )
    return
  }

  const apiPath = `https://api.github.com/repos/${repo}/contents/content/posts/${slug}.mdx`
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  let existingSha: string | undefined
  const getRes = await fetch(apiPath, { headers })
  if (getRes.ok) {
    const data = (await getRes.json()) as { sha?: string }
    existingSha = data.sha
  } else if (getRes.status !== 404) {
    throw new Error(
      `GitHub GET failed for slug="${slug}": ${getRes.status} ${getRes.statusText}`,
    )
  }

  const putRes = await fetch(apiPath, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `content: T-022 sync ${slug}`,
      content: Buffer.from(fileContent).toString('base64'),
      ...(existingSha ? { sha: existingSha } : {}),
    }),
  })
  if (!putRes.ok) {
    throw new Error(
      `GitHub PUT failed for slug="${slug}": ${putRes.status} ${putRes.statusText}`,
    )
  }
}

/**
 * Syncs a single Notion `PageObjectResponse` into a local MDX file under
 * `POSTS_DIR` (and optionally commits to GitHub).
 *
 * Returns:
 *   - `'synced'` when the file was written
 *   - `'skipped'` when status is non-publishable or the page is already
 *     up to date (idempotent per DB Design §3.3)
 *
 * Throws with context on any conversion / image / write failure so the
 * caller can abort atomically (REQ-REL-001).
 */
export async function syncPageObject(
  page: PageObjectResponse,
): Promise<SyncStatus> {
  const startTime = Date.now()

  const title = getTextProp(page.properties.Title)
  const slug = getTextProp(page.properties.Slug)
  if (!slug) {
    throw new Error(`Missing slug for pageId=${page.id}`)
  }
  const rawStatus = getSelectProp(page.properties.Status)
  const tags = getMultiSelectProp(page.properties.Tags)
  const date = getDateProp(page.properties.Date)
  const excerpt = getTextProp(page.properties.Excerpt) || null
  const coverUrl = getFileProp(page.properties.Cover)

  const status = mapStatus(rawStatus)
  if (!status) return 'skipped'

  const notionLastEditedTime = page.last_edited_time
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`)

  let viewCount = 0
  if (fs.existsSync(filePath)) {
    const existing = matter(fs.readFileSync(filePath, 'utf8'))
    const existingFm = existing.data as Partial<PostFrontmatter>
    if (existingFm.notionLastEditedTime === notionLastEditedTime) {
      return 'skipped'
    }
    viewCount = existingFm.viewCount ?? 0
  }

  const markdown = await pageToMarkdown(page.id)
  const content = await reHostMarkdownImages(markdown, slug)

  let cover: string | null = coverUrl
  if (coverUrl && isNotionHostedUrl(coverUrl)) {
    cover = await reHostImage(coverUrl, `posts/${slug}/cover`)
  }

  const frontmatter: PostFrontmatter = {
    title,
    slug,
    status,
    tags,
    date,
    excerpt,
    cover,
    notionPageId: page.id,
    notionLastEditedTime,
    viewCount,
  }

  const fileContent = buildFrontmatter(frontmatter) + content

  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true })
  }
  fs.writeFileSync(filePath, fileContent)

  await commitToGitHub(slug, fileContent)

  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      trigger: 'manual',
      pageId: page.id,
      slug,
      result: 'synced',
      durationMs: Date.now() - startTime,
    }),
  )

  return 'synced'
}
