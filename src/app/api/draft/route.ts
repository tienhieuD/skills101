import { timingSafeEqual } from 'crypto'

import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextResponse, type NextRequest } from 'next/server'

const SLUG_REGEX = /^[a-z0-9-]+$/

export async function GET(
  request: NextRequest,
): Promise<NextResponse | never> {
  const secret = request.nextUrl.searchParams.get('secret') ?? ''
  const slug = request.nextUrl.searchParams.get('slug') ?? ''

  const expected = process.env.DRAFT_SECRET ?? ''
  if (
    !expected ||
    secret.length !== expected.length ||
    !timingSafeEqual(Buffer.from(secret), Buffer.from(expected))
  ) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  if (!SLUG_REGEX.test(slug)) {
    return new NextResponse('Invalid slug', { status: 400 })
  }

  const draft = await draftMode()
  draft.enable()

  redirect(`/posts/${slug}`)
}
