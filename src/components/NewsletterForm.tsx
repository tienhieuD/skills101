'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
    return (
      <Card>
        <CardContent className="pt-6">
          Đăng ký thành công! Kiểm tra email của bạn.
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Label htmlFor="newsletter-email">Đăng ký nhận bài mới</Label>
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
        <Button type="submit" disabled={status === 'loading'}>
          {status === 'loading' && <Loader2 className="size-4 animate-spin" />}
          {status === 'loading' ? 'Đang gửi...' : 'Đăng ký'}
        </Button>
      </div>
      {status === 'error' && errorMsg && (
        <p className="text-sm text-destructive" role="alert">
          {errorMsg}
        </p>
      )}
    </form>
  )
}
