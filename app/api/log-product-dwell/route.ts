import { NextRequest, NextResponse } from 'next/server'
import { writeEventLog } from '@/lib/utils/event-logger'

export async function POST(req: NextRequest) {
  try {
    console.log('[API] /api/log-product-dwell called')
    const body = await req.json().catch((err: unknown) => {
      console.error('[API] /api/log-product-dwell JSON parse error', err)
      return null
    })

    if (!body) {
      console.warn('[API] /api/log-product-dwell: empty body')
      return NextResponse.json({ ok: false, error: 'Empty body' }, { status: 400 })
    }

    const { productId, productName, dwellTimeMs, startTime, endTime, reason, path } = body || {}

    console.log('[API] /api/log-product-dwell payload', {
      productId,
      productName,
      dwellTimeMs,
      startTime,
      endTime,
      reason,
      path,
    })

    await writeEventLog('product_detail_dwell_time', {
      productId,
      productName,
      dwellTimeMs,
      startTime,
      endTime,
      reason,
      path,
      receivedAt: Date.now(),
      userAgent: req.headers.get('user-agent'),
      ip:
        req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        req.headers.get('x-real-ip') ||
        'unknown',
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[API] /api/log-product-dwell error', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
