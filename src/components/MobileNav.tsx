'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Drawer, IconButton } from '@/components/ui'
import { MenuIcon } from '@/components/ui/primitives/icons'

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <IconButton
        aria-label={isOpen ? 'Đóng menu' : 'Mở menu'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Menu điều hướng"
        side="right"
      >
        <nav>
          <ul className="flex flex-col gap-2">
            <li>
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 min-h-[44px]"
              >
                Trang chủ
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 min-h-[44px]"
              >
                Giới thiệu
              </Link>
            </li>
          </ul>
        </nav>
      </Drawer>
    </div>
  )
}
