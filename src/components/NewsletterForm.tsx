'use client'

import { useState } from 'react'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')
    if (!EMAIL_REGEX.test(email.trim())) {
      setStatus('error')
      setErrorMsg('Vui lòng nhập email hợp lệ.')
      return
    }
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        const body = await res.json().catch(() => null)
        setStatus('error')
        setErrorMsg(body?.detail ?? 'Đăng ký thất bại. Vui lòng thử lại.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Không thể kết nối. Vui lòng thử lại.')
    }
  }

  if (status === 'success') {
    return <p>Đăng ký thành công! Kiểm tra email của bạn.</p>
  }

  return (
    <form onSubmit={handleSubmit}>
      <p>
        <label htmlFor="newsletter-email">Đăng ký nhận bài mới: </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
          disabled={status === 'loading'}
          size={30}
        />{' '}
        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Đang gửi...' : 'Đăng ký'}
        </button>
      </p>
      {status === 'error' && errorMsg && (
        <p role="alert">
          <strong>Lỗi:</strong> {errorMsg}
        </p>
      )}
    </form>
  )
}
