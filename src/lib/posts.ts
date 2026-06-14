import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Post, PostFrontmatter } from '@/types/post'

const POSTS_DIR = process.env.POSTS_DIR ?? path.join(process.cwd(), 'content/posts')
const PER_PAGE = 10

const REQUIRED_FIELDS = [
  'title',
  'slug',
  'status',
  'tags',
  'notionPageId',
  'notionLastEditedTime',
] as const

function isValidFrontmatter(data: Record<string, unknown>): boolean {
  for (const field of REQUIRED_FIELDS) {
    if (data[field] === undefined || data[field] === null) return false
  }
  if (data.status !== 'published' && data.status !== 'archived') return false
  if (!Array.isArray(data.tags)) return false
  return true
}

export function getPost(slug: string): Post | null {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  let raw: string
  try {
    raw = fs.readFileSync(filePath, 'utf8')
  } catch {
    return null
  }

  let parsed: matter.GrayMatterFile<string>
  try {
    parsed = matter(raw)
  } catch (err) {
    console.warn(`[posts] Failed to parse frontmatter for ${slug}.mdx:`, err)
    return null
  }

  const data = parsed.data as Record<string, unknown>
  if (!isValidFrontmatter(data)) {
    console.warn(`[posts] Malformed frontmatter in ${slug}.mdx: missing required fields`)
    return null
  }

  const frontmatter: PostFrontmatter = {
    title: data.title as string,
    slug: data.slug as string,
    status: data.status as 'published' | 'archived',
    tags: data.tags as string[],
    date: (data.date as string | null | undefined) ?? null,
    excerpt: (data.excerpt as string | null | undefined) ?? null,
    cover: (data.cover as string | null | undefined) ?? null,
    notionPageId: data.notionPageId as string,
    notionLastEditedTime: data.notionLastEditedTime as string,
    viewCount: typeof data.viewCount === 'number' ? data.viewCount : 0,
  }

  return { ...frontmatter, content: parsed.content }
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return []
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
}

export function getAllPosts(): PostFrontmatter[] {
  const slugs = getAllSlugs()
  const posts: PostFrontmatter[] = []
  for (const slug of slugs) {
    const post = getPost(slug)
    if (!post) continue
    if (post.status !== 'published') continue
    const { content: _content, ...frontmatter } = post
    void _content
    posts.push(frontmatter)
  }
  posts.sort((a, b) => {
    const da = a.date ?? '1970-01-01'
    const db = b.date ?? '1970-01-01'
    return db.localeCompare(da)
  })
  return posts
}

export function paginatePosts(
  posts: PostFrontmatter[],
  page: number,
): {
  posts: PostFrontmatter[]
  currentPage: number
  totalPages: number
} {
  const totalPages = Math.max(1, Math.ceil(posts.length / PER_PAGE))
  const currentPage = Math.min(Math.max(1, Math.floor(page) || 1), totalPages)
  const start = (currentPage - 1) * PER_PAGE
  return {
    posts: posts.slice(start, start + PER_PAGE),
    currentPage,
    totalPages,
  }
}
