import type { Metadata } from 'next'
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
    <html lang="vi">
      <body>
        <header>
          <h1>
            <a href="/">Blog cá nhân về lập trình</a>
          </h1>
          <nav>
            <a href="/">Trang chủ</a>
            {' | '}
            <a href="/about">Giới thiệu</a>
            {' | '}
            <a href="/rss.xml">RSS</a>
            {' | '}
            <a href="/sitemap.xml">Sitemap</a>
          </nav>
          <hr />
        </header>
        <main>{children}</main>
        <hr />
        <footer>
          <p>© 2026 Blog cá nhân về lập trình.</p>
        </footer>
      </body>
    </html>
  )
}
