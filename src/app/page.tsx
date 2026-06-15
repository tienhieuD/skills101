import Link from 'next/link'
import { PostCard } from '@/components/PostCard'
import { Pagination } from '@/components/Pagination'
import { TagFilter } from '@/components/TagFilter'
import { getAllPosts, paginatePosts } from '@/lib/posts'

function buildHref(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v)
  }
  const qs = sp.toString()
  return qs ? `/?${qs}` : '/'
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; tag?: string }>
}) {
  const params = await searchParams
  const pageNum = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const sort: 'latest' | 'popular' =
    params.sort === 'popular' ? 'popular' : 'latest'
  const activeTag = params.tag

  let posts = getAllPosts()
  if (activeTag) posts = posts.filter((p) => p.tags.includes(activeTag))
  if (sort === 'popular') {
    posts = [...posts].sort((a, b) => b.viewCount - a.viewCount)
  }

  const paginated = paginatePosts(posts, pageNum)

  const allPostsForTags = getAllPosts()
  const allTags = Array.from(
    new Set(allPostsForTags.flatMap((p) => p.tags)),
  ).sort()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Blog</h1>

      <div className="flex gap-2 mb-4 text-sm">
        <Link
          href={buildHref({ ...params, sort: undefined, page: undefined })}
          className={`px-3 py-2 min-h-[44px] inline-flex items-center ${
            sort === 'latest' ? 'underline' : ''
          }`}
        >
          Mới nhất
        </Link>
        <Link
          href={buildHref({ ...params, sort: 'popular', page: undefined })}
          className={`px-3 py-2 min-h-[44px] inline-flex items-center ${
            sort === 'popular' ? 'underline' : ''
          }`}
        >
          Phổ biến nhất
        </Link>
      </div>

      <div className="mb-6">
        <TagFilter allTags={allTags} activeTag={activeTag} />
      </div>

      {paginated.posts.length === 0 ? (
        <p
          className="text-center py-8"
          style={{ color: 'var(--gray-600)' }}
        >
          Chưa có bài viết nào.
        </p>
      ) : (
        <>
          <div className="space-y-6">
            {paginated.posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
          <div className="mt-8">
            <Pagination
              currentPage={paginated.currentPage}
              totalPages={paginated.totalPages}
              basePath="/"
              searchParams={{
                sort: sort === 'popular' ? 'popular' : undefined,
                tag: activeTag,
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}
