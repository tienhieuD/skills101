import Image from 'next/image'
import Link from 'next/link'
import type { PostFrontmatter } from '@/types/post'
import { Card, Badge } from '@/components/ui'

interface PostCardProps {
  post: PostFrontmatter
  className?: string
}

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' })

export function PostCard({ post, className }: PostCardProps) {
  return (
    <Card as="article" className={className}>
      {post.cover && (
        <Image
          src={post.cover}
          alt={post.title}
          width={800}
          height={400}
          className="w-full h-auto rounded-lg mb-4"
        />
      )}
      <Link href={`/posts/${post.slug}`}>
        <h2 className="text-2xl font-bold">{post.title}</h2>
      </Link>
      {post.date && (
        <p className="text-sm mt-2 text-[var(--gray-600)]">
          {dateFormatter.format(new Date(post.date))}
        </p>
      )}
      {post.excerpt && (
        <p className="mt-3 text-[var(--gray-600)]">{post.excerpt}</p>
      )}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {post.tags.map((tag) => (
            <Badge key={tag} as="a" href={`/?tag=${encodeURIComponent(tag)}`}>
              {tag}
            </Badge>
          ))}
        </div>
      )}
      {post.viewCount > 0 && (
        <span className="block mt-3 text-sm text-[var(--gray-600)]">
          {post.viewCount} lượt xem
        </span>
      )}
    </Card>
  )
}
