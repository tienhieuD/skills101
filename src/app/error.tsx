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
    <div>
      <h2>Đã xảy ra lỗi</h2>
      <p>Vui lòng thử lại sau.</p>
      <p>
        <button type="button" onClick={reset}>
          Thử lại
        </button>
      </p>
    </div>
  )
}
