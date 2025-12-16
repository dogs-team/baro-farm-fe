'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Sprout, Search, Filter, Settings, LogOut, Package, Truck, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

export default function FarmerOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('all')

  const orders = [
    {
      id: 'ORD-001234',
      product: '유기농 방울토마토',
      customer: '김**',
      phone: '010-****-1234',
      address: '서울시 강남구 테헤란로 123',
      amount: 17000,
      quantity: 2,
      status: '배송 준비',
      date: '2024.12.10 14:30',
      paymentMethod: '신용카드',
    },
    {
      id: 'ORD-001233',
      product: '유기농 방울토마토',
      customer: '이**',
      phone: '010-****-5678',
      address: '경기도 성남시 분당구 123',
      amount: 8500,
      quantity: 1,
      status: '배송 중',
      date: '2024.12.09 10:15',
      paymentMethod: '계좌이체',
    },
    {
      id: 'ORD-001232',
      product: '유기농 방울토마토',
      customer: '박**',
      phone: '010-****-9012',
      address: '인천시 남동구 456',
      amount: 25500,
      quantity: 3,
      status: '배송 완료',
      date: '2024.12.08 16:45',
      paymentMethod: '카카오페이',
    },
    {
      id: 'ORD-001231',
      product: '친환경 딸기',
      customer: '최**',
      phone: '010-****-3456',
      address: '서울시 송파구 789',
      amount: 15000,
      quantity: 1,
      status: '배송 준비',
      date: '2024.12.07 11:20',
      paymentMethod: '신용카드',
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '배송 준비':
        return (
          <Badge variant="outline">
            <Package className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        )
      case '배송 중':
        return (
          <Badge variant="default">
            <Truck className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        )
      case '배송 완료':
        return (
          <Badge variant="secondary">
            <CheckCircle className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

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
                  <Link href="/farmer/dashboard">대시보드</Link>
                </DropdownMenuItem>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">주문 관리</h1>
          <p className="text-muted-foreground">고객의 주문을 확인하고 배송을 관리하세요</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="주문번호, 고객명으로 검색..." className="pl-10" />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="주문 상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="pending">배송 준비</SelectItem>
              <SelectItem value="shipping">배송 중</SelectItem>
              <SelectItem value="completed">배송 완료</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            필터
          </Button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">주문번호: {order.id}</h3>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{order.amount.toLocaleString()}원</p>
                  <p className="text-sm text-muted-foreground">{order.paymentMethod}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">상품 정보</h4>
                  <p className="text-sm">{order.product}</p>
                  <p className="text-sm text-muted-foreground">수량: {order.quantity}개</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">배송 정보</h4>
                  <p className="text-sm">
                    {order.customer} ({order.phone})
                  </p>
                  <p className="text-sm text-muted-foreground">{order.address}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {order.status === '배송 준비' && <Button size="sm">배송 시작</Button>}
                {order.status === '배송 중' && <Button size="sm">배송 완료 처리</Button>}
                <Button variant="outline" size="sm">
                  상세보기
                </Button>
                <Button variant="outline" size="sm">
                  송장 출력
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
