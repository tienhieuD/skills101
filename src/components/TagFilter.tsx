'use client'

import { useRouter } from 'next/navigation'
import { Badge, Button } from '@/components/ui'

interface TagFilterProps {
  allTags: string[]
  activeTag?: string
}

export function TagFilter({ allTags, activeTag }: TagFilterProps) {
  const router = useRouter()

  return (
    <div className="flex flex-wrap gap-2">
      {allTags.map((tag) => {
        const isActive = tag === activeTag
        return (
          <Badge
            key={tag}
            as="button"
            variant={isActive ? 'active' : 'default'}
            onClick={() => router.push(`/?tag=${encodeURIComponent(tag)}`)}
            aria-pressed={isActive}
          >
            {tag}
          </Badge>
        )
      })}
      {activeTag && (
        <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
          Tất cả
        </Button>
      )}
    </div>
  )
}
