import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="mb-8 text-[var(--gray-600)]">Trang bạn tìm không tồn tại.</p>
      <Link
        href="/"
        className="inline-flex items-center justify-center h-11 px-4 min-h-[44px] rounded-md border border-[var(--border-strong)] text-sm font-medium hover:bg-[var(--gray-100)] transition-colors"
      >
        Về trang chủ
      </Link>
    </div>
  )
}
