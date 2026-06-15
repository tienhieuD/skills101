// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MobileNav } from '@/components/MobileNav'

describe('MobileNav', () => {
  it('defaults to closed: menu hidden, hamburger button visible', () => {
    render(<MobileNav />)
    const button = screen.getByRole('button', { name: 'Mở menu' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: 'Trang chủ' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Giới thiệu' })).toBeNull()
  })

  it('opens menu with 2 links when hamburger clicked', () => {
    render(<MobileNav />)
    const button = screen.getByRole('button', { name: 'Mở menu' })
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Trang chủ' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Giới thiệu' })).toHaveAttribute('href', '/about')
  })

  it('closes menu when a link is clicked', () => {
    render(<MobileNav />)
    const button = screen.getByRole('button', { name: 'Mở menu' })
    fireEvent.click(button)
    const homeLink = screen.getByRole('link', { name: 'Trang chủ' })
    fireEvent.click(homeLink)
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: 'Trang chủ' })).toBeNull()
  })
})
