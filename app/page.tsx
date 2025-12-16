import { Button } from '@/components/ui/button'
import { Sprout, Leaf, Heart, TrendingDown } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { ScrollCTA } from '@/components/scroll-cta'
import { HeroSlider } from '@/components/landing/hero-slider'
import { ProductCard } from '@/components/product/product-card'
import { ExperienceCard } from '@/components/product/experience-card'

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
      id: 3,
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

      {/* Hero Section - Greenlabs Style */}
      <HeroSlider />

      {/* Features - Greenlabs Style */}
      <section className="pt-20 pb-12 md:pt-28 md:pb-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-6 md:px-8 max-w-7xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-6xl font-semibold mb-6 text-gray-900 dark:text-white tracking-tight">
              왜 바로팜일까요?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-normal">
              농가와 소비자를 직접 연결하는 지속가능한 플랫폼
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 md:gap-16 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 bg-[#F0FDF4] dark:bg-green-950/30 rounded-2xl border border-[#D1FAE5] dark:border-green-900/50">
                <Leaf className="h-12 w-12 text-[#22C55E] dark:text-[#4ADE80]" />
              </div>
              <h3 className="text-2xl md:text-3xl font-semibold mb-3 text-gray-900 dark:text-white">
                환경 보호
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
                중간 유통 단계를 줄여 탄소 배출을 최소화하고 포장재 사용을 줄입니다
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 bg-[#F0FDF4] dark:bg-green-950/30 rounded-2xl border border-[#D1FAE5] dark:border-green-900/50">
                <TrendingDown className="h-12 w-12 text-[#22C55E] dark:text-[#4ADE80]" />
              </div>
              <h3 className="text-2xl md:text-3xl font-semibold mb-3 text-gray-900 dark:text-white">
                합리적 가격
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
                직거래로 중간 마진을 없애 농가와 소비자 모두에게 이익을 제공합니다
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 bg-[#F0FDF4] dark:bg-green-950/30 rounded-2xl border border-[#D1FAE5] dark:border-green-900/50">
                <Heart className="h-12 w-12 text-[#22C55E] dark:text-[#4ADE80]" />
              </div>
              <h3 className="text-2xl md:text-3xl font-semibold mb-3 text-gray-900 dark:text-white">
                농가 활성화
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
                농장 체험 프로그램으로 농가에 새로운 수익원을 제공합니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats - Clean Minimal Style */}
      <section className="pt-10 pb-16 md:pt-12 md:pb-20 bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 md:px-8 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#22C55E] dark:text-[#4ADE80] mb-2 tracking-tight">
                320+
              </div>
              <div className="text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium">
                등록 농가
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#22C55E] dark:text-[#4ADE80] mb-2 tracking-tight">
                1,200+
              </div>
              <div className="text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium">
                신선 농산물
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#22C55E] dark:text-[#4ADE80] mb-2 tracking-tight">
                85%
              </div>
              <div className="text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium">
                탄소 절감
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#22C55E] dark:text-[#4ADE80] mb-2 tracking-tight">
                50k+
              </div>
              <div className="text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium">
                만족한 고객
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - E-commerce Style */}
      <section className="py-32 md:py-40 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-6 md:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16">
            <div className="mb-8 md:mb-0">
              <h2 className="text-4xl md:text-6xl font-semibold mb-4 text-gray-900 dark:text-white tracking-tight">
                오늘의 신선 농산물
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-normal">
                농장에서 직접 배송되는 신선한 농산물
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-[#22C55E] text-[#22C55E] hover:bg-[#F0FDF4] dark:hover:bg-green-950/30 rounded-lg font-semibold transition-all"
              asChild
            >
              <Link href="/products">전체보기 →</Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                farm={product.farm}
                location={product.location}
                price={product.price}
                originalPrice={product.originalPrice}
                image={product.image}
                rating={product.rating}
                reviews={product.reviews}
                tag={product.tag}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Farm Experiences - Greenlabs Style */}
      <section className="py-32 md:py-40 bg-[#F9FAF8] dark:bg-gray-900">
        <div className="container mx-auto px-6 md:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16">
            <div className="mb-8 md:mb-0">
              <h2 className="text-4xl md:text-6xl font-semibold mb-4 text-gray-900 dark:text-white tracking-tight">
                농장 체험 프로그램
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-normal">
                도시를 벗어나 자연과 함께하는 특별한 경험
              </p>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-[#22C55E] text-[#22C55E] hover:bg-[#F0FDF4] dark:hover:bg-green-950/30 rounded-lg font-semibold transition-all"
              asChild
            >
              <Link href="/experiences">전체보기 →</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {experiences.map((exp) => (
              <ExperienceCard
                key={exp.id}
                id={exp.id}
                title={exp.title}
                farm={exp.farm}
                location={exp.location}
                price={exp.price}
                image={exp.image}
                duration={exp.duration}
                capacity={exp.capacity}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Clean Style */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-6 md:px-8 max-w-7xl">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Sprout className="h-5 w-5 text-[#22C55E] dark:text-[#4ADE80]" />
                <span className="font-light text-lg text-gray-900 dark:text-white">바로팜</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                농장에서 식탁까지, 신선함을 바로 전하는 Farm-to-Table 플랫폼
              </p>
            </div>
            <div>
              <h4 className="font-light text-sm mb-6 text-gray-900 dark:text-white uppercase tracking-wider">
                서비스
              </h4>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link
                    href="/products"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors font-light"
                  >
                    농산물 장터
                  </Link>
                </li>
                <li>
                  <Link
                    href="/experiences"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors font-light"
                  >
                    농장 체험
                  </Link>
                </li>
                <li>
                  <Link
                    href="/farms"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors font-light"
                  >
                    농장 찾기
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-light text-sm mb-6 text-gray-900 dark:text-white uppercase tracking-wider">
                농가
              </h4>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link
                    href="/farmer/signup"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors font-light"
                  >
                    농가 등록
                  </Link>
                </li>
                <li>
                  <Link
                    href="/farmer/login"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors font-light"
                  >
                    농가 로그인
                  </Link>
                </li>
                <li>
                  <Link
                    href="/farmer/guide"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors font-light"
                  >
                    이용 가이드
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-light text-sm mb-6 text-gray-900 dark:text-white uppercase tracking-wider">
                고객센터
              </h4>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link
                    href="/help"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors font-light"
                  >
                    자주 묻는 질문
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors font-light"
                  >
                    문의하기
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-gray-900 dark:hover:text-white transition-colors font-light"
                  >
                    이용약관
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 text-center text-sm text-gray-600 dark:text-gray-400 font-light">
            <p>&copy; 2025 바로팜 BaroFarm. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Scroll-triggered CTA */}
      <ScrollCTA />
    </div>
  )
}