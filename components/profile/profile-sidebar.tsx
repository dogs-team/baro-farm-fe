'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  ShoppingBag,
  User,
  Settings,
  LogOut,
  MapPin,
  CreditCard,
  Store,
} from 'lucide-react'

interface ProfileSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
  userRole: 'BUYER' | 'SELLER'
}

export function ProfileSidebar({
  activeTab,
  onTabChange,
  onLogout,
  userRole,
}: ProfileSidebarProps) {
  const menuItems = [
    {
      id: 'overview',
      label: '개요',
      icon: LayoutDashboard,
    },
    {
      id: 'orders',
      label: '주문 내역',
      icon: ShoppingBag,
    },
    {
      id: 'role',
      label: '역할 관리',
      icon: Store,
    },
    {
      id: 'settings',
      label: '설정',
      icon: Settings,
    },
  ]

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 min-h-[300px]">
      <div className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                'w-full justify-start text-base font-normal h-12',
                activeTab === item.id
                  ? 'bg-[#F0FDF4] dark:bg-green-950/30 text-[#22C55E] font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-[#F9FAF8] dark:hover:bg-gray-800'
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.label}
            </Button>
          )
        })}
      </div>

      <div className="pt-6 border-t border-[#E5E5E5] dark:border-gray-800">
        <Button
          variant="ghost"
          className="w-full justify-start text-base font-normal h-12 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          로그아웃
        </Button>
      </div>
    </div>
  )
}
