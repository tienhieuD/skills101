import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PostCard } from '@/components/PostCard'
import { getAllPosts } from '@/lib/posts'

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
  return {
    title: `Tag: ${decodeURIComponent(tag)}`,
  }
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag: rawTag } = await params
  const tag = decodeURIComponent(rawTag)

  const allPosts = getAllPosts()

  const tagExists = allPosts.some((p) => p.tags.includes(tag))
  if (!tagExists) {
    notFound()
  }

  const filteredPosts = allPosts.filter((p) => p.tags.includes(tag))

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Tag: {tag}</h1>
      <p className="mb-6 text-sm" style={{ color: 'var(--gray-600)' }}>
        {filteredPosts.length} bài viết
      </p>

      {filteredPosts.length === 0 ? (
        <p className="text-center py-8" style={{ color: 'var(--gray-600)' }}>
          Chưa có bài viết nào cho tag này.
        </p>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
