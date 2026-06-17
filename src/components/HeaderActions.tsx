'use client'

import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

const ThemeSwitcher = dynamic(
  () => import('./ThemeSwitcher').then((m) => ({ default: m.ThemeSwitcher })),
  {
    ssr: false,
    loading: () => (
      <Button variant="ghost" size="icon" aria-label="Theme" disabled>
        <span className="sr-only">Theme</span>
      </Button>
    ),
  }
)

const MobileNav = dynamic(
  () => import('./MobileNav').then((m) => ({ default: m.MobileNav })),
  {
    ssr: false,
    loading: () => (
      <div className="md:hidden">
        <Button variant="ghost" size="icon" aria-label="Mở menu" disabled>
          <Menu />
        </Button>
      </div>
    ),
  }
)

export function HeaderActions() {
  return (
    <>
      <ThemeSwitcher />
      <MobileNav />
    </>
  )
}
