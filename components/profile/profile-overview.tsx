'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, Mail, Phone, Calendar } from 'lucide-react'

interface User {
  name: string
  email: string
  phone: string
  joinDate: string
  avatar: string
  role: string
}

interface Stat {
  label: string
  value: string
  icon: any
}

interface Order {
  id: string
  date: string
  status: string
  items: string[]
  total: number
}

interface ProfileOverviewProps {
  user: User
  stats: Stat[]
  depositStat: Stat
  sellerStats: Stat[]
  recentOrders: Order[]
  onTabChange: (tab: string) => void
}

export function ProfileOverview({
  user,
  stats,
  depositStat,
  sellerStats,
  recentOrders,
  onTabChange,
}: ProfileOverviewProps) {
  const router = useRouter()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '배송 완료':
        return <Badge variant="secondary">배송 완료</Badge>
      case '배송 중':
        return <Badge variant="default">배송 중</Badge>
      case '배송 준비':
        return <Badge variant="outline">배송 준비</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex-shrink-0">
            <Image
              src={user.avatar || '/placeholder.svg'}
              alt={user.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      {user.name}
                    </h2>
                    <Badge variant="outline" className="text-[#22C55E] border-[#22C55E]">
                      {user.role === 'SELLER' ? '판매자' : '구매자'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-[#22C55E] dark:text-[#4ADE80] flex-shrink-0" />
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-[#22C55E] dark:text-[#4ADE80] flex-shrink-0" />
                    <span className="font-medium">{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-[#22C55E] dark:text-[#4ADE80] flex-shrink-0" />
                    <span className="font-medium text-muted-foreground">
                      가입일: {user.joinDate}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-[#22C55E] text-[#22C55E] hover:bg-[#F0FDF4] dark:hover:bg-green-950/30 rounded-full h-8 px-4 font-medium"
              >
                <Edit className="h-3.5 w-3.5 mr-2" />
                프로필 수정
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div
        className={`grid gap-4 ${user.role === 'SELLER' ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'}`}
      >
        {/* Basic Stats */}
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.label}
              className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700 group-hover:scale-105 transition-transform">
                  <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-[#22C55E] transition-colors" />
                </div>
                <div>
                  <div className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}

        {/* Deposit Card */}
        <Card className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group">
          <div className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700 group-hover:scale-105 transition-transform">
              <depositStat.icon className="h-5 w-5 text-[#22C55E] dark:text-[#4ADE80]" />
            </div>
            <div>
              <div className="text-2xl font-bold mb-1 text-[#22C55E] dark:text-[#4ADE80]">
                {depositStat.value}
              </div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {depositStat.label}
              </div>
            </div>
          </div>
        </Card>

        {/* Seller Stats */}
        {sellerStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.label}
              className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700 group-hover:scale-105 transition-transform">
                  <Icon className="h-5 w-5 text-[#22C55E] dark:text-[#4ADE80]" />
                </div>
                <div>
                  <div className="text-2xl font-bold mb-1 text-[#22C55E] dark:text-[#4ADE80]">
                    {stat.value}
                  </div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">최근 주문</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTabChange('orders')}
            className="text-gray-500 hover:text-gray-900 font-normal text-sm"
          >
            전체보기 →
          </Button>
        </div>
        <div className="space-y-4">
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              최근 주문 내역이 없습니다.
            </div>
          ) : (
            recentOrders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer group"
                onClick={() => router.push(`/order/${order.id}`)}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                      {order.id}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium group-hover:text-gray-900 transition-colors">
                    {order.items.join(', ')}
                  </div>
                  <div className="text-xs text-gray-400">{order.date}</div>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1">
                  <div className="font-bold text-base text-gray-900 dark:text-white">
                    {order.total.toLocaleString()}원
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-gray-900 px-0 sm:px-3"
                  >
                    상세보기
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
