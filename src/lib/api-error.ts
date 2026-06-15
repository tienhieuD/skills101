import { NextResponse } from 'next/server'

/**
 * Returns an RFC 7807 `application/problem+json` error response.
 * See Coding Convention §11 (Error handling).
 */
export function apiError(
  status: number,
  code: string,
  title: string,
  detail: string,
  instance: string,
): NextResponse {
  return NextResponse.json(
    {
      type: `/errors/${code}`,
      title,
      status,
      detail,
      instance,
    },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  )
}
