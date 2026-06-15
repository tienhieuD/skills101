'use client'

import { useEffect, useState } from 'react'

interface ViewCounterProps {
  slug: string
  initialCount: number
}

export function ViewCounter({ slug, initialCount }: ViewCounterProps) {
  const [count, setCount] = useState(initialCount)
  const [tracked, setTracked] = useState(false)

  useEffect(() => {
    if (tracked) return
    setTracked(true)
    fetch('/api/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { views?: number } | null) => {
        if (data?.views != null) setCount(data.views)
      })
      .catch(() => {
        // silent — view counter là best-effort
      })
  }, [slug, tracked])

  if (count <= 0) return null

  return (
    <span className="text-sm" style={{ color: 'var(--gray-600)' }}>
      {count.toLocaleString('vi-VN')} lượt xem
    </span>
  )
}
