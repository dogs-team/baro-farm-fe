import { NextRequest, NextResponse } from 'next/server'
import { writeEventLog } from '@/lib/utils/event-logger'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    const { productId, productName, dwellTimeMs, startTime, endTime, reason, path, userId } =
      body || {}

    await writeEventLog('product_detail_dwell_time', {
      productId,
      productName,
      dwellTimeMs,
      startTime,
      endTime,
      reason,
      path,
      userId: userId || null,
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
