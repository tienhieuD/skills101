import Link from 'next/link'

export const metadata = {
  title: 'Offline',
}

export default function OfflinePage() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold mb-4">Bạn đang offline</h1>
      <p className="mb-8" style={{ color: 'var(--gray-600)' }}>
        Bài này chưa được lưu offline. Vui lòng kết nối mạng và thử lại.
      </p>
      <Link href="/" className="inline-flex items-center px-4 py-2 min-h-[44px] underline">
        Về trang chủ
      </Link>
    </div>
  )
}
