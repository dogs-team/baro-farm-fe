import { useRouter } from 'next/navigation'
import { setAccessToken } from '@/lib/api/client'
import { authService } from '@/lib/api/services/auth'
import { useCartStore } from '@/lib/cart-store'
import { useToast } from '@/hooks/use-toast'

export function useLogout() {
  const router = useRouter()
  const { toast } = useToast()
  const clearCart = useCartStore((state) => state.clearCart)

  const logout = async (options?: { redirectTo?: string; reload?: boolean }) => {
    const { redirectTo = '/', reload = false } = options || {}

    try {
      // API 로그아웃 시도 (실패해도 계속 진행)
      try {
        await authService.logout()
      } catch (error) {
        console.warn('로그아웃 API 호출 실패 (로컬 로그아웃 진행):', error)
      }

      // 로컬 스토리지 정리
      setAccessToken(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('dummyUser')
        localStorage.removeItem('accessToken')
      }

      // 장바구니 비우기 (에러가 나도 계속 진행)
      try {
        clearCart()
      } catch (error) {
        console.warn('장바구니 비우기 실패 (계속 진행):', error)
      }

      // 이벤트 발생 (다른 컴포넌트에 알림)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('authStateChanged'))
      }

      toast({
        title: '로그아웃되었습니다',
        description: '다음에 또 만나요!',
      })

      // 리다이렉트 또는 새로고침
      if (reload) {
        setTimeout(() => {
          window.location.reload()
        }, 500)
      } else {
        router.push(redirectTo)
      }
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error)
      toast({
        title: '로그아웃 실패',
        description: '다시 시도해주세요.',
        variant: 'destructive',
      })
    }
  }

  return { logout }
}
