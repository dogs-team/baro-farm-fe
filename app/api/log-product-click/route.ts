import { NextRequest, NextResponse } from 'next/server'
import { writeEventLog } from '@/lib/utils/event-logger'

export async function POST(req: NextRequest) {
  try {
    console.log('[API] /api/log-product-click called')
    const body = await req.json().catch((err: unknown) => {
      console.error('[API] /api/log-product-click JSON parse error', err)
      return null
    })

    if (!body) {
      console.warn('[API] /api/log-product-click: empty body')
      return NextResponse.json({ ok: false, error: 'Empty body' }, { status: 400 })
    }

    // 최소한의 검증
    const { productId, productName, storeName, price, timestamp, path } = body || {}

    console.log('[API] /api/log-product-click payload', {
      productId,
      productName,
      storeName,
      price,
      timestamp,
      path,
    })

    // S3 마운트 경로에 로그 적재
    await writeEventLog('product_detail_click', {
      productId,
      productName,
      storeName,
      price,
      timestamp,
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
    console.error('[API] /api/log-product-click error', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
