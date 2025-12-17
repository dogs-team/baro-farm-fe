import { useState, useEffect } from 'react'
import { depositService } from '@/lib/api/services/payment'
import { useToast } from '@/hooks/use-toast'
import type { ProfileUser } from '../types'

export function useTossPayments(user: ProfileUser) {
  const { toast } = useToast()
  const [tossWidget, setTossWidget] = useState<
    import('@/types/toss-payments').TossPaymentsInstance | null
  >(null)
  const [isCharging, setIsCharging] = useState(false)

  // 토스페이먼츠 위젯 로드 (예치금 충전용)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const loadTossWidget = () => {
      try {
        if (window.TossPayments) {
          const clientKey =
            process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'
          if (!clientKey) {
            console.error('토스페이먼츠 클라이언트 키가 설정되지 않았습니다.')
            return
          }
          const widget = window.TossPayments(clientKey)
          if (widget && typeof widget.requestPayment === 'function') {
            setTossWidget(widget)
            console.log('[Profile] 토스페이먼츠 위젯 초기화 완료')
          } else {
            console.error(
              '[Profile] 토스페이먼츠 위젯 초기화 실패: requestPayment 함수가 없습니다.'
            )
          }
        } else {
          const script = document.createElement('script')
          script.src = 'https://js.tosspayments.com/v1/payment'
          script.async = true
          script.onload = () => {
            setTimeout(() => {
              try {
                const clientKey =
                  process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'
                if (!clientKey) {
                  console.error('토스페이먼츠 클라이언트 키가 설정되지 않았습니다.')
                  return
                }
                if (window.TossPayments) {
                  const widget = window.TossPayments(clientKey)
                  if (widget && typeof widget.requestPayment === 'function') {
                    setTossWidget(widget)
                    console.log('[Profile] 토스페이먼츠 위젯 초기화 완료')
                  } else {
                    console.error(
                      '[Profile] 토스페이먼츠 위젯 초기화 실패: requestPayment 함수가 없습니다.'
                    )
                  }
                } else {
                  console.error(
                    '[Profile] 토스페이먼츠 스크립트 로드 후 TossPayments 객체를 찾을 수 없습니다.'
                  )
                }
              } catch (error) {
                console.error('[Profile] 토스페이먼츠 위젯 초기화 중 오류:', error)
              }
            }, 100)
          }
          script.onerror = () => {
            console.error('[Profile] 토스페이먼츠 스크립트 로드 실패')
          }
          document.body.appendChild(script)
        }
      } catch (error) {
        console.error('[Profile] 토스페이먼츠 위젯 로드 중 오류:', error)
      }
    }

    loadTossWidget()
  }, [])

  // 예치금 충전 처리
  const handleDepositCharge = async (
    chargeAmount: string,
    fetchDepositBalance: () => Promise<void>
  ) => {
    const amount = parseInt(chargeAmount.replace(/,/g, ''), 10)

    if (!amount || amount < 1000) {
      toast({
        title: '충전 금액 오류',
        description: '최소 1,000원 이상 충전 가능합니다.',
        variant: 'destructive',
      })
      return false
    }

    if (amount > 1000000) {
      toast({
        title: '충전 금액 오류',
        description: '최대 1,000,000원까지 충전 가능합니다.',
        variant: 'destructive',
      })
      return false
    }

    setIsCharging(true)
    try {
      // 1. 예치금 충전 요청 생성 (서버에서 chargeId 발급)
      let chargeId: string
      let chargeAmountValue: number = amount

      try {
        const response = await depositService.createCharge({ amount })
        chargeId = response.chargeId || `CHARGE-${Date.now()}`
        chargeAmountValue = response.amount || amount
        console.log('[Profile] 예치금 충전 요청 생성 성공:', { chargeId, chargeAmountValue })
      } catch (chargeError: unknown) {
        console.error('[Profile] 예치금 충전 요청 생성 실패:', chargeError)
        // API 실패 시에도 임시 chargeId로 토스 결제 진행 (테스트용)
        chargeId = `CHARGE-${Date.now()}`
        chargeAmountValue = amount
        console.warn('[Profile] 임시 chargeId로 토스 결제 진행:', chargeId)
      }

      // 2. 토스페이먼츠 위젯 확인
      if (!tossWidget || typeof tossWidget.requestPayment !== 'function') {
        toast({
          title: '결제 위젯 로딩 중',
          description: '결제 위젯을 불러오는 중입니다. 잠시 후 다시 시도해주세요.',
          variant: 'destructive',
        })
        return false
      }

      // 3. 토스페이먼츠 결제 위젯 열기
      const baseUrl = typeof window !== 'undefined' && window.location ? window.location.origin : ''
      const successUrl = `${baseUrl}/deposit/success?orderId=${encodeURIComponent(chargeId)}`
      const failUrl = `${baseUrl}/deposit/fail?orderId=${encodeURIComponent(chargeId)}`

      console.log('[Profile] 토스페이먼츠 결제 요청:', {
        method: '간편결제',
        chargeId,
        amount: chargeAmountValue,
        orderName: '예치금 충전',
        successUrl,
        failUrl,
      })

      await tossWidget.requestPayment('간편결제', {
        orderId: chargeId,
        amount: chargeAmountValue,
        orderName: '예치금 충전',
        customerName: user.name || user.email || '고객',
        successUrl,
        failUrl,
      })

      // 결제 성공 시 successUrl로 이동하므로 여기서는 다이얼로그만 닫음
      return true
    } catch (error: unknown) {
      console.error('[Profile] 예치금 충전 실패:', error)
      const errorMessage =
        (error as { message?: string })?.message || '예치금 충전 중 오류가 발생했습니다.'
      toast({
        title: '충전 실패',
        description: errorMessage,
        variant: 'destructive',
      })
      return false
    } finally {
      setIsCharging(false)
    }
  }

  return {
    tossWidget,
    isCharging,
    handleDepositCharge,
  }
}
