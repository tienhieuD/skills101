export interface PostFrontmatter {
  title: string
  slug: string
  status: 'published' | 'archived'
  tags: string[]
  date: string | null
  excerpt: string | null
  cover: string | null
  notionPageId: string
  notionLastEditedTime: string
  viewCount: number
}

export interface Post extends PostFrontmatter {
  content: string
}
