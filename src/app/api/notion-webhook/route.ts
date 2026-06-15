import { createHmac, timingSafeEqual } from 'crypto'

import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { NextResponse, type NextRequest } from 'next/server'

import { apiError } from '@/lib/api-error'
import { getNotionClient } from '@/lib/notion-sync/client'
import { syncPageObject } from '@/lib/notion-sync/syncPost'

const INSTANCE = '/api/notion-webhook'

/**
 * Notion webhook handler. Verifies the HMAC-SHA256 signature (REQ-SEC-001)
 * before parsing the payload, then dispatches `page.updated` events to
 * `syncPageObject` (REQ-FUNC-014). Emits structured JSON logs per
 * REQ-OBS-001 and never logs secrets (REQ-SEC-003).
 *
 * Responds to Notion `url_verification` handshake within ≤ 3s by echoing
 * the challenge (API Design §5.1).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const rawBody = await request.text()
  const signature = request.headers.get('notion-signature') ?? ''

  const secret = process.env.NOTION_WEBHOOK_SECRET
  if (!secret) {
    return apiError(
      500,
      'internal-error',
      'Server misconfigured',
      'Missing webhook secret',
      INSTANCE,
    )
  }

  const expectedHmac = createHmac('sha256', secret).update(rawBody).digest('hex')
  const expected = `sha256=${expectedHmac}`
  const signatureBuf = Buffer.from(signature)
  const expectedBuf = Buffer.from(expected)
  if (
    signatureBuf.length !== expectedBuf.length ||
    !timingSafeEqual(signatureBuf, expectedBuf)
  ) {
    return apiError(
      401,
      'unauthorized',
      'Unauthorized',
      'Invalid webhook signature',
      INSTANCE,
    )
  }

  let payload: unknown
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return apiError(400, 'invalid-request', 'Bad Request', 'Invalid JSON', INSTANCE)
  }

  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('type' in payload) ||
    typeof (payload as { type: unknown }).type !== 'string'
  ) {
    return NextResponse.json({ ignored: true })
  }

  const eventType = (payload as { type: string }).type

  if (eventType === 'url_verification') {
    const challenge = (payload as { challenge?: unknown }).challenge
    if (typeof challenge !== 'string') {
      return apiError(
        400,
        'invalid-request',
        'Bad Request',
        'Missing challenge',
        INSTANCE,
      )
    }
    return NextResponse.json({ challenge })
  }

  if (eventType === 'page.updated') {
    const entity = (payload as { entity?: { id?: unknown } }).entity
    const pageId =
      entity && typeof entity.id === 'string' ? entity.id : undefined
    if (!pageId) {
      return apiError(
        400,
        'invalid-request',
        'Bad Request',
        'Missing entity.id',
        INSTANCE,
      )
    }

    const client = getNotionClient()
    const page = await client.pages.retrieve({ page_id: pageId })
    if (!('properties' in page)) {
      return apiError(
        400,
        'invalid-request',
        'Bad Request',
        'Page object missing properties',
        INSTANCE,
      )
    }

    const startTime = Date.now()
    try {
      const status = await syncPageObject(page as PageObjectResponse)
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          trigger: 'webhook',
          pageId,
          result: status,
          durationMs: Date.now() - startTime,
        }),
      )
      return NextResponse.json({
        synced: status === 'synced',
        skipped: status === 'skipped',
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          trigger: 'webhook',
          pageId,
          result: 'failed',
          error: message,
        }),
      )
      return apiError(
        500,
        'internal-error',
        'Sync failed',
        'Internal error',
        INSTANCE,
      )
    }
  }

  return NextResponse.json({ ignored: true })
}
