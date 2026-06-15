'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Theme" disabled>
        <span className="sr-only">Theme</span>
      </Button>
    )
  }

  const current = resolvedTheme ?? theme
  const next = current === 'dark' ? 'light' : 'dark'
  const label = current === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      onClick={() => setTheme(next)}
    >
      {current === 'dark' ? <Sun /> : <Moon />}
    </Button>
  )
}
