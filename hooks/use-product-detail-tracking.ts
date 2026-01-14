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
  const viewStartSentRef = useRef(false)
  // 최신 productName을 ref로 저장하여 클로저 문제 해결
  const productNameRef = useRef<string>('')

  // productName이 업데이트되면 ref에 저장
  useEffect(() => {
    if (productName) {
      productNameRef.current = productName
    }
  }, [productName])

  // view_start는 productName이 로드된 후에만 전송 (한 번만)
  useEffect(() => {
    if (!productId || !productName || viewStartSentRef.current) {
      return
    }

    viewStartSentRef.current = true
    const now = Date.now()
    startTimeRef.current = now

    // view_start API 호출 주석처리
    // const pageViewPayload = {
    //   type: 'product_detail_view_start',
    //   productId: String(productId),
    //   productName: productName,
    //   timestamp: now,
    //   path: window.location.pathname,
    // }

    // 1) Google Analytics gtag 이벤트 (선택 사항)
    // try {
    //   if (typeof window !== 'undefined' && 'gtag' in window) {
    //     const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag
    //     gtag?.('event', 'product_detail_view_start', {
    //       event_category: 'engagement',
    //       event_label: String(productId),
    //       product_name: productName,
    //       page_path: window.location.pathname,
    //     })
    //   }
    // } catch (error) {
    //   console.warn('[Tracking] gtag view_start error', error)
    // }

    // 2) 커스텀 API로 전송 (주석처리)
    // try {
    //   console.log('[Tracking] Sending product_detail_view_start to API...', pageViewPayload)
    //   fetch('/api/log-product-view', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(pageViewPayload),
    //     keepalive: true,
    //   })
    //     .then(async (res) => {
    //       const text = await res.text()
    //       console.log('[Tracking] log-product-view response', {
    //         status: res.status,
    //         statusText: res.statusText,
    //         body: text,
    //         ok: res.ok,
    //       })
    //       if (!res.ok) {
    //         console.error('[Tracking] API returned error:', {
    //           status: res.status,
    //           body: text,
    //         })
    //       }
    //     })
    //     .catch((err) => {
    //       console.error('[Tracking] log-product-view fetch error', {
    //         error: err,
    //         message: err?.message,
    //         stack: err?.stack,
    //       })
    //     })
    // } catch (error) {
    //   console.error('[Tracking] view_start error (outer)', {
    //     error,
    //     message: (error as Error)?.message,
    //   })
    // }
  }, [productId, productName])

  // 체류 시간 측정 (페이지 이탈 시) - productId만 의존성으로 사용
  useEffect(() => {
    if (!productId) {
      return
    }

    // 시작 시간이 없으면 설정 (한 번만)
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now()
    }
    // sentRef는 리셋하지 않음 (이미 전송했으면 다시 전송 안 함)

    const sendDwellTime = (reason: string) => {
      if (sentRef.current || startTimeRef.current == null) return
      sentRef.current = true

      const endTime = Date.now()
      const dwellTimeMs = endTime - startTimeRef.current

      // ref에서 최신 productName 가져오기
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
