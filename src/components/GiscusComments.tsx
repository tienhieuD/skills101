'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'

const Giscus = dynamic(() => import('@giscus/react'), { ssr: false })

export function GiscusComments() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldMount, setShouldMount] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          setShouldMount(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO as `${string}/${string}` | undefined
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID

  if (!repo || !repoId || !category || !categoryId) {
    return (
      <div
        ref={containerRef}
        className="mt-12 py-8 text-center text-sm"
        style={{ color: 'var(--gray-600)' }}
      >
        Bình luận sẽ hiển thị khi cấu hình Giscus hoàn tất.
      </div>
    )
  }

  return (
    <div ref={containerRef} className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Bình luận</h2>
      {shouldMount && (
        <Giscus
          repo={repo}
          repoId={repoId}
          category={category}
          categoryId={categoryId}
          mapping="pathname"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="bottom"
          theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
          lang="vi"
          loading="lazy"
        />
      )}
    </div>
  )
}
