'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const Giscus = dynamic(() => import('@giscus/react'), { ssr: false })

export function GiscusComments() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldMount, setShouldMount] = useState(false)

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
      <div ref={containerRef}>
        <p>
          <small>Bình luận sẽ hiển thị khi cấu hình Giscus hoàn tất.</small>
        </p>
      </div>
    )
  }

  return (
    <div ref={containerRef}>
      <h3>Bình luận</h3>
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
          theme="light"
          lang="vi"
          loading="lazy"
        />
      )}
    </div>
  )
}
