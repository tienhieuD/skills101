// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MobileNav } from '@/components/MobileNav'

describe('MobileNav', () => {
  it('defaults to closed: hamburger button visible with aria-expanded=false', () => {
    render(<MobileNav />)
    const button = screen.getByRole('button', { name: 'Mở menu' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'false')
    // Drawer is closed → nav links not rendered (Headless UI Transition unmounted)
    expect(screen.queryByRole('link', { name: 'Trang chủ' })).toBeNull()
  })

  it('opens drawer with 2 links when hamburger clicked', () => {
    render(<MobileNav />)
    const button = screen.getByRole('button', { name: 'Mở menu' })
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'Trang chủ' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Giới thiệu' })).toHaveAttribute('href', '/about')
  })

  it('clicking a link closes the drawer (aria-expanded resets)', () => {
    render(<MobileNav />)
    const button = screen.getByRole('button', { name: 'Mở menu' })
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    const homeLink = screen.getByRole('link', { name: 'Trang chủ' })
    fireEvent.click(homeLink)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })
})
