import { useState, useEffect } from 'react'
import { orderService } from '@/lib/api/services/order'
import { reviewService } from '@/lib/api/services/review'
import type { OrderDetailInfo } from '@/lib/api/types'

export function useProfileOrders(userId: string, mounted: boolean) {
  // 주문 내역 상태
  const [orders, setOrders] = useState<OrderDetailInfo[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [orderCount, setOrderCount] = useState(0)
  const [buyerCount, setBuyerCount] = useState(0)

  // 리뷰 개수 상태
  const [reviewCount, setReviewCount] = useState(0)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)

  // 주문 내역 조회
  useEffect(() => {
    const fetchOrders = async () => {
      if (!mounted || !userId) return

      setIsLoadingOrders(true)
      try {
        // 판매자용 주문 조회 (전체 주문 조회)
        const response = await orderService.getOrders({ page: 0, size: 1000 })
        const orderList = response.content || []
        setOrders(orderList)
        setOrderCount(response.totalElements || 0)

        // 구매자 수 계산 (이메일 기준으로 고유 구매자 수 계산)
        const uniqueBuyers = new Set(orderList.map((order) => order.email).filter((email) => email))
        setBuyerCount(uniqueBuyers.size)
      } catch (error) {
        console.error('주문 내역 조회 실패:', error)
        setOrders([])
        setOrderCount(0)
        setBuyerCount(0)
      } finally {
        setIsLoadingOrders(false)
      }
    }

    fetchOrders()
  }, [mounted, userId])

  // 리뷰 개수 조회
  useEffect(() => {
    const fetchReviewCount = async () => {
      if (!mounted || !userId) return

      setIsLoadingReviews(true)
      try {
        const response = await reviewService.getMyReviews({ page: 0, size: 1 })
        setReviewCount(response.totalElements || 0)
      } catch (error) {
        console.error('리뷰 개수 조회 실패:', error)
        setReviewCount(0)
      } finally {
        setIsLoadingReviews(false)
      }
    }

    fetchReviewCount()
  }, [mounted, userId])

  return {
    orders,
    isLoadingOrders,
    orderCount,
    buyerCount,
    reviewCount,
    isLoadingReviews,
  }
}
