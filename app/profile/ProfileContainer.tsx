'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { authService } from '@/lib/api/services/auth'
import { sellerService } from '@/lib/api/services/seller'
import { useProfileUser } from './hooks/useProfileUser'
import { useProfileOrders } from './hooks/useProfileOrders'
import { useProfileDeposit } from './hooks/useProfileDeposit'
import { useTossPayments } from './hooks/useTossPayments'
import { ProfileView } from './ProfileView'
import type { SellerApplication } from './types'

export function ProfileContainer() {
  const { toast } = useToast()
  const { user, isLoadingUser, mounted, setUser } = useProfileUser()
  const { orders, isLoadingOrders, orderCount, reviewCount, isLoadingReviews } = useProfileOrders(user.userId, mounted)
  const { depositBalance, isLoadingDeposit, fetchDepositBalance } = useProfileDeposit(mounted)
  const { tossWidget, isCharging, handleDepositCharge } = useTossPayments(user)

  // UI state
  const [activeTab, setActiveTab] = useState('overview')
  const [isSellerDialogOpen, setIsSellerDialogOpen] = useState(false)
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [isDepositChargeDialogOpen, setIsDepositChargeDialogOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null)
  const [chargeAmount, setChargeAmount] = useState<string>('')
  const [sellerApplication, setSellerApplication] = useState<SellerApplication>({
    farmName: '',
    farmAddress: '',
    farmDescription: '',
    businessNumber: '',
  })

  // 판매자 정산금액 상태
  const [monthlySettlement, setMonthlySettlement] = useState<number | null>(null)
  const [isLoadingSettlement, setIsLoadingSettlement] = useState(false)

  // 이번달 정산금액 조회 (판매자만)
  useEffect(() => {
    const fetchMonthlySettlement = async () => {
      if (!mounted || user.role !== 'SELLER') return

      setIsLoadingSettlement(true)
      try {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1

        const response = await sellerService.getSettlements({
          page: 1,
          size: 100,
        })

        // 이번달 정산금액 계산 (COMPLETED 상태만)
        const currentMonthSettlements = response.content.filter((settlement) => {
          const settlementDate = new Date(settlement.period.start)
          return (
            settlementDate.getFullYear() === year &&
            settlementDate.getMonth() + 1 === month &&
            settlement.status === 'COMPLETED'
          )
        })

        const totalAmount = currentMonthSettlements.reduce(
          (sum, settlement) => sum + settlement.netAmount,
          0
        )

        setMonthlySettlement(totalAmount)
      } catch (error) {
        console.error('정산금액 조회 실패:', error)
        // API 실패 시에도 UI는 표시 (에러는 무시)
      } finally {
        setIsLoadingSettlement(false)
      }
    }

    fetchMonthlySettlement()
  }, [mounted, user.role])

  const handleSellerApplication = async () => {
    if (!sellerApplication.farmName || !sellerApplication.farmAddress) {
      toast({
        title: '필수 항목 입력',
        description: '농장명과 주소를 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    try {
      // grantSellerRole API 호출 (현재 사용자의 userId로 판매자 권한 부여)
      await authService.grantSellerRole(user.userId)

      toast({
        title: '판매자 전환 완료',
        description: '판매자 권한이 부여되었습니다. 페이지를 새로고침합니다.',
      })

      setIsSellerDialogOpen(false)
      setSellerApplication({
        farmName: '',
        farmAddress: '',
        farmDescription: '',
        businessNumber: '',
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

  const profileState = {
    // User state
    user,
    isLoadingUser,
    mounted,

    // Orders state
    orders,
    isLoadingOrders,
    orderCount,
    reviewCount,
    isLoadingReviews,

    // Deposit state
    depositBalance,
    isLoadingDeposit,

    // Seller state
    monthlySettlement,
    isLoadingSettlement,

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
  }

  return (
    <ProfileView
      state={profileState}
      actions={profileActions}
    />
  )
}