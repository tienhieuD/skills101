import { put } from '@vercel/blob'

/**
 * Regex matching Notion-hosted image URLs:
 *   - AWS S3 signed URLs (`*.amazonaws.com/...`, incl. `prod-files-secure.s3.*`)
 *   - Legacy `secure.notion-static.com` URLs
 */
const NOTION_IMAGE_URL_REGEX =
  /https?:\/\/[^\s)"]+\.(amazonaws\.com|notion-static\.com)[^\s)"]*/g

let _devFallbackWarned = false

/**
 * Downloads `notionUrl` and re-hosts the bytes to Vercel Blob at `pathname`.
 *
 * Dev fallback (per TAD AD-08): if `BLOB_READ_WRITE_TOKEN` is not set, returns
 * the original URL so local sync still works without Blob credentials.
 *
 * Throws on download or upload failure (coding convention §11.1).
 */
export async function reHostImage(
  notionUrl: string,
  pathname: string,
): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    if (!_devFallbackWarned) {
      console.warn(
        '[notion-sync] BLOB_READ_WRITE_TOKEN unset — skipping image re-hosting (dev fallback)',
      )
      _devFallbackWarned = true
    }
    return notionUrl
  }

  const response = await fetch(notionUrl)
  if (!response.ok) {
    throw new Error(`Failed to download image: ${notionUrl}`)
  }
  const contentType =
    response.headers.get('content-type') ?? 'application/octet-stream'
  const arrayBuffer = await response.arrayBuffer()

  const blob = await put(pathname, arrayBuffer, {
    access: 'public',
    contentType,
  })
  return blob.url
}

/**
 * Scans `markdown` for Notion-hosted image URLs and re-hosts each one to
 * Vercel Blob under `posts/<slug>/<filename>` (DB Design §5.1). Returns the
 * markdown with original URLs replaced by their Blob counterparts.
 *
 * If any image fails to re-host, re-throws with slug + url context so the
 * caller (`syncPost`) can abort the post.
 */
export async function reHostMarkdownImages(
  markdown: string,
  slug: string,
): Promise<string> {
  const matches = Array.from(markdown.matchAll(NOTION_IMAGE_URL_REGEX))
  if (matches.length === 0) return markdown

  let result = markdown
  const seen = new Set<string>()

  for (const match of matches) {
    const url = match[0]
    if (seen.has(url)) continue
    seen.add(url)

    const filename = extractFilename(url)
    const pathname = `posts/${slug}/${filename}`

    try {
      const newUrl = await reHostImage(url, pathname)
      if (newUrl !== url) {
        result = result.replaceAll(url, newUrl)
      }
    } catch (err) {
      const cause = err instanceof Error ? err.message : String(err)
      throw new Error(
        `Failed to re-host image for slug="${slug}", url="${url}": ${cause}`,
      )
    }
  }

  return result
}

/**
 * Extracts the filename from a URL path's last segment, stripping query string.
 * Falls back to `image` when no usable segment exists.
 */
function extractFilename(url: string): string {
  try {
    const u = new URL(url)
    const segments = u.pathname.split('/').filter(Boolean)
    const last = segments[segments.length - 1]
    if (last && last.length > 0) return decodeURIComponent(last)
  } catch {
    // fall through to default
  }
  return 'image'
}
