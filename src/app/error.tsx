'use client'

import { useEffect } from 'react'

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
      <p className="mb-8" style={{ color: 'var(--gray-600)' }}>
        Vui lòng thử lại sau.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center px-4 py-2 min-h-[44px] border rounded"
        style={{ borderColor: 'var(--border)' }}
      >
        Thử lại
      </button>
    </div>
  )
}
