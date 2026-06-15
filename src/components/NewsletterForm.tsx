'use client'

import { useState } from 'react'
import { Button, Card, Input, Spinner } from '@/components/ui'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')

    // Client-side validate (REQ-FUNC-013 AC2 — không gửi nếu invalid)
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
    return <Card>Đăng ký thành công! Kiểm tra email của bạn.</Card>
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label htmlFor="newsletter-email" className="font-semibold">
        Đăng ký nhận bài mới
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
          disabled={status === 'loading'}
          className="flex-1"
        />
        <Button variant="primary" type="submit" disabled={status === 'loading'}>
          {status === 'loading' && <Spinner size="sm" label="Đang gửi" />}
          {status === 'loading' ? 'Đang gửi...' : 'Đăng ký'}
        </Button>
      </div>
      {status === 'error' && errorMsg && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {errorMsg}
        </p>
      )}
    </form>
  )
}
