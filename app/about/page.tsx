'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sprout,
  Leaf,
  TrendingDown,
  Heart,
  Users,
  Award,
  Target,
  Globe,
  Shield,
  Truck,
  ShoppingCart,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/header'

export default function AboutPage() {
  const values = [
    {
      icon: Leaf,
      title: '환경 보호',
      description: '중간 유통 단계를 줄여 탄소 배출을 최소화하고 포장재 사용을 줄입니다',
    },
    {
      icon: TrendingDown,
      title: '합리적 가격',
      description: '직거래로 중간 마진을 없애 농가와 소비자 모두에게 이익을 제공합니다',
    },
    {
      icon: Heart,
      title: '농가 활성화',
      description: '농장 체험 프로그램으로 농가에 새로운 수익원을 제공합니다',
    },
    {
      icon: Shield,
      title: '신뢰성',
      description: '인증된 농가와 검증된 상품으로 안전한 구매를 보장합니다',
    },
  ]

  const features = [
    {
      icon: ShoppingCart,
      title: '신선한 농산물',
      description: '농장에서 직접 배송되는 신선한 농산물을 만나보세요',
    },
    {
      icon: Truck,
      title: '빠른 배송',
      description: '수확 후 당일 또는 익일 배송으로 신선함을 보장합니다',
    },
    {
      icon: Award,
      title: '인증된 농가',
      description: '유기농, 무농약 등 인증을 받은 신뢰할 수 있는 농가만 선별합니다',
    },
    {
      icon: Users,
      title: '농장 체험',
      description: '도시를 벗어나 자연과 함께하는 특별한 체험 프로그램을 제공합니다',
    },
  ]

  const stats = [
    { label: '등록 농가', value: '320+', icon: Sprout },
    { label: '신선 농산물', value: '1,200+', icon: ShoppingCart },
    { label: '탄소 절감', value: '85%', icon: Leaf },
    { label: '만족한 고객', value: '50k+', icon: Heart },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4" variant="secondary">
              Farm-to-Table
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
              농장에서 식탁까지,
              <br />
              신선함을 바로 전합니다
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty">
              바로팜은 농가와 소비자를 직접 연결하는 지속가능한 농산물 직거래 플랫폼입니다.
              <br />
              환경을 생각하고 탄소 발자국을 줄이는 선택을 함께 만들어갑니다.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">우리의 미션</h2>
              <p className="text-lg text-muted-foreground">
                농가와 소비자를 직접 연결하여 지속가능한 농업 생태계를 만들어갑니다
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8">
                <Target className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">농가 지원</h3>
                <p className="text-muted-foreground">
                  중간 유통 단계를 줄여 농가의 수익성을 높이고, 농장 체험 프로그램을 통해 새로운
                  수익원을 제공합니다.
                </p>
              </Card>

              <Card className="p-8">
                <Globe className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3">환경 보호</h3>
                <p className="text-muted-foreground">
                  직거래로 탄소 배출을 최소화하고, 친환경 포장재 사용을 권장하여 지구를 지키는
                  선택을 돕습니다.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">핵심 가치</h2>
            <p className="text-lg text-muted-foreground">바로팜이 추구하는 가치와 원칙</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <Card
                  key={value.title}
                  className="p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">주요 기능</h2>
            <p className="text-lg text-muted-foreground">바로팜이 제공하는 다양한 서비스</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="p-6 hover:shadow-lg transition-shadow">
                  <Icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="bg-primary text-primary-foreground p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">함께 시작해볼까요?</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              신선한 농산물을 만나보거나, 농가로 등록하여 더 많은 고객을 만나보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/products">농산물 둘러보기</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">농가 등록하기</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sprout className="h-5 w-5 text-primary" />
                <span className="font-bold">바로팜</span>
              </div>
              <p className="text-sm text-muted-foreground">
                농장에서 식탁까지, 신선함을 바로 전하는 Farm-to-Table 플랫폼
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">서비스</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/products" className="hover:text-foreground">
                    농산물 장터
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-foreground">
                    농장 체험
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-foreground">
                    농장 찾기
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">농가</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/signup" className="hover:text-foreground">
                    농가 등록
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-foreground">
                    농가 로그인
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">고객센터</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-foreground">
                    자주 묻는 질문
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    문의하기
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground">
                    이용약관
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 바로팜 BaroFarm. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
