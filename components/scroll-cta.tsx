'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sprout, X } from 'lucide-react'
import Link from 'next/link'

export function ScrollCTA() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // 스크롤이 300px 이상 내려갔을 때 표시
      const scrollPosition = window.scrollY || document.documentElement.scrollTop
      if (scrollPosition > 300 && !isDismissed) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isDismissed])

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-[#F0F8E8]/95 dark:bg-gray-900/90 backdrop-blur-xl border border-green-600/30 shadow-2xl shadow-green-600/10 px-8 py-5 flex items-center gap-6 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-green-600/90 backdrop-blur-sm flex items-center justify-center rounded-lg shadow-lg">
            <Sprout className="h-7 w-7 text-white" />
          </div>
          <div>
            <p className="text-base font-normal text-gray-900 dark:text-white mb-0.5">
              농가이신가요?
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
              바로팜과 함께 시작하세요
            </p>
          </div>
        </div>
        <Button
          size="lg"
          className="bg-green-600/90 hover:bg-green-700 text-white rounded-lg font-normal px-6 py-2.5 backdrop-blur-sm shadow-lg"
          asChild
        >
          <Link href="/farmer/signup">농가 등록하기</Link>
        </Button>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
          aria-label="닫기"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
