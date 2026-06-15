import { getAllPosts } from '@/lib/posts'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET(): Promise<Response> {
  const posts = getAllPosts() // chỉ published

  const items = posts
    .slice(0, 50) // top 50 mới nhất
    .map((p) => {
      const pubDate = new Date(p.date ?? p.notionLastEditedTime).toUTCString()
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${BASE_URL}/posts/${p.slug}</link>
      <description>${escapeXml(p.excerpt ?? '')}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${BASE_URL}/posts/${p.slug}</guid>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Blog cá nhân về lập trình</title>
    <link>${BASE_URL}</link>
    <description>Chia sẻ kiến thức lập trình.</description>
    <language>vi</language>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
