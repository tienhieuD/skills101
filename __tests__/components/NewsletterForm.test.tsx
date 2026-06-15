// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NewsletterForm } from '@/components/NewsletterForm'

describe('NewsletterForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('does not call fetch when email is invalid and shows error', () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ subscribed: true }), { status: 200 }),
    )
    const { container } = render(<NewsletterForm />)
    const input = screen.getByLabelText('Đăng ký nhận bài mới') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'notanemail' } })
    // submit form directly to bypass native browser email validation
    const form = container.querySelector('form')!
    fireEvent.submit(form)
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(screen.getByRole('alert').textContent).toContain('email hợp lệ')
  })

  it('calls /api/newsletter with email body on valid submit', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ subscribed: true }), { status: 200 }),
    )
    const { container } = render(<NewsletterForm />)
    const input = screen.getByLabelText('Đăng ký nhận bài mới') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'user@example.com' } })
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled())
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/newsletter')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({ email: 'user@example.com' })
  })

  it('shows success message on 200 response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ subscribed: true }), { status: 200 }),
    )
    const { container } = render(<NewsletterForm />)
    fireEvent.change(screen.getByLabelText('Đăng ký nhận bài mới'), {
      target: { value: 'user@example.com' },
    })
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() =>
      expect(screen.getByText(/Đăng ký thành công/)).toBeTruthy(),
    )
  })

  it('shows error message on 400 response with detail', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          type: 'invalid-request',
          title: 'Bad',
          detail: 'Email không hợp lệ',
          status: 400,
        }),
        { status: 400 },
      ),
    )
    const { container } = render(<NewsletterForm />)
    fireEvent.change(screen.getByLabelText('Đăng ký nhận bài mới'), {
      target: { value: 'user@example.com' },
    })
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('Email không hợp lệ')
    })
  })
})
