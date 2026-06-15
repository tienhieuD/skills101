import Link from 'next/link'
import { PostCard } from '@/components/PostCard'
import { BlogPagination } from '@/components/BlogPagination'
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
  const sort: 'latest' | 'popular' = params.sort === 'popular' ? 'popular' : 'latest'
  const activeTag = params.tag

  let posts = getAllPosts()
  if (activeTag) posts = posts.filter((p) => p.tags.includes(activeTag))
  if (sort === 'popular') {
    posts = [...posts].sort((a, b) => b.viewCount - a.viewCount)
  }

  const paginated = paginatePosts(posts, pageNum)
  const allPostsForTags = getAllPosts()
  const allTags = Array.from(new Set(allPostsForTags.flatMap((p) => p.tags))).sort()

  const showHero = !activeTag && pageNum === 1
  const [featured, ...rest] = paginated.posts

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          {activeTag ? `Bài viết về ${activeTag}` : 'Blog'}
        </h1>
        <p className="mt-3 text-lg text-[var(--gray-600)] max-w-2xl">
          {activeTag
            ? `Toàn bộ bài viết với tag ${activeTag}.`
            : 'Chia sẻ kiến thức lập trình — từ Next.js, TypeScript đến design system.'}
        </p>
      </section>

      {/* Controls */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-1 text-sm border-b border-[var(--border)]">
          <Link
            href={buildHref({ ...params, sort: undefined, page: undefined })}
            className={`inline-flex items-center px-3 h-10 border-b-2 transition-colors ${
              sort === 'latest'
                ? 'border-[var(--foreground)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--gray-500)] hover:text-[var(--foreground)]'
            }`}
          >
            Mới nhất
          </Link>
          <Link
            href={buildHref({ ...params, sort: 'popular', page: undefined })}
            className={`inline-flex items-center px-3 h-10 border-b-2 transition-colors ${
              sort === 'popular'
                ? 'border-[var(--foreground)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--gray-500)] hover:text-[var(--foreground)]'
            }`}
          >
            Phổ biến
          </Link>
        </div>
        {allTags.length > 0 && <TagFilter allTags={allTags} activeTag={activeTag} />}
      </section>

      {/* Posts */}
      <section>
        {paginated.posts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[var(--gray-500)]">Chưa có bài viết nào.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {showHero && featured && (
              <>
                <PostCard post={featured} featured />
                {rest.length > 0 && (
                  <hr className="border-0 border-t border-[var(--border)]" />
                )}
              </>
            )}
            <div className="space-y-12 divide-y divide-[var(--border)]">
              {(showHero ? rest : paginated.posts).map((post, i) => (
                <div key={post.slug} className={i === 0 ? '' : 'pt-12'}>
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          </div>
        )}

        {paginated.totalPages > 1 && (
          <div className="mt-16">
            <BlogPagination
              currentPage={paginated.currentPage}
              totalPages={paginated.totalPages}
              basePath="/"
              searchParams={{
                sort: sort === 'popular' ? 'popular' : undefined,
                tag: activeTag,
              }}
            />
          </div>
        )}
      </section>
    </div>
  )
}
