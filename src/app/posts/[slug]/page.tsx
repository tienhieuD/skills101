import { MDXRemote } from 'next-mdx-remote/rsc'
import { notFound, redirect } from 'next/navigation'
import { timingSafeEqual } from 'crypto'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import type { Metadata } from 'next'
import { getPost, getAllSlugs } from '@/lib/posts'
import { GiscusComments } from '@/components/GiscusComments'
import { ViewCounter } from '@/components/ViewCounter'

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' })

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return getAllSlugs()
    .map((slug) => ({ slug, post: getPost(slug) }))
    .filter(({ post }) => post?.status === 'published')
    .map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post || post.status !== 'published') {
    return { title: 'Không tìm thấy' }
  }
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.cover ? [{ url: post.cover }] : [],
    },
  }
}

export default async function PostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ debug?: string }>
}) {
  const { slug } = await params
  const { debug } = await searchParams

  const post = getPost(slug)
  if (!post) notFound()

  if (post.status === 'archived') {
    const draftSecret = process.env.DRAFT_SECRET ?? ''
    const provided = debug ?? ''
    const authorized =
      draftSecret.length > 0 &&
      provided.length === draftSecret.length &&
      timingSafeEqual(Buffer.from(provided), Buffer.from(draftSecret))
    if (!authorized) {
      redirect('/')
    }
  }

  const isArchived = post.status === 'archived'
  const dateFormatted = post.date ? dateFormatter.format(new Date(post.date)) : null

  return (
    <article>
      {isArchived && (
        <blockquote>
          <strong>Archived</strong> — Bài này đã được lưu trữ.
        </blockquote>
      )}

      {post.cover && <img src={post.cover} alt={post.title} />}

      <h2>{post.title}</h2>

      <p>
        {dateFormatted && (
          <small>
            <time dateTime={post.date ?? undefined}>{dateFormatted}</time>
          </small>
        )}
        {dateFormatted && ' — '}
        <small>
          <ViewCounter slug={post.slug} initialCount={post.viewCount} />
        </small>
      </p>

      {post.excerpt && (
        <p>
          <em>{post.excerpt}</em>
        </p>
      )}

      <hr />

      <MDXRemote
        source={post.content}
        options={{
          mdxOptions: {
            rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]],
          },
        }}
      />

      {post.tags.length > 0 && (
        <>
          <hr />
          <p>
            Tag:{' '}
            {post.tags.map((tag, i) => (
              <span key={tag}>
                {i > 0 && ', '}
                <a href={`/?tag=${encodeURIComponent(tag)}`}>{tag}</a>
              </span>
            ))}
          </p>
        </>
      )}

      <hr />

      <GiscusComments />

      <hr />

      <p>
        <a href="/">« Về danh sách bài viết</a>
      </p>
    </article>
  )
}
