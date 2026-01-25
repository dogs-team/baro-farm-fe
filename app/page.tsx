import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Leaf, Sprout, Heart, TrendingDown, MapPin, Star } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ChatbotWidget } from '@/components/chatbot'
import { Header } from '@/components/layout/header'

export default function HomePage() {
  const featuredProducts = [
    {
      id: 1,
      name: '유기농 방울토마토',
      farm: '햇살농장',
      location: '충남 당진',
      price: 8500,
      originalPrice: 12000,
      image: '/fresh-organic-cherry-tomatoes.jpg',
      rating: 4.8,
      reviews: 124,
      tag: '베스트',
    },
    {
      id: 2,
      name: '무농약 상추',
      farm: '초록들판',
      location: '경기 양평',
      price: 5000,
      originalPrice: 7000,
      image: '/fresh-organic-lettuce.png',
      rating: 4.9,
      reviews: 89,
      tag: '신선',
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: '친환경 딸기',
      farm: '달콤농원',
      location: '전북 완주',
      price: 15000,
      originalPrice: 18000,
      image: '/images/strawberries.png',
      rating: 5.0,
      reviews: 203,
      tag: '인기',
    },
    {
      id: 4,
      name: '유기농 감자',
      farm: '푸른밭농장',
      location: '강원 평창',
      price: 12000,
      originalPrice: 15000,
      image: '/fresh-organic-potatoes.jpg',
      rating: 4.7,
      reviews: 67,
      tag: '할인',
    },
  ]

  const experiences = [
    {
      id: 1,
      title: '딸기 수확 체험',
      farm: '달콤농원',
      location: '전북 완주',
      price: 25000,
      image: '/strawberry-picking-farm-experience.jpg',
      duration: '2시간',
      capacity: '최대 10명',
    },
    {
      id: 2,
      title: '감자 캐기 체험',
      farm: '푸른밭농장',
      location: '강원 평창',
      price: 20000,
      image: '/potato-harvesting-farm-experience.jpg',
      duration: '3시간',
      capacity: '최대 15명',
    },
    {
      id: 3,
      title: '토마토 수확 & 요리',
      farm: '햇살농장',
      location: '충남 당진',
      price: 35000,
      image: '/tomato-harvesting-cooking-farm-experience.jpg',
      duration: '4시간',
      capacity: '최대 8명',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
              환경을 생각하고 탄소 발자국을 줄이는 직거래 플랫폼. 신선한 농산물과 특별한 농장 체험을
              만나보세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/products">농산물 둘러보기</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/experiences">농장 체험 예약</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">320+</div>
              <div className="text-sm text-muted-foreground">등록 농가</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">1,200+</div>
              <div className="text-sm text-muted-foreground">신선 농산물</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">85%</div>
              <div className="text-sm text-muted-foreground">탄소 절감</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">50k+</div>
              <div className="text-sm text-muted-foreground">만족한 고객</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">왜 바로팜일까요?</h2>
            <p className="text-lg text-muted-foreground">
              농가와 소비자를 직접 연결하는 지속가능한 플랫폼
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">환경 보호</h3>
              <p className="text-muted-foreground">
                중간 유통 단계를 줄여 탄소 배출을 최소화하고 포장재 사용을 줄입니다
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">합리적 가격</h3>
              <p className="text-muted-foreground">
                직거래로 중간 마진을 없애 농가와 소비자 모두에게 이익을 제공합니다
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">농가 활성화</h3>
              <p className="text-muted-foreground">
                농장 체험 프로그램으로 농가에 새로운 수익원을 제공합니다
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">오늘의 신선 농산물</h2>
              <p className="text-muted-foreground">농장에서 직접 배송되는 신선한 농산물</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/products">전체보기</Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden group hover:shadow-lg transition-shadow"
              >
                <Link href={`/products/${product.id}`}>
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <Image
                      src={product.image || '/placeholder.svg'}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    <Badge className="absolute top-3 left-3">{product.tag}</Badge>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3" />
                      <span>{product.farm}</span>
                      <span className="mx-1">•</span>
                      <span>{product.location}</span>
                    </div>
                    <h3 className="font-semibold mb-2">{product.name}</h3>
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="text-sm font-medium">{product.rating}</span>
                      <span className="text-sm text-muted-foreground">({product.reviews})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{product.price.toLocaleString()}원</span>
                      <span className="text-sm text-muted-foreground line-through">
                        {product.originalPrice.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Farm Experiences */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">농장 체험 프로그램</h2>
              <p className="text-muted-foreground">도시를 벗어나 자연과 함께하는 특별한 경험</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/experiences">전체보기</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {experiences.map((exp) => (
              <Card
                key={exp.id}
                className="overflow-hidden group hover:shadow-lg transition-shadow"
              >
                <Link href={`/experiences/${exp.id}`}>
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <Image
                      src={exp.image || '/placeholder.svg'}
                      alt={exp.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3" />
                      <span>{exp.farm}</span>
                      <span className="mx-1">•</span>
                      <span>{exp.location}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{exp.title}</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span>{exp.duration}</span>
                      <span>{exp.capacity}</span>
                    </div>
                    <div className="text-xl font-bold text-primary">
                      {exp.price.toLocaleString()}원
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-primary text-primary-foreground p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">농가이신가요?</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              바로팜과 함께 더 많은 고객을 만나고, 농장 체험 프로그램으로 새로운 수익을 창출하세요
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/farmer/signup">농가 등록하기</Link>
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
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
                  <Link href="/experiences" className="hover:text-foreground">
                    농장 체험
                  </Link>
                </li>
                <li>
                  <Link href="/farms" className="hover:text-foreground">
                    농장 찾기
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">농가</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/farmer/signup" className="hover:text-foreground">
                    농가 등록
                  </Link>
                </li>
                <li>
                  <Link href="/farmer/login" className="hover:text-foreground">
                    농가 로그인
                  </Link>
                </li>
                <li>
                  <Link href="/farmer/guide" className="hover:text-foreground">
                    이용 가이드
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

      {/* 챗봇 위젯 */}
      <ChatbotWidget />
    </div>
  )
}
