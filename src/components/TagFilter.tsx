'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

interface TagFilterProps {
  allTags: string[]
  activeTag?: string
}

export function TagFilter({ allTags, activeTag }: TagFilterProps) {
  const router = useRouter()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ToggleGroup
        type="single"
        value={activeTag ?? ''}
        onValueChange={(value) => {
          if (value) router.push(`/?tag=${encodeURIComponent(value)}`)
        }}
        variant="outline"
        size="sm"
        className="flex-wrap"
      >
        {allTags.map((tag) => (
          <ToggleGroupItem
            key={tag}
            value={tag}
            aria-label={`Lọc theo tag ${tag}`}
            aria-pressed={tag === activeTag}
          >
            {tag}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {activeTag && (
        <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
          Tất cả
        </Button>
      )}
    </div>
  )
}
