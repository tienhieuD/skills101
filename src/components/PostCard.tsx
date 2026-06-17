import type { PostFrontmatter } from '@/types/post'

interface PostCardProps {
  post: PostFrontmatter
}

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' })

export function PostCard({ post }: PostCardProps) {
  return (
    <article>
      <h3>
        <a href={`/posts/${post.slug}`}>{post.title}</a>
      </h3>
      {post.date && (
        <p>
          <small>{dateFormatter.format(new Date(post.date))}</small>
        </p>
      )}
      {post.excerpt && <p>{post.excerpt}</p>}
      {post.tags.length > 0 && (
        <p>
          <small>
            Tag:{' '}
            {post.tags.map((tag, i) => (
              <span key={tag}>
                {i > 0 && ', '}
                <a href={`/?tag=${encodeURIComponent(tag)}`}>{tag}</a>
              </span>
            ))}
          </small>
        </p>
      )}
      <hr />
    </article>
  )
}
