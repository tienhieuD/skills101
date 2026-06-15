'use client'

import { useRouter } from 'next/navigation'

interface TagFilterProps {
  allTags: string[]
  activeTag?: string
}

const baseChipClass =
  'inline-flex items-center min-h-[44px] min-w-[44px] px-3 py-2 rounded-full text-sm border'

export function TagFilter({ allTags, activeTag }: TagFilterProps) {
  const router = useRouter()

  return (
    <div className="flex flex-wrap gap-2">
      {allTags.map((tag) => {
        const isActive = tag === activeTag
        return (
          <button
            key={tag}
            type="button"
            onClick={() => router.push(`/?tag=${tag}`)}
            className={
              isActive
                ? `${baseChipClass} bg-foreground text-background`
                : baseChipClass
            }
            style={isActive ? undefined : { borderColor: 'var(--gray-600)' }}
            aria-pressed={isActive}
          >
            {tag}
          </button>
        )
      })}
      {activeTag && (
        <button
          type="button"
          onClick={() => router.push('/')}
          className={baseChipClass}
          style={{ borderColor: 'var(--gray-600)' }}
        >
          Tất cả
        </button>
      )}
    </div>
  )
}
