import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { authService } from '@/lib/api/services/auth'
import type { ProfileUser } from '../types'

export function useProfileUser() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<ProfileUser>({
    userId: '',
    email: '',
    role: 'BUYER',
  })
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [mounted, setMounted] = useState(false)

  // 마운트 확인
  useEffect(() => {
    setMounted(true)
  }, [])

  // 사용자 정보 조회
  useEffect(() => {
    const fetchUser = async () => {
      if (!mounted) return

      setIsLoadingUser(true)
      try {
        const currentUser = await authService.getCurrentUser()
        console.log('현재 사용자 정보:', currentUser)
        setUser({
          ...currentUser,
          name: currentUser.email?.split('@')[0] || '사용자', // 이메일에서 이름 추출 (임시)
          phone: '', // TODO: 전화번호는 별도 API에서 가져와야 할 수 있음
          avatar: '/placeholder.svg',
        })
      } catch (error: any) {
        console.error('사용자 정보 조회 실패:', error)

        // [1] 401 에러: HttpOnly cookie가 없거나 만료됨 (로그인 필요)
        const isUnauthorized =
          error?.status === 401 || error?.message?.includes('Authentication is required')

        if (isUnauthorized) {
          toast({
            title: '로그인이 필요합니다',
            description: '로그인 후 다시 시도해주세요.',
            variant: 'destructive',
          })
          router.push('/login')
        } else {
          toast({
            title: '사용자 정보 조회 실패',
            description: error?.message || '다시 시도해주세요.',
            variant: 'destructive',
          })
          router.push('/')
        }
      } finally {
        setIsLoadingUser(false)
      }
    }

    fetchUser()
  }, [mounted, router, toast])

  return {
    user,
    isLoadingUser,
    mounted,
    setUser,
  }
}
