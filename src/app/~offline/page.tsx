import Link from 'next/link'
import { Note } from '@/components/ui/Note'
import { buttonVariants } from '@/components/ui/Button/Button.variants'

export const metadata = {
  title: 'Offline',
}

export default function OfflinePage() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold mb-4">Bạn đang offline</h1>
      <Note variant="warning" className="mb-8 text-left">
        Bài này chưa được lưu offline. Vui lòng kết nối mạng và thử lại.
      </Note>
      <Link href="/" className={buttonVariants({ variant: 'secondary' })}>
        Về trang chủ
      </Link>
    </div>
  )
}
