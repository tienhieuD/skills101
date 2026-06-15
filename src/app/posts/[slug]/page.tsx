import { MDXRemote } from 'next-mdx-remote/rsc'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { timingSafeEqual } from 'crypto'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import type { Metadata } from 'next'
import { getPost, getAllSlugs } from '@/lib/posts'
import { GiscusComments } from '@/components/GiscusComments'
import { ViewCounter } from '@/components/ViewCounter'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

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
    <article className="space-y-10">
      {isArchived && (
        <Alert>
          <AlertTitle>Archived</AlertTitle>
          <AlertDescription>Bài này đã được lưu trữ.</AlertDescription>
        </Alert>
      )}

      <header className="space-y-6">
        {post.tags.length > 0 && (
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--gray-500)]">
            <Link
              href={`/?tag=${encodeURIComponent(post.tags[0] ?? '')}`}
              className="font-medium text-[var(--gray-700)] hover:text-[var(--foreground)] transition-colors"
            >
              {post.tags[0]}
            </Link>
            {dateFormatted && (
              <>
                <span aria-hidden="true">·</span>
                <time dateTime={post.date ?? undefined}>{dateFormatted}</time>
              </>
            )}
            <span aria-hidden="true">·</span>
            <ViewCounter slug={post.slug} initialCount={post.viewCount} />
          </div>
        )}
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1]">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="text-xl text-[var(--gray-600)] leading-relaxed">{post.excerpt}</p>
        )}
      </header>

      {post.cover && (
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg border border-[var(--border)]">
          <Image
            src={post.cover}
            alt={post.title}
            fill
            sizes="(min-width: 768px) 720px, 100vw"
            priority
            className="object-cover"
          />
        </div>
      )}

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

      {post.tags.length > 1 && (
        <div className="pt-8 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--gray-500)] mb-3">Tags</p>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/?tag=${encodeURIComponent(tag)}`}>
                <Badge variant="outline">{tag}</Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      <GiscusComments />
    </article>
  )
}
