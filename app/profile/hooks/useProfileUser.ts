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
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error)
        toast({
          title: '사용자 정보 조회 실패',
          description: '다시 시도해주세요.',
          variant: 'destructive',
        })
        // 로그인되지 않은 경우 홈으로 리다이렉트
        router.push('/')
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
