import { useEffect, useRef } from 'react'

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

  useEffect(() => {
    if (!productId) {
      return
    }

    const now = Date.now()
    startTimeRef.current = now
    sentRef.current = false

    const pageViewPayload = {
      type: 'product_detail_view_start',
      productId: String(productId),
      productName: productName ?? '',
      timestamp: now,
      path: window.location.pathname,
    }

    // 1) Google Analytics gtag 이벤트 (선택 사항)
    try {
      ;(window as any).gtag?.('event', 'product_detail_view_start', {
        event_category: 'engagement',
        event_label: String(productId),
        product_name: productName ?? '',
        page_path: window.location.pathname,
      })
    } catch (error) {
      console.warn('[Tracking] gtag view_start error', error)
    }

    // 2) 커스텀 API로 전송
    try {
      console.log('[Tracking] product_detail_view_start', pageViewPayload)
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/log-product-view', JSON.stringify(pageViewPayload))
      } else {
        fetch('/api/log-product-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pageViewPayload),
          keepalive: true,
        })
          .then((res) => {
            console.log('[Tracking] log-product-view response', res.status)
          })
          .catch((err) => {
            console.warn('[Tracking] log-product-view fetch error', err)
          })
      }
    } catch (error) {
      console.warn('[Tracking] sendBeacon view_start error', error)
    }

    const sendDwellTime = (reason: string) => {
      if (sentRef.current || startTimeRef.current == null) return
      sentRef.current = true

      const endTime = Date.now()
      const dwellTimeMs = endTime - startTimeRef.current

      const dwellPayload = {
        type: 'product_detail_dwell_time',
        productId: String(productId),
        productName: productName ?? '',
        dwellTimeMs,
        startTime: startTimeRef.current,
        endTime,
        reason, // 'visibilitychange' | 'beforeunload' | 'pagehide' | 'unmount'
        path: window.location.pathname,
      }

      // GA 이벤트
      try {
        ;(window as any).gtag?.('event', 'product_detail_dwell_time', {
          event_category: 'engagement',
          event_label: String(productId),
          product_name: productName ?? '',
          dwell_time_ms: dwellTimeMs,
          page_path: window.location.pathname,
        })
      } catch (error) {
        console.warn('[Tracking] gtag dwell_time error', error)
      }

      // 커스텀 API
      try {
        console.log('[Tracking] product_detail_dwell_time', dwellPayload)
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/log-product-dwell', JSON.stringify(dwellPayload))
        } else {
          fetch('/api/log-product-dwell', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(dwellPayload),
            keepalive: true,
          })
            .then((res) => {
              console.log('[Tracking] log-product-dwell response', res.status)
            })
            .catch((err) => {
              console.warn('[Tracking] log-product-dwell fetch error', err)
            })
        }
      } catch (error) {
        console.warn('[Tracking] dwell_time send error', error)
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

      // 라우트 변경 등으로 컴포넌트가 언마운트될 때도 체류 시간 전송
      sendDwellTime('unmount')
    }
  }, [productId, productName])
}
