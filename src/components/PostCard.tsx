import Image from 'next/image'
import Link from 'next/link'
import type { PostFrontmatter } from '@/types/post'

interface PostCardProps {
  post: PostFrontmatter
  className?: string
}

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' })

export function PostCard({ post, className }: PostCardProps) {
  const baseClass =
    'block p-6 rounded-lg border hover:shadow-md transition'
  const wrapperClass = className ? `${baseClass} ${className}` : baseClass

  return (
    <article className={wrapperClass} style={{ borderColor: 'var(--border)' }}>
      {post.cover && (
        <Image
          src={post.cover}
          alt={post.title}
          width={800}
          height={400}
          className="w-full h-auto rounded-lg"
        />
      )}
      <Link href={`/posts/${post.slug}`}>
        <h2 className="text-2xl font-bold mt-4">{post.title}</h2>
      </Link>
      {post.date && (
        <p className="text-sm mt-2" style={{ color: 'var(--gray-600)' }}>
          {dateFormatter.format(new Date(post.date))}
        </p>
      )}
      {post.excerpt && (
        <p className="mt-3" style={{ color: 'var(--gray-600)' }}>
          {post.excerpt}
        </p>
      )}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {post.tags.map((tag) => (
            <a
              key={tag}
              href={`/?tag=${tag}`}
              className="inline-flex items-center px-3 py-2 min-h-[44px] rounded-md text-sm border"
              style={{ borderColor: 'var(--border)' }}
            >
              {tag}
            </a>
          ))}
        </div>
      )}
      {post.viewCount > 0 && (
        <span
          className="block mt-3 text-sm"
          style={{ color: 'var(--gray-600)' }}
        >
          {post.viewCount} lượt xem
        </span>
      )}
    </article>
  )
}
