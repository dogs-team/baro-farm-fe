'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sprout,
  Package,
  Calendar,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Users,
  Plus,
  Settings,
  LogOut,
} from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { FarmerNav } from '../components/farmer-nav'

export default function FarmerDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const stats = [
    {
      title: '이번 달 매출',
      value: '2,450,000원',
      change: '+12.5%',
      icon: DollarSign,
      trend: 'up',
    },
    {
      title: '진행 중 주문',
      value: '23건',
      change: '+5건',
      icon: ShoppingBag,
      trend: 'up',
    },
    {
      title: '등록 상품',
      value: '12개',
      change: '2개 품절',
      icon: Package,
      trend: 'neutral',
    },
    {
      title: '예약된 체험',
      value: '8건',
      change: '+3건',
      icon: Calendar,
      trend: 'up',
    },
  ]

  const recentOrders = [
    {
      id: 'ORD-001234',
      product: '유기농 방울토마토',
      customer: '김**',
      amount: 17000,
      status: '배송 준비',
      date: '2024.12.10',
    },
    {
      id: 'ORD-001233',
      product: '유기농 방울토마토',
      customer: '이**',
      amount: 8500,
      status: '배송 중',
      date: '2024.12.09',
    },
    {
      id: 'ORD-001232',
      product: '유기농 방울토마토',
      customer: '박**',
      amount: 25500,
      status: '배송 완료',
      date: '2024.12.08',
    },
  ]

  const upcomingExperiences = [
    {
      id: 'EXP-001234',
      title: '딸기 수확 체험',
      date: '2024.12.15',
      time: '10:00',
      participants: 6,
      status: '확정',
    },
    {
      id: 'EXP-001233',
      title: '딸기 수확 체험',
      date: '2024.12.17',
      time: '14:00',
      participants: 4,
      status: '확정',
    },
  ]

  const products = [
    {
      id: 1,
      name: '유기농 방울토마토',
      price: 8500,
      stock: 50,
      status: '판매중',
      sales: 124,
    },
    {
      id: 2,
      name: '무농약 상추',
      price: 5000,
      stock: 0,
      status: '품절',
      sales: 89,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Sprout className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">바로팜</span>
            </Link>
            <Badge variant="secondary">농가</Badge>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">고객 페이지</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarFallback>햇</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>햇살농장</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/farmer/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    설정
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="h-4 w-4 mr-2" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <FarmerNav />
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">대시보드</h1>
            <p className="text-muted-foreground">햇살농장의 운영 현황을 한눈에 확인하세요</p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/farmer/products/new">
                <Plus className="h-4 w-4 mr-2" />
                상품 등록
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/farmer/experiences">
                <Plus className="h-4 w-4 mr-2" />
                체험 등록
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center`}
                >
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                {stat.trend === 'up' && (
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change}
                  </Badge>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">최근 주문</h2>
              <Button variant="outline" size="sm" asChild>
                <Link href="/farmer/orders">전체보기</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between pb-4 border-b last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{order.product}</p>
                      <Badge
                        variant={
                          order.status === '배송 완료'
                            ? 'secondary'
                            : order.status === '배송 중'
                              ? 'default'
                              : 'outline'
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.customer} • {order.date}
                    </p>
                  </div>
                  <p className="font-semibold">{order.amount.toLocaleString()}원</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming Experiences */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">예정된 체험</h2>
              <Button variant="outline" size="sm" asChild>
                <Link href="/farmer/bookings">전체보기</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {upcomingExperiences.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between pb-4 border-b last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{exp.title}</p>
                      <Badge>{exp.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {exp.date}
                      </span>
                      <span>{exp.time}</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {exp.participants}명
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Products Management */}
        <Card className="p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">상품 관리</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/farmer/products">전체보기</Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">상품명</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">가격</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">재고</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">판매량</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">상태</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">작업</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b last:border-0">
                    <td className="py-4 px-4 font-medium">{product.name}</td>
                    <td className="py-4 px-4">{product.price.toLocaleString()}원</td>
                    <td className="py-4 px-4">
                      <span className={product.stock === 0 ? 'text-destructive' : ''}>
                        {product.stock}개
                      </span>
                    </td>
                    <td className="py-4 px-4">{product.sales}건</td>
                    <td className="py-4 px-4">
                      <Badge variant={product.status === '판매중' ? 'default' : 'secondary'}>
                        {product.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button variant="ghost" size="sm">
                        편집
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
