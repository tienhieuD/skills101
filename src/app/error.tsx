'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Page error:', error.message)
  }, [error])

  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold mb-4">Đã xảy ra lỗi</h1>
      <p className="mb-8 text-[var(--gray-600)]">Vui lòng thử lại sau.</p>
      <Button variant="outline" onClick={reset}>
        Thử lại
      </Button>
    </div>
  )
}
