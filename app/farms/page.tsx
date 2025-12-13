'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MapPin, Star, Search, Filter, X, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function FarmsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [region, setRegion] = useState('all')
  const [sortBy, setSortBy] = useState('popular')

  const farms = [
    {
      id: 1,
      name: '햇살농장',
      location: '충남 당진',
      region: '충청',
      image: '/farm-1.jpg',
      rating: 4.8,
      reviews: 124,
      products: 12,
      experiences: 3,
      specialties: ['유기농 토마토', '무농약 상추'],
      certification: ['유기농 인증', 'GAP 인증'],
      phone: '010-1234-5678',
      email: 'sunshine@barofarm.com',
    },
    {
      id: 2,
      name: '초록들판',
      location: '경기 양평',
      region: '경기',
      image: '/farm-2.jpg',
      rating: 4.9,
      reviews: 89,
      products: 8,
      experiences: 2,
      specialties: ['무농약 상추', '친환경 채소'],
      certification: ['무농약 인증'],
      phone: '010-2345-6789',
      email: 'greenfield@barofarm.com',
    },
    {
      id: 3,
      name: '달콤농원',
      location: '전북 완주',
      region: '전라',
      image: '/farm-3.jpg',
      rating: 5.0,
      reviews: 203,
      products: 15,
      experiences: 4,
      specialties: ['친환경 딸기', '유기농 블루베리'],
      certification: ['친환경 인증', '유기농 인증'],
      phone: '010-3456-7890',
      email: 'sweetfarm@barofarm.com',
    },
    {
      id: 4,
      name: '푸른밭농장',
      location: '강원 평창',
      region: '강원',
      image: '/farm-4.jpg',
      rating: 4.7,
      reviews: 67,
      products: 10,
      experiences: 2,
      specialties: ['유기농 감자', '무농약 당근'],
      certification: ['유기농 인증'],
      phone: '010-4567-8901',
      email: 'bluefield@barofarm.com',
    },
    {
      id: 5,
      name: '사과마을',
      location: '경북 청송',
      region: '경북',
      image: '/farm-5.jpg',
      rating: 4.9,
      reviews: 156,
      products: 18,
      experiences: 3,
      specialties: ['무농약 사과', '유기농 배'],
      certification: ['무농약 인증', 'GAP 인증'],
      phone: '010-5678-9012',
      email: 'applevillage@barofarm.com',
    },
    {
      id: 6,
      name: '건강농장',
      location: '제주',
      region: '제주',
      image: '/farm-6.jpg',
      rating: 4.6,
      reviews: 92,
      products: 9,
      experiences: 1,
      specialties: ['유기농 당근', '친환경 브로콜리'],
      certification: ['유기농 인증'],
      phone: '010-6789-0123',
      email: 'healthfarm@barofarm.com',
    },
    {
      id: 7,
      name: '베리팜',
      location: '전남 고흥',
      region: '전라',
      image: '/farm-7.jpg',
      rating: 4.8,
      reviews: 134,
      products: 11,
      experiences: 3,
      specialties: ['친환경 블루베리', '유기농 딸기'],
      certification: ['친환경 인증', '유기농 인증'],
      phone: '010-7890-1234',
      email: 'berryfarm@barofarm.com',
    },
    {
      id: 8,
      name: '그린농원',
      location: '충북 충주',
      region: '충청',
      image: '/farm-8.jpg',
      rating: 4.7,
      reviews: 78,
      products: 7,
      experiences: 2,
      specialties: ['무농약 브로콜리', '친환경 양배추'],
      certification: ['무농약 인증'],
      phone: '010-8901-2345',
      email: 'greenfarm@barofarm.com',
    },
  ]

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
  }, [searchQuery, region, sortBy])

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

          {filteredAndSortedFarms.length === 0 ? (
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
                <Card
                  key={farm.id}
                  className="overflow-hidden group hover:shadow-lg transition-shadow"
                >
                  <Link href={`/farms/${farm.id}`} className="block">
                    <div className="relative h-48 overflow-hidden bg-muted">
                      <Image
                        src={farm.image || '/placeholder.svg'}
                        alt={farm.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  </Link>
                  <div className="p-5">
                    <Link href={`/farms/${farm.id}`} className="block">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold mb-1 hover:text-primary transition-colors">
                            {farm.name}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{farm.location}</span>
                          </div>
                        </div>
                        {/* TODO: 평점 및 리뷰 기능 추가 예정 */}
                        {/* <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="text-sm font-medium">{farm.rating}</span>
                          <span className="text-sm text-muted-foreground">({farm.reviews})</span>
                        </div> */}
                      </div>
                    </Link>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {farm.certification.map((cert) => (
                        <Badge key={cert} variant="secondary" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">판매 상품</span>
                        <span className="font-medium">{farm.products}개</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">체험 프로그램</span>
                        <span className="font-medium">{farm.experiences}개</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2">주요 특산품</p>
                      <div className="flex flex-wrap gap-1">
                        {farm.specialties.map((specialty) => (
                          <Badge key={specialty} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/farms/${farm.id}`}>농장 상세보기</Link>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/products?farm=${farm.id}`}>상품 보기</Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
