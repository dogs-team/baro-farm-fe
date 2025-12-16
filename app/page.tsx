import { Button } from '@/components/ui/button'
import { Sprout, Leaf, Heart, TrendingDown } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { ScrollCTA } from '@/components/scroll-cta'
import { HeroSlider } from '@/components/landing/hero-slider'
import { ProductCard } from '@/components/product/product-card'
import { ExperienceCard } from '@/components/experience/experience-card'
import { productService } from '@/lib/api/services/product'
import { sellerService } from '@/lib/api/services/seller'
import { farmService } from '@/lib/api/services/farm'
import { experienceService } from '@/lib/api/services/experience'
import { getProductImage } from '@/lib/utils/product-images'

export default async function HomePage() {
  // 실제 상품 데이터 가져오기 (인기 상품)
  let featuredProducts: any[] = []
  try {
    const response = await productService.getProducts({
      // page: 0, // API에서 page 파라미터를 지원하지 않음
      // size: 4, // API에서 size 파라미터를 지원하지 않음
      // 인기 상품 정렬 (API에서 지원한다면)
    })

    if (response?.content) {
      // 각 상품의 판매자 정보 가져오기
      const productsWithSellerInfo = await Promise.all(
        response.content.map(async (product) => {
          const productName = product.productName
          const defaultImage = getProductImage(productName, product.id)

          let storeName = '판매자 정보 없음'
          if (product.sellerId) {
            try {
              const sellerInfo = await sellerService.getSellerInfo(product.sellerId)
              storeName = sellerInfo?.storeName || '판매자 정보 없음'
            } catch (error) {
              console.warn('판매자 정보 로드 실패:', error)
            }
          }

          return {
            id: product.id,
            name: productName,
            storeName,
            price: product.price,
            originalPrice:
              product.productStatus === 'DISCOUNTED' ? product.price * 1.2 : product.price,
            image: product.imageUrls?.[0] || defaultImage,
            rating: 0,
            reviews: 0, // TODO: 리뷰 개수 API 추가 시 업데이트
            tag:
              product.productStatus === 'DISCOUNTED'
                ? '할인'
                : product.productStatus === 'ON_SALE'
                  ? '판매중'
                  : '베스트',
          }
        })
      )

      featuredProducts = productsWithSellerInfo
    }
  } catch (error) {
    console.error('상품 데이터 로드 실패:', error)
    // API 실패 시 빈 배열 사용
    featuredProducts = []
  }

  // 체험 데이터 가져오기 (인기 체험)
  let featuredExperiences: any[] = []
  try {
    const response = await experienceService.getExperiences({
      page: 0,
      size: 3, // 메인 페이지에 3개만 표시
    })

    if (response?.content) {
      // 각 체험의 농장 정보 가져오기
      const experiencesWithFarmInfo = await Promise.all(
        response.content.map(async (experience) => {
          let farmName = '농장 정보 없음'
          let farmLocation = ''
          if (experience.farmId) {
            try {
              const farmInfo = await farmService.getFarm(experience.farmId)
              farmName = farmInfo?.name || '농장 정보 없음'
              farmLocation = farmInfo?.address || ''
            } catch (error) {
              console.warn('농장 정보 로드 실패:', error)
            }
          }

          return {
            experienceId: experience.experienceId,
            farmId: experience.farmId,
            title: experience.title,
            description: experience.description,
            pricePerPerson: experience.pricePerPerson,
            capacity: experience.capacity,
            durationMinutes: experience.durationMinutes,
            availableStartDate: experience.availableStartDate,
            availableEndDate: experience.availableEndDate,
            status: experience.status,
            createdAt: experience.createdAt,
            updatedAt: experience.updatedAt,
            farmName,
            farmLocation,
            imageUrl: '/placeholder.svg', // TODO: API에서 이미지 정보 추가
            rating: 0,
            reviewCount: 0,
          }
        })
      )
      featuredExperiences = experiencesWithFarmInfo
    }
  } catch (error) {
    console.warn('체험 데이터 로드 실패:', error)
    featuredExperiences = []
  }

  // 체험 데이터 (API 데이터)
  const experiences = featuredExperiences

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

          {featuredProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  storeName={product.storeName}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  image={product.image}
                  rating={product.rating}
                  reviews={product.reviews}
                  tag={product.tag}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <div className="text-muted-foreground">
                <p className="text-lg font-medium mb-2">상품을 불러올 수 없습니다</p>
                <p className="text-sm">잠시 후 다시 시도해주세요.</p>
              </div>
            </div>
          )}
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

          {experiences.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {experiences.map((exp) => (
                <ExperienceCard key={exp.experienceId} experience={exp} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <div className="text-muted-foreground">
                <p className="text-lg font-medium mb-2">체험을 불러올 수 없습니다</p>
                <p className="text-sm">잠시 후 다시 시도해주세요.</p>
              </div>
            </div>
          )}
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
