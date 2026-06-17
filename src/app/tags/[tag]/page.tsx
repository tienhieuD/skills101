import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/posts'

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' })

export async function generateStaticParams(): Promise<{ tag: string }[]> {
  const posts = getAllPosts()
  const allTags = new Set<string>()
  for (const p of posts) {
    for (const t of p.tags) allTags.add(t)
  }
  return Array.from(allTags).map((tag) => ({ tag }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const { tag } = await params
  return { title: `Tag: ${decodeURIComponent(tag)}` }
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag: rawTag } = await params
  const tag = decodeURIComponent(rawTag)

  const allPosts = getAllPosts()
  if (!allPosts.some((p) => p.tags.includes(tag))) notFound()

  const filtered = allPosts.filter((p) => p.tags.includes(tag))

  return (
    <div>
      <h2>Tag: {tag}</h2>
      <p>
        <small>{filtered.length} bài viết</small>
      </p>
      <hr />
      {filtered.length === 0 ? (
        <p>Chưa có bài viết nào cho tag này.</p>
      ) : (
        <ul>
          {filtered.map((post) => (
            <li key={post.slug}>
              <a href={`/posts/${post.slug}`}>{post.title}</a>
              {post.date && (
                <>
                  {' — '}
                  <small>{dateFormatter.format(new Date(post.date))}</small>
                </>
              )}
              {post.excerpt && (
                <>
                  <br />
                  <small>{post.excerpt}</small>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      <hr />
      <p>
        <a href="/">« Về danh sách bài viết</a>
      </p>
    </div>
  )
}
