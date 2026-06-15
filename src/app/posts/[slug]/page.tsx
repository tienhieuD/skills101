import { MDXRemote } from 'next-mdx-remote/rsc'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import { timingSafeEqual } from 'crypto'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import type { Metadata } from 'next'
import { getPost, getAllSlugs } from '@/lib/posts'
import { GiscusComments } from '@/components/GiscusComments'
import { ViewCounter } from '@/components/ViewCounter'

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
  const dateFormatted = post.date
    ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(new Date(post.date))
    : null

  return (
    <article>
      {isArchived && (
        <div
          className="mb-6 p-4 rounded border"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--gray-100)' }}
        >
          <strong>Archived</strong> — Bài này đã được lưu trữ.
        </div>
      )}

      {post.cover && (
        <div className="mb-6">
          <Image
            src={post.cover}
            alt={post.title}
            width={1200}
            height={630}
            priority
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}

      <header className="mb-6">
        <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
        <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--gray-600)' }}>
          {dateFormatted && <time>{dateFormatted}</time>}
          {dateFormatted && <span>·</span>}
          <ViewCounter slug={post.slug} initialCount={post.viewCount} />
        </div>
        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <a
                key={tag}
                href={`/?tag=${encodeURIComponent(tag)}`}
                className="inline-flex items-center px-3 py-2 min-h-[44px] text-sm border rounded-full"
                style={{ borderColor: 'var(--border)' }}
              >
                {tag}
              </a>
            ))}
          </div>
        )}
      </header>

      <div className="prose">
        <MDXRemote
          source={post.content}
          options={{
            mdxOptions: {
              rehypePlugins: [
                [rehypePrettyCode, { theme: { dark: 'github-dark', light: 'github-light' } }],
                rehypeSlug,
                [rehypeAutolinkHeadings, { behavior: 'wrap' }],
              ],
            },
          }}
        />
      </div>

      <GiscusComments />
    </article>
  )
}
