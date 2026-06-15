import Link from 'next/link'
import { buttonVariants } from '@/components/ui'

export default function NotFound() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="mb-8 text-[var(--gray-600)]">Trang bạn tìm không tồn tại.</p>
      <Link href="/" className={buttonVariants({ variant: 'secondary' })}>
        Về trang chủ
      </Link>
    </div>
  )
}
