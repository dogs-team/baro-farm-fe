'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { searchService } from '@/lib/api/services/search'
import { UnifiedSearchResponse } from '@/lib/api/types'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, ShoppingBag, Tractor, Tent, AlertCircle } from 'lucide-react'
import { ProductCard } from '@/components/product/product-card'
import { FarmCard } from '@/components/product/farm-card'
import { ExperienceCard } from '@/components/experience/experience-card'

function SearchResults() {
  const searchParams = useSearchParams()
  // 'keyword' maps to 'q' in the header navigation, but let's support both just in case
  const query = searchParams.get('q') || searchParams.get('keyword') || ''

  const [results, setResults] = useState<UnifiedSearchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchResults() {
      if (!query.trim()) {
        setResults(null)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await searchService.search({
          keyword: query,
          page: 0,
          size: 20,
        })
        setResults(response)
      } catch (err) {
        console.error('검색 실패:', err)
        setError('검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [query])

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-20" />
        <h2 className="text-2xl font-bold mb-2">검색어를 입력해주세요</h2>
        <p className="text-muted-foreground">
          상단의 검색창을 통해 원하는 상품, 농장, 체험을 찾아보세요.
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">&apos;{query}&apos; 검색 결과</h1>

      {isLoading ? (
        <div className="space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-destructive/5 rounded-lg">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <p className="text-destructive font-medium">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            다시 시도
          </Button>
        </div>
      ) : !results ||
        (results.products?.totalElements === 0 &&
          results.farms?.totalElements === 0 &&
          results.experiences?.totalElements === 0) ? (
        <div className="text-center py-20 bg-muted/30 rounded-lg">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">검색 결과가 없습니다</h2>
          <p className="text-muted-foreground">다른 검색어로 다시 시도해보세요.</p>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="products">
              상품 ({results.products?.totalElements ?? 0})
            </TabsTrigger>
            <TabsTrigger value="farms">농장 ({results.farms?.totalElements ?? 0})</TabsTrigger>
            <TabsTrigger value="experiences">
              체험 ({results.experiences?.totalElements ?? 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-12">
            {/* Products Section */}
            {(results.products?.totalElements ?? 0) > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" /> 상품
                  </h2>
                  {(results.products?.totalElements ?? 0) > 5 && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/products?search=${query}`}>더보기</Link>
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                  {(results.products?.content || []).slice(0, 5).map((product) => (
                    <ProductCard
                      key={product.productId}
                      id={product.productId}
                      name={product.productName}
                      storeName="상점 정보 없음" // Search API doesn't return info
                      price={product.price}
                      image={product.imageUrl || '/placeholder.svg'}
                      rating={0}
                      reviews={0}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Farms Section */}
            {(results.farms?.totalElements ?? 0) > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Tractor className="h-5 w-5" /> 농장
                  </h2>
                  {(results.farms?.totalElements ?? 0) > 3 && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/farms?search=${query}`}>더보기</Link>
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(results.farms?.content || []).slice(0, 3).map((farm) => (
                    <FarmCard
                      key={farm.farmId}
                      id={farm.farmId}
                      name={farm.farmName}
                      location={farm.address || ''}
                      image={farm.imageUrl || '/placeholder.svg'}
                      products={0}
                      experiences={0}
                      specialties={[]}
                      certification={[]}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Experiences Section */}
            {(results.experiences?.totalElements ?? 0) > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Tent className="h-5 w-5" /> 체험
                  </h2>
                  {(results.experiences?.totalElements ?? 0) > 3 && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/experiences?search=${query}`}>더보기</Link>
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(results.experiences?.content || []).slice(0, 3).map((experience) => (
                    <ExperienceCard
                      key={experience.experienceId}
                      experience={{
                        experienceId: experience.experienceId,
                        farmId: '', // 검색 결과에는 없음
                        title: experience.title,
                        description: '더 자세한 정보는 상세 페이지에서 확인하세요.', // 기본 설명
                        pricePerPerson: experience.pricePerPerson,
                        capacity: 10, // 기본 정원
                        durationMinutes: 60, // 기본 1시간
                        availableStartDate: '', // 검색 결과에는 없음
                        availableEndDate: '', // 검색 결과에는 없음
                        status: 'ON_SALE' as const, // 기본값
                        farmName: '상세 정보에서 확인',
                        farmLocation: '상세 정보에서 확인',
                        imageUrl: experience.imageUrl || '/placeholder.svg',
                        rating: 0,
                        reviewCount: 0,
                      }}
                    />
                  ))}
                </div>
              </section>
            )}
          </TabsContent>

          <TabsContent value="products">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {(results.products?.content || []).map((product) => (
                <ProductCard
                  key={product.productId}
                  id={product.productId}
                  name={product.productName}
                  storeName="상점 정보 없음"
                  price={product.price}
                  image={product.imageUrl || '/placeholder.svg'}
                  rating={0}
                  reviews={0}
                />
              ))}
            </div>
            {(results.products?.content || []).length === 0 && (
              <EmptyState message="검색된 상품이 없습니다." />
            )}
          </TabsContent>

          <TabsContent value="farms">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(results.farms?.content || []).map((farm) => (
                <FarmCard
                  key={farm.farmId}
                  id={farm.farmId}
                  name={farm.farmName}
                  location={farm.address || ''}
                  image={farm.imageUrl || '/placeholder.svg'}
                  products={0}
                  experiences={0}
                  specialties={[]}
                  certification={[]}
                />
              ))}
            </div>
            {(results.farms?.content || []).length === 0 && (
              <EmptyState message="검색된 농장이 없습니다." />
            )}
          </TabsContent>

          <TabsContent value="experiences">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(results.experiences?.content || []).map((experience) => (
                <ExperienceCard
                  key={experience.experienceId}
                  experience={{
                    experienceId: experience.experienceId,
                    farmId: '', // 검색 결과에는 없음
                    title: experience.title,
                    description: '더 자세한 정보는 상세 페이지에서 확인하세요.', // 기본 설명
                    pricePerPerson: experience.pricePerPerson,
                    capacity: 10, // 기본 정원
                    durationMinutes: 60, // 기본 1시간
                    availableStartDate: '', // 검색 결과에는 없음
                    availableEndDate: '', // 검색 결과에는 없음
                    status: 'ON_SALE' as const, // 기본값
                    farmName: '상세 정보에서 확인',
                    farmLocation: '상세 정보에서 확인',
                    imageUrl: experience.imageUrl || '/placeholder.svg',
                    rating: 0,
                    reviewCount: 0,
                  }}
                />
              ))}
            </div>
            {(results.experiences?.content || []).length === 0 && (
              <EmptyState message="검색된 체험이 없습니다." />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <p>{message}</p>
    </div>
  )
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header showCart />
      <Suspense fallback={<div className="container px-4 py-8">Loading...</div>}>
        <SearchResults />
      </Suspense>
    </div>
  )
}
