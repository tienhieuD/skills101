import { type NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { Resend } from 'resend'
import { apiError } from '@/lib/api-error'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError(
      400,
      'invalid-request',
      'Bad Request',
      'Invalid JSON',
      '/api/newsletter',
    )
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !('email' in body) ||
    typeof (body as { email: unknown }).email !== 'string'
  ) {
    return apiError(
      400,
      'invalid-request',
      'Bad Request',
      'Missing email field',
      '/api/newsletter',
    )
  }

  const email = (body as { email: string }).email.trim().toLowerCase()

  if (!EMAIL_REGEX.test(email)) {
    return apiError(
      400,
      'invalid-request',
      'Email không hợp lệ',
      `Địa chỉ email '${email}' không đúng định dạng.`,
      '/api/newsletter',
    )
  }

  const isMember = await kv.sismember('newsletter:subscribers', email)
  if (isMember) {
    return NextResponse.json({ subscribed: true })
  }

  await kv.sadd('newsletter:subscribers', email)

  if (!process.env.RESEND_API_KEY) {
    console.warn(
      'RESEND_API_KEY not set; skipping confirmation email (dev fallback).',
    )
  } else {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`
    await resend.emails
      .send({
        from: 'Blog <noreply@example.com>',
        to: email,
        subject: 'Xác nhận đăng ký Blog',
        html: `<p>Cảm ơn bạn đã đăng ký nhận thông báo bài mới.</p>
              <p>Để huỷ đăng ký, nhấn <a href="${unsubscribeUrl}">tại đây</a>.</p>`,
      })
      .catch((err) => {
        console.error(
          'Resend send failed:',
          err instanceof Error ? err.message : err,
        )
      })
  }

  return NextResponse.json({ subscribed: true })
}
