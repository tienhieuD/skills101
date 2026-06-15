import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { buttonVariants } from '@/components/ui/button'

export const metadata = {
  title: 'Offline',
}

export default function OfflinePage() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold mb-4">Bạn đang offline</h1>
      <Alert className="mb-8 text-left">
        <AlertTitle>Không có kết nối mạng</AlertTitle>
        <AlertDescription>
          Bài này chưa được lưu offline. Vui lòng kết nối mạng và thử lại.
        </AlertDescription>
      </Alert>
      <Link href="/" className={buttonVariants({ variant: 'outline' })}>
        Về trang chủ
      </Link>
    </div>
  )
}
