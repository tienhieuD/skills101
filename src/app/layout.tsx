import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider } from 'next-themes'
import { Analytics } from '@vercel/analytics/next'
import Link from 'next/link'
import { HeaderActions } from '@/components/HeaderActions'
import { cn } from '@/lib/utils'
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
    <html
      lang="vi"
      suppressHydrationWarning
      className={cn(GeistSans.variable, GeistMono.variable, 'font-sans')}
    >
      <body className="min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="sticky top-0 z-40 bg-[var(--background)]/85 backdrop-blur border-b border-[var(--border)]">
            <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
              <Link
                href="/"
                className="inline-flex items-center gap-2 font-semibold tracking-tight"
              >
                <span className="text-[15px]">Blog</span>
              </Link>
              <div className="flex items-center gap-1">
                <nav className="hidden md:flex items-center text-sm text-[var(--gray-600)]">
                  <Link
                    href="/"
                    className="inline-flex items-center px-3 h-10 hover:text-[var(--foreground)] transition-colors"
                  >
                    Bài viết
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center px-3 h-10 hover:text-[var(--foreground)] transition-colors"
                  >
                    Giới thiệu
                  </Link>
                </nav>
                <HeaderActions />
              </div>
            </div>
          </header>
          <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-16">{children}</main>
          <footer className="border-t border-[var(--border)]">
            <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[var(--gray-500)]">
              <div>© 2026 Blog cá nhân về lập trình</div>
              <div className="flex items-center gap-4">
                <Link href="/rss.xml" className="hover:text-[var(--foreground)] transition-colors">
                  RSS
                </Link>
                <Link
                  href="/sitemap.xml"
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  Sitemap
                </Link>
              </div>
            </div>
          </footer>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
