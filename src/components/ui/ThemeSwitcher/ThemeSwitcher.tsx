'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { IconButton } from '../IconButton'
import { SunIcon, MoonIcon } from '../primitives/icons'

export interface ThemeSwitcherProps {
  className?: string
}

/**
 * Light/dark theme toggle. Uses `next-themes` `useTheme` hook.
 * Renders a placeholder until mounted to avoid hydration mismatch.
 *
 * Requires `<ThemeProvider attribute="class">` (from next-themes) higher in the tree.
 */
export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <IconButton aria-label="Theme" className={className} disabled>
        <span aria-hidden="true" style={{ width: 20, height: 20 }} />
      </IconButton>
    )
  }

  const current = resolvedTheme ?? theme
  const next = current === 'dark' ? 'light' : 'dark'
  const label = current === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'

  return (
    <IconButton
      aria-label={label}
      title={label}
      onClick={() => setTheme(next)}
      className={className}
    >
      {current === 'dark' ? <SunIcon /> : <MoonIcon />}
    </IconButton>
  )
}
