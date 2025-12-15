'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sprout, ShoppingCart, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
// TODO: 알림 기능 추가 예정
// import { NotificationIcon } from '@/components/notification'
import { getAccessToken, setAccessToken } from '@/lib/api/client'
import { authService } from '@/lib/api/services/auth'
import { useCartStore } from '@/lib/cart-store'
import { useToast } from '@/hooks/use-toast'
import { SearchBox } from '@/components/search/search-box'

interface HeaderProps {
  showCart?: boolean
}

export function Header({ showCart = false }: HeaderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const cartItemsCount = useCartStore((state) => state.items.length)
  const clearCart = useCartStore((state) => state.clearCart)

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  useEffect(() => {
    // 로그인 상태 확인
    const checkAuth = () => {
      const token = getAccessToken()
      const dummyUser = typeof window !== 'undefined' ? localStorage.getItem('dummyUser') : null
      setIsLoggedIn(!!(token || dummyUser))
    }

    checkAuth()

    // storage 이벤트 리스너 추가 (다른 탭에서 로그인/로그아웃 시 동기화)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', checkAuth)
      // 커스텀 이벤트 리스너 (같은 탭에서 로그인/로그아웃 시)
      window.addEventListener('authStateChanged', checkAuth)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', checkAuth)
        window.removeEventListener('authStateChanged', checkAuth)
      }
    }
  }, [])

  const handleLogout = async () => {
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

      // 로그인 상태 업데이트
      setIsLoggedIn(false)

      // 이벤트 발생 (다른 컴포넌트에 알림)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('authStateChanged'))
      }

      toast({
        title: '로그아웃되었습니다',
        description: '다음에 또 만나요!',
      })

      // 홈으로 리다이렉트
      router.push('/')
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error)
      toast({
        title: '로그아웃 실패',
        description: '다시 시도해주세요.',
        variant: 'destructive',
      })
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Sprout className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">바로팜</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/products" className="text-sm font-medium text-primary">
            농산물 장터
          </Link>
          <Link
            href="/experiences"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            농장 체험
          </Link>
          <Link href="/farms" className="text-sm font-medium hover:text-primary transition-colors">
            농장 찾기
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
            소개
          </Link>
        </nav>

        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <SearchBox
            placeholder="상품, 농장, 체험 검색..."
            onSearch={handleSearch}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* TODO: 알림 기능 추가 예정 */}
          {/* <NotificationIcon /> */}
          {showCart && (
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            </Button>
          )}
          {!isLoggedIn ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">로그인</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">회원가입</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile">마이페이지</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}