import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider } from 'next-themes'
import { Analytics } from '@vercel/analytics/next'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { MobileNav } from '@/components/MobileNav'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | Blog',
    default: 'Blog cá nhân về lập trình',
  },
  description: 'Chia sẻ kiến thức lập trình.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <header className="border-b relative" style={{ borderColor: 'var(--border)' }}>
            <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
              <Link href="/" className="font-semibold text-lg">Blog</Link>
              <div className="flex items-center gap-2">
                <nav className="hidden md:flex items-center gap-4 text-sm">
                  <Link href="/">Trang chủ</Link>
                  <Link href="/about">Giới thiệu</Link>
                </nav>
                <ThemeToggle />
                <MobileNav />
              </div>
            </div>
          </header>
          <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">{children}</main>
          <footer className="border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="max-w-3xl mx-auto px-4 py-6 text-sm text-center" style={{ color: 'var(--gray-600)' }}>
              © 2026 Blog cá nhân
            </div>
          </footer>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
