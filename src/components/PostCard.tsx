import Image from 'next/image'
import Link from 'next/link'
import type { PostFrontmatter } from '@/types/post'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface PostCardProps {
  post: PostFrontmatter
  /** Render as featured (larger heading, bigger cover). Default false. */
  featured?: boolean
  className?: string
}

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' })

export function PostCard({ post, featured = false, className }: PostCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-0">
        <Link href={`/posts/${post.slug}`} className="group block">
          {post.cover && (
            <div className="relative w-full overflow-hidden border-b aspect-[16/9]">
              <Image
                src={post.cover}
                alt={post.title}
                fill
                sizes="(min-width: 768px) 768px, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>
          )}
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs">
              {post.tags[0] && (
                <Badge variant="secondary" className="font-medium">
                  {post.tags[0]}
                </Badge>
              )}
              {post.date && (
                <time dateTime={post.date} className="text-muted-foreground">
                  {dateFormatter.format(new Date(post.date))}
                </time>
              )}
            </div>
            <h2
              className={`font-semibold tracking-tight group-hover:text-muted-foreground transition-colors ${
                featured ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'
              }`}
            >
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>
            )}
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}
