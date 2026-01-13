'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useLogout } from '@/hooks/useLogout'
import { authService } from '@/lib/api/services/auth'
import { sellerService } from '@/lib/api/services/seller'
import { farmService } from '@/lib/api/services/farm'
import { useProfileUser } from './hooks/useProfileUser'
import { useProfileOrders } from './hooks/useProfileOrders'
import { useProfileDeposit } from './hooks/useProfileDeposit'
import { useTossPayments } from './hooks/useTossPayments'
import { ProfileView } from './ProfileView'
import type {
  MySettlementResponse,
  SellerApplyRequestDto,
  SettlementMonth,
} from '@/lib/api/types/seller'

export function ProfileContainer() {
  const { toast } = useToast()
  const { logout } = useLogout()
  const { user, isLoadingUser, mounted, setUser } = useProfileUser()
  const { orders, isLoadingOrders, orderCount, buyerCount, reviewCount, isLoadingReviews } =
    useProfileOrders(user.userId, mounted)
  const { depositBalance, isLoadingDeposit, fetchDepositBalance } = useProfileDeposit(mounted)
  const { isCharging, handleDepositCharge } = useTossPayments(user)

  // UI state
  const [activeTab, setActiveTab] = useState('buyer')
  const [isSellerDialogOpen, setIsSellerDialogOpen] = useState(false)
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [isDepositChargeDialogOpen, setIsDepositChargeDialogOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null)
  const [chargeAmount, setChargeAmount] = useState<string>('')
  const [sellerApplication, setSellerApplication] = useState<SellerApplyRequestDto>({
    storeName: '',
    business_reg_no: '',
    business_owner_name: '',
    settlement_bank: '',
    settlement_account: '',
  })

  // 판매자 정산금액 상태
  const [monthlySettlement, setMonthlySettlement] = useState<number>(0)
  const [isLoadingSettlement, setIsLoadingSettlement] = useState(false)
  const [settlementData, setSettlementData] = useState<MySettlementResponse | null>(null)
  const [settlementMonth, setSettlementMonth] = useState<SettlementMonth | null>(null)

  // 내 농장 보유 여부 (SELLER 전용)
  const [hasFarm, setHasFarm] = useState<boolean | null>(null)
  const [isCheckingFarm, setIsCheckingFarm] = useState(false)

  // 이번달 정산금액 조회 (판매자만)
  useEffect(() => {
    const fetchMonthlySettlement = async () => {
      if (!mounted || user.role !== 'SELLER') return

      setIsLoadingSettlement(true)
      try {
        const data = await sellerService.getMySettlements()
        console.log('정산 데이터 수신:', data)
        setSettlementData(data)
        setMonthlySettlement(0) // 데이터를 가져오기 전에 초기화

        // settlementMonth가 문자열("2025-11")인 경우 파싱
        const settlementMonthStr = data.settlementMonth
        const [year, month] = settlementMonthStr.split('-')
        const settlementMonthValue = parseInt(month, 10)
        setSettlementMonth({
          year: parseInt(year, 10),
          month: new Date(parseInt(year, 10), parseInt(month, 10) - 1)
            .toLocaleString('en-US', { month: 'long' })
            .toUpperCase(),
          monthValue: settlementMonthValue,
          leapYear: new Date(parseInt(year, 10), 1, 29).getDate() === 29,
        })

        // 이번 달 정산인지 확인
        const currentMonth = new Date().getMonth() + 1 // JavaScript: 0-11, YearMonth: 1-12
        console.log(
          `현재 월: ${currentMonth}, 정산 월: ${settlementMonthValue}, 금액: ${data.payoutAmount}`
        )

        if (settlementMonthValue === currentMonth) {
          // 이번 달 정산 금액 사용
          setMonthlySettlement(data.payoutAmount)
          console.log(`이번 달 정산 금액 설정: ${data.payoutAmount}`)
        } else {
          // 이번 달 정산이 아닌 경우에도 기존 데이터 표시 (0이 아닌 실제 금액)
          console.warn(
            `정산 데이터가 이번 달(${currentMonth})이 아닌 ${settlementMonthValue}월 데이터입니다.`
          )
          // 기존 정산 금액을 표시 (없으면 0)
          setMonthlySettlement(data.payoutAmount || 0)
          console.log(`지난 달 정산 금액 설정: ${data.payoutAmount || 0}`)
        }
      } catch (error: any) {
        console.error('정산금액 조회 실패:', error)

        // 404 에러인 경우 정산 데이터가 없음으로 처리
        if (error.status === 404) {
          setSettlementData(null)
          setSettlementMonth(null)
          setMonthlySettlement(0)
        } else {
          // 다른 에러는 기존처럼 처리
          setSettlementData(null)
          setSettlementMonth(null)
          setMonthlySettlement(0)
        }
      } finally {
        setIsLoadingSettlement(false)
      }
    }

    fetchMonthlySettlement()
  }, [mounted, user.role])

  // SELLER의 경우 내 농장 보유 여부 확인
  useEffect(() => {
    const checkMyFarm = async () => {
      if (!mounted || user.role !== 'SELLER') return

      setIsCheckingFarm(true)
      try {
        const response = await farmService.getFarms({ page: 0, size: 1 })
        const content = Array.isArray(response?.content) ? response.content : []
        setHasFarm(content.length > 0)
      } catch (error: any) {
        if (error?.status === 404) {
          // 농장이 없는 경우 (정상 케이스)
          setHasFarm(false)
        } else {
          console.error('내 농장 조회 실패:', error)
          setHasFarm(false)
        }
      } finally {
        setIsCheckingFarm(false)
      }
    }

    checkMyFarm()
  }, [mounted, user.role])

  const handleSellerApplication = async () => {
    if (!sellerApplication.storeName || !sellerApplication.business_reg_no) {
      toast({
        title: '필수 항목 입력',
        description: '상점 이름과 사업자 등록 번호를 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    try {
      // TODO: 실제 판매자 신청 API 호출 (현재는 grantSellerRole로 임시 처리)
      await authService.grantSellerRole(user.userId)

      toast({
        title: '판매자 전환 완료',
        description: '판매자 권한이 부여되었습니다. 페이지를 새로고침합니다.',
      })

      setIsSellerDialogOpen(false)
      setSellerApplication({
        storeName: '',
        business_reg_no: '',
        business_owner_name: '',
        settlement_bank: '',
        settlement_account: '',
      })

      // 사용자 정보 다시 조회하여 역할 업데이트
      const updatedUser = await authService.getCurrentUser()
      setUser({
        ...updatedUser,
        name: updatedUser.email?.split('@')[0] || '사용자',
        phone: '',
        avatar: '/placeholder.svg',
      })

      // 페이지 새로고침
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error: unknown) {
      console.error('판매자 전환 실패:', error)
      toast({
        title: '신청 실패',
        description:
          (error as { message?: string })?.message || '판매자 전환 신청 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  const handleDepositChargeClick = async () => {
    const success = await handleDepositCharge(chargeAmount, fetchDepositBalance)
    if (success) {
      setIsDepositChargeDialogOpen(false)
      setChargeAmount('')
    }
  }

  const handleLogout = async () => {
    await logout({ reload: true })
  }

  const profileState = {
    // User state
    user,
    isLoadingUser,
    mounted,

    // Orders state
    orders,
    isLoadingOrders,
    orderCount,
    buyerCount,
    reviewCount,
    isLoadingReviews,

    // Deposit state
    depositBalance,
    isLoadingDeposit,

    // Seller state
    monthlySettlement,
    isLoadingSettlement,
    settlementData,
    settlementMonth,

    // Farm state
    hasFarm,
    isCheckingFarm,

    // UI state
    activeTab,
    isSellerDialogOpen,
    isAddressDialogOpen,
    isDepositChargeDialogOpen,
    editingAddressId,
    chargeAmount,
    isCharging,
    sellerApplication,
  }

  const profileActions = {
    setActiveTab,
    setIsSellerDialogOpen,
    setIsAddressDialogOpen,
    setIsDepositChargeDialogOpen,
    setEditingAddressId,
    setChargeAmount,
    setSellerApplication,
    handleSellerApplication,
    handleDepositChargeClick,
    handleLogout,
  }

  return <ProfileView state={profileState} actions={profileActions} />
}
