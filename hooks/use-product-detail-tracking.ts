import { useEffect, useRef } from 'react'
import { getUserId } from '@/lib/api/client'

interface UseProductDetailTrackingOptions {
  productId: string | number | undefined
  productName?: string
}

/**
 * 상품 상세 페이지 체류 시간 트래킹 훅
 *
 * - 컴포넌트 마운트 시 시작 시간 기록
 * - 페이지 언로드 / 가시성 변경 / 컴포넌트 언마운트 시 체류 시간 계산
 * - Google Analytics(gTAG)와 커스텀 API 둘 다 지원 (둘 중 하나만 사용해도 됨)
 */
export function useProductDetailTracking(options: UseProductDetailTrackingOptions) {
  const { productId, productName } = options
  const startTimeRef = useRef<number | null>(null)
  const sentRef = useRef(false)
  const productNameRef = useRef<string>('')
  const isInitialMountRef = useRef(true)

  // productName을 ref로 저장 (의존성 문제 해결)
  useEffect(() => {
    if (productName) {
      productNameRef.current = productName
    }
  }, [productName])

  // 체류 시간 측정 (페이지 이탈 시) - productId만 의존성으로 사용
  useEffect(() => {
    if (!productId) {
      return
    }

    // 첫 마운트가 아니고, 이미 시작 시간이 설정되어 있으면 cleanup만 실행하지 않음
    if (!isInitialMountRef.current && startTimeRef.current !== null) {
      return
    }

    isInitialMountRef.current = false
    const now = Date.now()
    startTimeRef.current = now
    sentRef.current = false

    const sendDwellTime = (reason: string) => {
      if (sentRef.current || startTimeRef.current == null) return
      sentRef.current = true

      const endTime = Date.now()
      const dwellTimeMs = endTime - startTimeRef.current

      // 최소 체류 시간 체크 (1초 미만이면 전송 안 함 - 진입 직후 이탈 방지)
      if (dwellTimeMs < 1000 && reason === 'unmount') {
        console.log('[Tracking] 체류 시간이 너무 짧아서 전송하지 않음:', dwellTimeMs, 'ms')
        return
      }

      const userId = getUserId()
      const currentProductName = productNameRef.current || productName || ''

      const dwellPayload = {
        type: 'product_detail_dwell_time',
        productId: String(productId),
        productName: currentProductName,
        dwellTimeMs,
        startTime: startTimeRef.current,
        endTime,
        reason, // 'visibilitychange' | 'beforeunload' | 'pagehide' | 'unmount'
        path: window.location.pathname,
        userId: userId || null,
      }

      // GA 이벤트
      try {
        if (typeof window !== 'undefined' && 'gtag' in window) {
          const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag
          gtag?.('event', 'product_detail_dwell_time', {
            event_category: 'engagement',
            event_label: String(productId),
            product_name: currentProductName,
            dwell_time_ms: dwellTimeMs,
            page_path: window.location.pathname,
          })
        }
      } catch (error) {
        console.warn('[Tracking] gtag dwell_time error', error)
      }

      // 커스텀 API
      try {
        console.log('[Tracking] Sending product_detail_dwell_time to API...', dwellPayload)
        fetch('/api/log-product-dwell', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dwellPayload),
          keepalive: true,
        })
          .then(async (res) => {
            const text = await res.text()
            console.log('[Tracking] log-product-dwell response', {
              status: res.status,
              statusText: res.statusText,
              body: text,
              ok: res.ok,
            })
            if (!res.ok) {
              console.error('[Tracking] API returned error:', {
                status: res.status,
                body: text,
              })
            }
          })
          .catch((err) => {
            console.error('[Tracking] log-product-dwell fetch error', {
              error: err,
              message: err?.message,
              stack: err?.stack,
            })
          })
      } catch (error) {
        console.error('[Tracking] dwell_time send error (outer)', {
          error,
          message: (error as Error)?.message,
        })
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendDwellTime('visibilitychange')
      }
    }

    const handleBeforeUnload = () => {
      sendDwellTime('beforeunload')
    }

    const handlePageHide = () => {
      sendDwellTime('pagehide')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handlePageHide)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handlePageHide)

      // 라우트 변경 등으로 컴포넌트가 언마운트될 때만 체류 시간 전송
      // (productName 업데이트로 인한 cleanup은 제외)
      if (sentRef.current === false) {
        sendDwellTime('unmount')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]) // productName은 의존성에서 제외 (ref로 최신 값 참조)
}
