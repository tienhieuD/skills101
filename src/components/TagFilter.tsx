'use client'

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
            variant={isActive ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => router.push(`/?tag=${encodeURIComponent(tag)}`)}
            aria-pressed={isActive}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                router.push(`/?tag=${encodeURIComponent(tag)}`)
              }
            }}
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
