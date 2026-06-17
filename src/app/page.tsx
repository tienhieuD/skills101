import { getAllPosts, paginatePosts } from '@/lib/posts'

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' })

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
  const allTags = Array.from(new Set(getAllPosts().flatMap((p) => p.tags))).sort()

  return (
    <div>
      <h2>{activeTag ? `Bài viết về ${activeTag}` : 'Tất cả bài viết'}</h2>

      <p>
        Sắp xếp:{' '}
        <a href={buildHref({ ...params, sort: undefined, page: undefined })}>
          {sort === 'latest' ? <strong>Mới nhất</strong> : 'Mới nhất'}
        </a>
        {' | '}
        <a href={buildHref({ ...params, sort: 'popular', page: undefined })}>
          {sort === 'popular' ? <strong>Phổ biến</strong> : 'Phổ biến'}
        </a>
      </p>

      {allTags.length > 0 && (
        <p>
          Tag:{' '}
          {!activeTag ? <strong>Tất cả</strong> : <a href="/">Tất cả</a>}
          {allTags.map((tag) => (
            <span key={tag}>
              {' | '}
              {tag === activeTag ? (
                <strong>{tag}</strong>
              ) : (
                <a href={`/?tag=${encodeURIComponent(tag)}`}>{tag}</a>
              )}
            </span>
          ))}
        </p>
      )}

      <hr />

      {paginated.posts.length === 0 ? (
        <p>Chưa có bài viết nào.</p>
      ) : (
        <ul>
          {paginated.posts.map((post) => (
            <li key={post.slug}>
              <a href={`/posts/${post.slug}`}>{post.title}</a>
              {post.date && (
                <>
                  {' — '}
                  <small>{dateFormatter.format(new Date(post.date))}</small>
                </>
              )}
              {post.tags.length > 0 && (
                <>
                  {' ['}
                  {post.tags.map((tag, i) => (
                    <span key={tag}>
                      {i > 0 && ', '}
                      <a href={`/?tag=${encodeURIComponent(tag)}`}>{tag}</a>
                    </span>
                  ))}
                  {']'}
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

      {paginated.totalPages > 1 && (
        <>
          <hr />
          <p>
            {paginated.currentPage > 1 ? (
              <a
                href={buildHref({
                  ...params,
                  page:
                    paginated.currentPage - 1 > 1
                      ? String(paginated.currentPage - 1)
                      : undefined,
                })}
              >
                « Trước
              </a>
            ) : (
              <span>« Trước</span>
            )}
            {' — Trang '}
            {paginated.currentPage} / {paginated.totalPages}
            {' — '}
            {paginated.currentPage < paginated.totalPages ? (
              <a
                href={buildHref({
                  ...params,
                  page: String(paginated.currentPage + 1),
                })}
              >
                Sau »
              </a>
            ) : (
              <span>Sau »</span>
            )}
          </p>
        </>
      )}
    </div>
  )
}
