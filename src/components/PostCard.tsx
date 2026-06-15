import Image from 'next/image'
import Link from 'next/link'
import type { PostFrontmatter } from '@/types/post'

interface PostCardProps {
  post: PostFrontmatter
  /** Render as featured (larger heading, bigger cover). Default false. */
  featured?: boolean
  className?: string
}

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' })

export function PostCard({ post, featured = false, className }: PostCardProps) {
  return (
    <article className={className}>
      <Link href={`/posts/${post.slug}`} className="group block">
        {post.cover && (
          <div
            className={`relative w-full overflow-hidden rounded-lg border border-[var(--border)] mb-5 ${
              featured ? 'aspect-[16/9]' : 'aspect-[16/9]'
            }`}
          >
            <Image
              src={post.cover}
              alt={post.title}
              fill
              sizes={featured ? '(min-width: 768px) 768px, 100vw' : '(min-width: 768px) 768px, 100vw'}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
        )}

        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--gray-500)]">
          {post.tags[0] && (
            <span className="font-medium text-[var(--gray-700)]">{post.tags[0]}</span>
          )}
          {post.tags[0] && post.date && <span aria-hidden="true">·</span>}
          {post.date && <time dateTime={post.date}>{dateFormatter.format(new Date(post.date))}</time>}
        </div>

        <h2
          className={`mt-3 font-semibold tracking-tight text-[var(--foreground)] group-hover:text-[var(--gray-700)] transition-colors ${
            featured ? 'text-3xl md:text-4xl' : 'text-2xl'
          }`}
        >
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="mt-3 text-[var(--gray-600)] leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        )}
      </Link>
    </article>
  )
}
