'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MapPin, Search, Filter, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { farmService } from '@/lib/api/services/farm'
import type { Farm } from '@/lib/api/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FarmCard } from '@/components/product/farm-card'

interface DisplayFarm {
  id: string
  name: string
  location: string
  region: string
  image: string
  rating: number
  reviews: number
  products: number
  experiences: number
  specialties: string[]
  certification: string[]
}

function inferRegion(address?: string | null): string {
  if (!address) return '기타'
  if (address.includes('경기')) return '경기'
  if (address.includes('강원')) return '강원'
  if (address.includes('충청')) return '충청'
  if (address.includes('전라')) return '전라'
  if (address.includes('경북')) return '경북'
  if (address.includes('경남')) return '경남'
  if (address.includes('제주')) return '제주'
  return '기타'
}

function mapFarmToDisplay(farm: Farm): DisplayFarm {
  const location = farm.address || '주소 정보 없음'
  const region = inferRegion(farm.address)
  const image = farm.images && farm.images.length > 0 ? farm.images[0] : '/placeholder.svg'
  const rating = farm.rating ?? 0
  const reviews = farm.reviewCount ?? 0
  const products = farm.productCount ?? 0
  const experiences = farm.experienceCount ?? 0
  const certification = farm.certifications ?? []

  const specialties =
    farm.description
      ?.split(/[,/\\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 5) || []

  return {
    id: farm.id,
    name: farm.name,
    location,
    region,
    image,
    rating,
    reviews,
    products,
    experiences,
    specialties,
    certification,
  }
}

export default function FarmsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [region, setRegion] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [farms, setFarms] = useState<DisplayFarm[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await farmService.getFarms({ page: 0, size: 50 })
        const content = Array.isArray(response?.content) ? response.content : []
        const mapped = content.map(mapFarmToDisplay)
        setFarms(mapped)
      } catch (err: unknown) {
        console.error('농장 목록 조회 실패:', err)
        setError(
          (err as { message?: string })?.message || '농장 목록을 가져오는 중 오류가 발생했습니다.'
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchFarms()
  }, [])

  // 필터링 및 정렬 로직
  const filteredAndSortedFarms = useMemo(() => {
    let filtered = [...farms]

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (farm) =>
          farm.name.toLowerCase().includes(query) ||
          farm.location.toLowerCase().includes(query) ||
          farm.specialties.some((s) => s.toLowerCase().includes(query))
      )
    }

    // 지역 필터
    if (region !== 'all') {
      filtered = filtered.filter((farm) => farm.region === region)
    }

    // 정렬
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.reviews - a.reviews)
        break
      // TODO: 평점 기능 추가 예정
      // case 'rating':
      //   filtered.sort((a, b) => b.rating - a.rating)
      //   break
      case 'products':
        filtered.sort((a, b) => b.products - a.products)
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        break
    }

    return filtered
  }, [searchQuery, region, sortBy, farms])

  const hasActiveFilters = searchQuery.trim() || region !== 'all'

  const clearFilters = () => {
    setSearchQuery('')
    setRegion('all')
    setSortBy('popular')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showCart />

      {/* Page Header */}
      <section className="py-12 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">농장 찾기</h1>
          <p className="text-muted-foreground">신뢰할 수 있는 농가를 찾아보고 직접 만나보세요</p>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="py-6 border-b bg-background sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="농장 이름, 지역, 특산품으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="지역" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 지역</SelectItem>
                <SelectItem value="경기">경기도</SelectItem>
                <SelectItem value="강원">강원도</SelectItem>
                <SelectItem value="충청">충청도</SelectItem>
                <SelectItem value="전라">전라도</SelectItem>
                <SelectItem value="경북">경상북도</SelectItem>
                <SelectItem value="경남">경상남도</SelectItem>
                <SelectItem value="제주">제주도</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">인기순</SelectItem>
                {/* TODO: 평점 기능 추가 예정 */}
                {/* <SelectItem value="rating">평점순</SelectItem> */}
                <SelectItem value="products">상품 많은 순</SelectItem>
                <SelectItem value="name">이름순</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="md:w-auto bg-transparent">
              <Filter className="h-4 w-4 mr-2" />
              필터
            </Button>
          </div>
        </div>
      </section>

      {/* Farms Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              총{' '}
              <span className="font-semibold text-foreground">{filteredAndSortedFarms.length}</span>
              개의 농장
              {hasActiveFilters && <span className="ml-2 text-xs">(전체 {farms.length}개 중)</span>}
            </p>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                필터 초기화
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">농장 정보를 불러오는 중입니다...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <h3 className="text-lg font-semibold mb-2">농장 정보를 불러오지 못했습니다</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                다시 시도하기
              </Button>
            </div>
          ) : filteredAndSortedFarms.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
              <p className="text-muted-foreground mb-4">다른 검색어나 필터를 시도해보세요</p>
              <Button variant="outline" onClick={clearFilters}>
                필터 초기화
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedFarms.map((farm) => (
                <FarmCard
                  key={farm.id}
                  id={farm.id}
                  name={farm.name}
                  location={farm.location}
                  products={farm.products}
                  experiences={farm.experiences}
                  image={farm.image}
                  specialties={farm.specialties}
                  certification={farm.certification}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
