import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  CircleDollarSign,
  Clock3,
  HeartHandshake,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Sprout,
  Star,
  Truck,
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { ChatbotWidget } from '@/components/chatbot'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="relative overflow-hidden border-b bg-gradient-to-b from-emerald-50/70 via-background to-background py-16 md:py-24">
        <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-lime-200/40 blur-3xl" />

        <div className="container relative mx-auto px-4">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
            <div className="max-w-xl">
              <Badge variant="secondary" className="mb-4">
                오늘 장보기, 더 빠르고 더 간편하게
              </Badge>
              <h1 className="mb-5 text-4xl font-bold leading-tight md:text-6xl">
                믿을 수 있는 신선식품
                <br />
                바로팜에서 한 번에
              </h1>
              <p className="mb-8 text-base text-muted-foreground md:text-lg">
                복잡한 비교는 줄이고, 필요한 상품은 빠르게 찾을 수 있게 만들었습니다. 판매자 정보와
                리뷰를 확인하고 안심하고 주문하세요.
              </p>

              <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/products">
                    상품 둘러보기
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/search">원하는 상품 찾기</Link>
                </Button>
              </div>
            </div>

            <div className="relative h-[280px] overflow-hidden rounded-2xl border bg-muted shadow-sm md:h-[420px]">
              <Image
                src="/sunny-farm-with-greenhouse.jpg"
                alt="바로팜 메인 비주얼"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            <Card className="p-5 text-center">
              <p className="text-3xl font-bold text-primary">320+</p>
              <p className="mt-2 text-sm text-muted-foreground">협력 판매자</p>
            </Card>
            <Card className="p-5 text-center">
              <p className="text-3xl font-bold text-primary">1,200+</p>
              <p className="mt-2 text-sm text-muted-foreground">누적 등록 상품</p>
            </Card>
            <Card className="p-5 text-center">
              <p className="text-3xl font-bold text-primary">50,000+</p>
              <p className="mt-2 text-sm text-muted-foreground">누적 주문 고객</p>
            </Card>
            <Card className="p-5 text-center">
              <p className="text-3xl font-bold text-primary">24h</p>
              <p className="mt-2 text-sm text-muted-foreground">고객 문의 평균 응답</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">소비자에게 좋은 이유</h2>
            <p className="text-muted-foreground">
              가격, 정보, 배송, 추천까지 장보기의 핵심을 개선했습니다
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6">
              <CircleDollarSign className="mb-4 h-6 w-6 text-primary" />
              <h3 className="mb-2 text-lg font-semibold">합리적인 가격</h3>
              <p className="text-sm text-muted-foreground">
                유통 단계를 줄여 필요한 식재료를 부담 적은 가격으로 제공합니다.
              </p>
            </Card>
            <Card className="p-6">
              <ShieldCheck className="mb-4 h-6 w-6 text-primary" />
              <h3 className="mb-2 text-lg font-semibold">신뢰 가능한 정보</h3>
              <p className="text-sm text-muted-foreground">
                판매자 정보와 리뷰를 명확히 제공해 선택 시간을 줄일 수 있습니다.
              </p>
            </Card>
            <Card className="p-6">
              <Truck className="mb-4 h-6 w-6 text-primary" />
              <h3 className="mb-2 text-lg font-semibold">간편한 주문 흐름</h3>
              <p className="text-sm text-muted-foreground">
                검색부터 결제까지 직관적인 화면으로 빠르게 구매를 완료할 수 있습니다.
              </p>
            </Card>
            <Card className="p-6">
              <Sparkles className="mb-4 h-6 w-6 text-primary" />
              <h3 className="mb-2 text-lg font-semibold">데일리 추천</h3>
              <p className="text-sm text-muted-foreground">
                시즌성과 인기 데이터를 반영해 지금 사기 좋은 상품을 제안합니다.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">장보기 3단계</h2>
            <p className="text-muted-foreground">
              필요한 상품을 찾고, 비교하고, 주문까지 한 흐름으로
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6">
              <Clock3 className="mb-4 h-6 w-6 text-primary" />
              <p className="mb-3 text-sm font-semibold text-primary">STEP 01</p>
              <h3 className="mb-2 text-xl font-semibold">검색</h3>
              <p className="text-sm text-muted-foreground">
                키워드와 카테고리로 원하는 상품을 빠르게 찾습니다.
              </p>
            </Card>
            <Card className="p-6">
              <Star className="mb-4 h-6 w-6 text-primary" />
              <p className="mb-3 text-sm font-semibold text-primary">STEP 02</p>
              <h3 className="mb-2 text-xl font-semibold">비교</h3>
              <p className="text-sm text-muted-foreground">
                리뷰와 상품 정보를 확인해 가장 맞는 상품을 고릅니다.
              </p>
            </Card>
            <Card className="p-6">
              <PackageCheck className="mb-4 h-6 w-6 text-primary" />
              <p className="mb-3 text-sm font-semibold text-primary">STEP 03</p>
              <h3 className="mb-2 text-xl font-semibold">주문</h3>
              <p className="text-sm text-muted-foreground">
                장바구니와 결제를 간편하게 진행하고 주문 상태를 확인합니다.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="mb-3 text-3xl font-bold md:text-4xl">고객 후기</h2>
            <p className="text-muted-foreground">바로팜 사용자들의 실제 경험</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6">
              <p className="mb-3 text-sm text-muted-foreground">서울 | 30대 직장인</p>
              <p className="mb-4 leading-relaxed">
                "퇴근 후에도 필요한 채소를 바로 주문할 수 있어서 장보기 부담이 줄었어요."
              </p>
              <p className="text-sm font-semibold text-primary">정기 구매 고객</p>
            </Card>
            <Card className="p-6">
              <p className="mb-3 text-sm text-muted-foreground">부산 | 40대 가정</p>
              <p className="mb-4 leading-relaxed">
                "상품 설명과 후기가 잘 정리돼 있어서 처음 사는 품목도 쉽게 고를 수 있었습니다."
              </p>
              <p className="text-sm font-semibold text-primary">신규 가입 고객</p>
            </Card>
            <Card className="p-6">
              <p className="mb-3 text-sm text-muted-foreground">대전 | 20대 자취생</p>
              <p className="mb-4 leading-relaxed">
                "가격이 합리적이고 신선해서 재구매 중입니다. 주문 과정도 단순해서 좋아요."
              </p>
              <p className="text-sm font-semibold text-primary">월 4회 이상 구매</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="p-10 text-center md:p-12">
            <HeartHandshake className="mx-auto mb-4 h-8 w-8 text-primary" />
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              오늘 장보기, 바로팜에서 시작하세요
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
              필요한 상품을 빠르게 찾고 믿고 주문할 수 있는 경험을 제공합니다.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/products">상품 둘러보기</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/signup">회원가입</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Sprout className="h-5 w-5 text-primary" />
                <span className="font-bold">바로팜</span>
              </div>
              <p className="text-sm text-muted-foreground">
                생산자와 소비자를 직접 연결하는 소비자 중심 농식품 커머스 플랫폼
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">서비스</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/products" className="hover:text-foreground">
                    상품 둘러보기
                  </Link>
                </li>
                <li>
                  <Link href="/search" className="hover:text-foreground">
                    빠른 상품 검색
                  </Link>
                </li>
                <li>
                  <Link href="/reviews" className="hover:text-foreground">
                    리뷰 확인
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">브랜드</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground">
                    서비스 소개
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-foreground">
                    이용 가이드
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground">
                    이용약관
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">고객지원</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    문의하기
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-foreground">
                    로그인
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-foreground">
                    회원가입
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 바로팜 BaroFarm. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <ChatbotWidget />
    </div>
  )
}
