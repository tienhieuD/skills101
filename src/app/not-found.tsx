import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="mb-8" style={{ color: 'var(--gray-600)' }}>
        Trang bạn tìm không tồn tại.
      </p>
      <Link href="/" className="inline-flex items-center px-4 py-2 min-h-[44px] underline">
        Về trang chủ
      </Link>
    </div>
  )
}
