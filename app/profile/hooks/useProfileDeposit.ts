import { useState, useEffect } from 'react'
import { depositService } from '@/lib/api/services/payment'
import { useToast } from '@/hooks/use-toast'

export function useProfileDeposit(mounted: boolean) {
  const { toast } = useToast()
  const [depositBalance, setDepositBalance] = useState<number | null>(null)
  const [isLoadingDeposit, setIsLoadingDeposit] = useState(false)

  // 예치금 조회 함수 (재사용 가능하도록 분리)
  const fetchDepositBalance = async () => {
    setIsLoadingDeposit(true)
    try {
      const response = await depositService.getDeposit()
      // 백엔드 응답: { status, data: { userId, amount }, message }
      setDepositBalance(response.amount)
    } catch (error: unknown) {
      // 404 에러인 경우 예치금 계정이 없는 것으로 처리 (정상)
      if ((error as { status?: number })?.status === 404) {
        console.log(
          '예치금 계정 없음 (정상):',
          (error as { message?: string })?.message || '예치금 계정이 없습니다.'
        )
        setDepositBalance(0)
      } else {
        // 다른 에러인 경우 상세 정보 로깅
        const err = error as {
          status?: number
          message?: string
          code?: string
          details?: string
        }
        console.error('예치금 조회 실패:', {
          status: err?.status,
          message: err?.message,
          code: err?.code,
          details: err?.details,
          error: error,
        })
        setDepositBalance(0)
      }
    } finally {
      setIsLoadingDeposit(false)
    }
  }

  // 예치금 조회 (구매자, 판매자 모두)
  useEffect(() => {
    if (mounted) {
      fetchDepositBalance()
    }
  }, [mounted])

  return {
    depositBalance,
    isLoadingDeposit,
    fetchDepositBalance,
  }
}
