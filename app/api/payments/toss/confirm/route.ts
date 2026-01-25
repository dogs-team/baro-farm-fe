import { NextResponse } from 'next/server'

const GATEWAY_BASE = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://3.34.14.73:8080'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const cookie = req.headers.get('cookie') || ''
    const authorization = req.headers.get('authorization') || ''

    const response = await fetch(`${GATEWAY_BASE}/payment-service/api/v1/payments/toss/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { Cookie: cookie } : {}),
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: JSON.stringify(body),
    })

    const data = await response.json().catch(() => ({}))
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Failed to confirm payment',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
