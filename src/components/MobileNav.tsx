'use client'

import { useState } from 'react'
import Link from 'next/link'

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Mở menu"
        aria-expanded={isOpen}
        className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded border"
        style={{ borderColor: 'var(--border)' }}
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {isOpen && (
        <nav
          className="absolute right-0 left-0 top-full mt-2 mx-4 p-4 rounded border"
          style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
        >
          <ul className="flex flex-col gap-2">
            <li><Link href="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 min-h-[44px]">Trang chủ</Link></li>
            <li><Link href="/about" onClick={() => setIsOpen(false)} className="block px-3 py-2 min-h-[44px]">Giới thiệu</Link></li>
          </ul>
        </nav>
      )}
    </div>
  )
}
