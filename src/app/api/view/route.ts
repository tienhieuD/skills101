import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { kv } from '@vercel/kv'
import { getAllSlugs } from '@/lib/posts'

const SLUG_REGEX = /^[a-z0-9-]+$/

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !('slug' in body) ||
    typeof (body as { slug: unknown }).slug !== 'string'
  ) {
    return NextResponse.json({ error: 'Missing or invalid slug' }, { status: 400 })
  }
  const slug = (body as { slug: string }).slug

  if (!SLUG_REGEX.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 })
  }

  if (!getAllSlugs().includes(slug)) {
    return NextResponse.json({ error: 'Slug not found' }, { status: 404 })
  }

  const views = await kv.incr(`views:${slug}`)
  return NextResponse.json({ views })
}
