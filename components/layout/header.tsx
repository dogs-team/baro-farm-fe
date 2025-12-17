'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sprout, ShoppingCart, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
// TODO: 알림 기능 추가 예정
// import { NotificationIcon } from '@/components/notification'
import { getAccessToken } from '@/lib/api/client'
import { useCartStore } from '@/lib/cart-store'
import { useToast } from '@/hooks/use-toast'
import { useLogout } from '@/hooks/useLogout'
import { SearchBox } from '@/components/search/search-box'

interface HeaderProps {
  showCart?: boolean
}

export function Header({ showCart = false }: HeaderProps) {
  const router = useRouter()
  const { logout } = useLogout()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [mounted, setMounted] = useState(false)
  const cartItemsCount = useCartStore((state) => state.items.length)

  const handleSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  useEffect(() => {
    setMounted(true)

    // 로그인 상태 확인
    const checkAuth = () => {
      const token = getAccessToken()
      const dummyUser = localStorage.getItem('dummyUser')
      setIsLoggedIn(!!(token || dummyUser))
    }

    checkAuth()

    // storage 이벤트 리스너 추가 (다른 탭에서 로그인/로그아웃 시 동기화)
    window.addEventListener('storage', checkAuth)
    // 커스텀 이벤트 리스너 (같은 탭에서 로그인/로그아웃 시)
    window.addEventListener('authStateChanged', checkAuth)

    return () => {
      window.removeEventListener('storage', checkAuth)
      window.removeEventListener('authStateChanged', checkAuth)
    }
  }, [])

  const handleLogout = async () => {
    await logout({ redirectTo: '/' })
    setIsLoggedIn(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E5E5] dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-lg supports-[backdrop-filter]:bg-white/90 dark:supports-[backdrop-filter]:bg-gray-950/90">
      <div className="container mx-auto flex h-20 items-center justify-between px-6 md:px-8 max-w-7xl">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#F0FDF4] dark:bg-green-950/30 group-hover:bg-[#D1FAE5] dark:group-hover:bg-green-900/50 transition-colors">
            <Sprout className="h-5 w-5 text-[#22C55E] dark:text-[#4ADE80] group-hover:text-[#16A34A] dark:group-hover:text-[#22C55E] transition-colors" />
          </div>
          <span className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
            바로팜
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-10">
          <Link
            href="/products"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#22C55E] dark:hover:text-[#4ADE80] transition-colors relative group"
          >
            농산물 장터
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#22C55E] dark:bg-[#4ADE80] group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link
            href="/experiences"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#22C55E] dark:hover:text-[#4ADE80] transition-colors relative group"
          >
            농장 체험
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#22C55E] dark:bg-[#4ADE80] group-hover:w-full transition-all duration-300"></span>
          </Link>
          {/* 농장 찾기 숨김 처리 */}
          {/* <Link
            href="/farms"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#22C55E] dark:hover:text-[#4ADE80] transition-colors relative group"
          >
            농장 찾기
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#22C55E] dark:bg-[#4ADE80] group-hover:w-full transition-all duration-300"></span>
          </Link> */}
        </nav>

        <div className="flex-1 max-w-md mx-6 hidden md:block">
          <SearchBox
            placeholder="상품, 농장, 체험 검색..."
            onSearch={handleSearch}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* TODO: 알림 기능 추가 예정 */}
          {/* <NotificationIcon /> */}
          {showCart && (
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-[#F0FDF4] dark:hover:bg-green-950/30 rounded-lg transition-colors"
              asChild
            >
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#22C55E] text-white text-xs flex items-center justify-center font-semibold shadow-sm">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            </Button>
          )}
          {isLoggedIn === null ? (
            // 로딩 상태 - 서버와 클라이언트에서 동일하게 렌더링
            <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : !isLoggedIn ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#22C55E] dark:hover:text-[#4ADE80] hover:bg-transparent rounded-lg px-4 transition-colors relative group"
                asChild
              >
                <Link href="/login" className="relative">
                  로그인
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#22C55E] dark:bg-[#4ADE80] group-hover:w-full transition-all duration-300"></span>
                </Link>
              </Button>
              <Button
                size="sm"
                className="text-sm font-semibold bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-lg px-5 shadow-sm hover:shadow-md transition-all"
                asChild
              >
                <Link href="/signup">회원가입</Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#22C55E] dark:hover:text-[#4ADE80] hover:bg-transparent rounded-lg px-4 transition-colors relative group"
                asChild
              >
                <Link href="/profile" className="relative">
                  마이페이지
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#22C55E] dark:hover:text-[#4ADE80] group-hover:w-full transition-all duration-300"></span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#22C55E] dark:hover:text-[#4ADE80] hover:bg-transparent rounded-lg px-4 transition-colors relative group"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#22C55E] dark:bg-[#4ADE80] group-hover:w-full transition-all duration-300"></span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
