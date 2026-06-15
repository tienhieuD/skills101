import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/posts'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts() // chỉ published (T-024 đã filter)

  // Static routes
  const staticEntries: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
  ]

  // Post entries
  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE_URL}/posts/${p.slug}`,
    lastModified: new Date(p.notionLastEditedTime || p.date || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Tag entries
  const allTags = new Set<string>()
  for (const p of posts) {
    for (const t of p.tags) allTags.add(t)
  }
  const tagEntries: MetadataRoute.Sitemap = Array.from(allTags).map((tag) => ({
    url: `${BASE_URL}/tags/${encodeURIComponent(tag)}`,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticEntries, ...postEntries, ...tagEntries]
}
