import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'skills101',
  description: 'Blog cá nhân về lập trình',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
