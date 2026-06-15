// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import React from 'react'
import { ThemeSwitcher as ThemeToggle } from '@/components/ThemeSwitcher'

const setTheme = vi.fn()
let mockState: { theme?: string; resolvedTheme?: string } = {}

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: mockState.theme,
    resolvedTheme: mockState.resolvedTheme,
    setTheme,
  }),
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    setTheme.mockClear()
    mockState = {}
  })

  it('renders placeholder without icon before mount (SSR)', () => {
    mockState = { theme: 'light', resolvedTheme: 'light' }
    const html = renderToString(<ThemeToggle />)
    expect(html).toContain('aria-label="Theme"')
    expect(html).not.toContain('<svg')
  })

  it('after mount with theme=light renders moon icon and clicking calls setTheme("dark")', () => {
    mockState = { theme: 'light', resolvedTheme: 'light' }
    act(() => {
      render(<ThemeToggle />)
    })
    const btn = screen.getByLabelText('Chuyển sang tối')
    expect(btn).toBeTruthy()
    const svg = btn.querySelector('svg')
    expect(svg).not.toBeNull()
    // Moon icon has a single <path> and no <circle>
    expect(svg?.querySelector('circle')).toBeNull()
    expect(svg?.querySelector('path')).not.toBeNull()
    fireEvent.click(btn)
    expect(setTheme).toHaveBeenCalledWith('dark')
  })

  it('after mount with theme=dark renders sun icon', () => {
    mockState = { theme: 'dark', resolvedTheme: 'dark' }
    act(() => {
      render(<ThemeToggle />)
    })
    const btn = screen.getByLabelText('Chuyển sang sáng')
    const svg = btn.querySelector('svg')
    // Sun icon has a <circle>
    expect(svg?.querySelector('circle')).not.toBeNull()
  })
})
