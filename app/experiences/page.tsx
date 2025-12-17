'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter, X } from 'lucide-react'
import { Header } from '@/components/layout/header'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { experienceService } from '@/lib/api/services/experience'
import { farmService } from '@/lib/api/services/farm'
import type { Experience } from '@/lib/api/types'
import { ExperienceCard, type ExperienceCardData } from '@/components/experience/experience-card'

export default function ExperiencesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [experiences, setExperiences] = useState<ExperienceCardData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [paginationInfo, setPaginationInfo] = useState<{
    totalPages: number
    totalElements: number
    hasNext: boolean
    hasPrevious: boolean
    page: number
    size: number
  } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 체험 프로그램 목록 로드
  useEffect(() => {
    const fetchExperiences = async () => {
      if (!mounted) return

      setIsLoading(true)
      try {
        const params: { category?: string; page?: number; size?: number } = {
          page: currentPage,
          size: 20,
        }
        if (category !== 'all') {
          params.category = category
        }
        const response = await experienceService.getExperiences(params)
        // response.content가 배열인지 확인
        const experienceData: Experience[] = Array.isArray(response?.content)
          ? response.content
          : []

        // 각 체험의 농장 정보 가져오기
        if (experienceData.length > 0) {
          const experiencesWithFarmInfo: ExperienceCardData[] = await Promise.all(
            experienceData.map(async (experience) => {
              let farmName = ''
              let farmLocation = ''
              if (experience.farmId) {
                try {
                  const farmInfo = await farmService.getFarm(experience.farmId)
                  farmName = farmInfo?.name || ''
                  farmLocation = farmInfo?.address || ''
                } catch (error) {
                  console.warn(`농장 정보 로드 실패 (farmId: ${experience.farmId}):`, error)
                }
              }

              return {
                ...experience,
                farmName,
                farmLocation,
                imageUrl: '/placeholder.svg', // TODO: API에서 이미지 정보 추가
                rating: 0, // TODO: API에서 평점 정보 추가
                reviewCount: 0, // TODO: API에서 리뷰 수 정보 추가
              }
            })
          )
          setExperiences(experiencesWithFarmInfo)
        } else {
          setExperiences([])
        }
        // 페이지네이션 정보 저장
        const paginationData = {
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0,
          hasNext: response.hasNext || false,
          hasPrevious: response.hasPrevious || false,
          page: response.page || 0,
          size: response.size || 20,
        }
        setPaginationInfo(paginationData)
      } catch (error) {
        console.error('체험 프로그램 조회 실패:', error)
        // 에러 발생 시 빈 배열로 설정
        setExperiences([])
        setPaginationInfo(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchExperiences()
  }, [mounted, category, currentPage])

  // API 데이터를 표시 형식으로 변환
  const displayExperiences: ExperienceCardData[] = useMemo(() => {
    if (!Array.isArray(experiences)) {
      return []
    }
    return experiences.map(
      (exp): ExperienceCardData => ({
        experienceId: exp.experienceId,
        farmId: exp.farmId,
        title: exp.title,
        description: exp.description,
        pricePerPerson: exp.pricePerPerson,
        capacity: exp.capacity,
        durationMinutes: exp.durationMinutes,
        availableStartDate: exp.availableStartDate,
        availableEndDate: exp.availableEndDate,
        status: exp.status,
        createdAt: exp.createdAt,
        updatedAt: exp.updatedAt,
        // 농장 정보는 이미 로드되어 있음
        farmName: exp.farmName || '',
        farmLocation: exp.farmLocation || '',
        imageUrl: exp.imageUrl || '/placeholder.svg',
        rating: exp.rating || 0,
        reviewCount: exp.reviewCount || 0,
      })
    )
  }, [experiences])

  // 클라이언트 사이드 검색 필터링 (서버 사이드 검색이 없을 경우)
  const filteredExperiences: ExperienceCardData[] = useMemo(() => {
    let filtered = [...displayExperiences]

    // 검색 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (exp) =>
          exp.title.toLowerCase().includes(query) ||
          exp.farmName?.toLowerCase().includes(query) ||
          exp.farmLocation?.toLowerCase().includes(query)
      )
    }

    // 정렬
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
        break
      case 'latest':
        filtered.sort((a, b) => b.experienceId.localeCompare(a.experienceId))
        break
      case 'low-price':
        filtered.sort((a, b) => (a.pricePerPerson || 0) - (b.pricePerPerson || 0))
        break
      case 'high-price':
        filtered.sort((a, b) => (b.pricePerPerson || 0) - (a.pricePerPerson || 0))
        break
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      default:
        break
    }

    return filtered
  }, [searchQuery, sortBy, displayExperiences])

  const hasActiveFilters = searchQuery.trim() || category !== 'all'

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // 페이지 변경 시 스크롤을 맨 위로
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearFilters = () => {
    setSearchQuery('')
    setCategory('all')
    setSortBy('popular')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showCart />

      {/* Page Header */}
      <section className="py-12 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">농장 체험 프로그램</h1>
          <p className="text-muted-foreground">
            도시를 벗어나 자연과 함께하는 특별한 경험을 만들어보세요
          </p>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="py-6 border-b bg-background sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="체험 프로그램, 농장 이름으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="수확">수확 체험</SelectItem>
                <SelectItem value="요리">요리 체험</SelectItem>
                <SelectItem value="동물">동물 교감</SelectItem>
                <SelectItem value="기타">기타</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">인기순</SelectItem>
                <SelectItem value="latest">최신순</SelectItem>
                <SelectItem value="low-price">낮은 가격순</SelectItem>
                <SelectItem value="high-price">높은 가격순</SelectItem>
                <SelectItem value="rating">평점순</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="md:w-auto bg-transparent">
              <Filter className="h-4 w-4 mr-2" />
              필터
            </Button>
          </div>
        </div>
      </section>

      {/* Experiences Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              총{' '}
              <span className="font-semibold text-foreground">
                {paginationInfo?.totalElements || filteredExperiences.length}
              </span>
              개의 체험 프로그램
              {paginationInfo && paginationInfo.totalPages > 1 && (
                <span className="ml-2 text-xs">
                  (페이지 {paginationInfo.page + 1} / {paginationInfo.totalPages})
                </span>
              )}
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
              <div className="text-lg font-semibold mb-2">로딩 중...</div>
              <div className="text-sm text-muted-foreground">
                체험 프로그램을 불러오는 중입니다.
              </div>
            </div>
          ) : filteredExperiences.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
              <p className="text-muted-foreground mb-4">다른 검색어나 필터를 시도해보세요</p>
              <Button variant="outline" onClick={clearFilters}>
                필터 초기화
              </Button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExperiences.map((exp, index) => (
                  <ExperienceCard
                    key={exp.experienceId}
                    experience={exp}
                    className={index === 0 ? 'priority-image' : ''}
                  />
                ))}
              </div>

              {/* Pagination */}
              {paginationInfo && paginationInfo.totalPages > 0 && (
                <div className="mt-8 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (paginationInfo.hasPrevious) {
                              handlePageChange(currentPage - 1)
                            }
                          }}
                          className={
                            !paginationInfo.hasPrevious
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>

                      {Array.from({ length: paginationInfo.totalPages }, (_, i) => i).map(
                        (page) => {
                          // 처음 3페이지, 마지막 3페이지, 현재 페이지 주변만 표시
                          if (
                            page === 0 ||
                            page === 1 ||
                            page === 2 ||
                            page === paginationInfo.totalPages - 1 ||
                            page === paginationInfo.totalPages - 2 ||
                            page === paginationInfo.totalPages - 3 ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    handlePageChange(page)
                                  }}
                                  isActive={page === currentPage}
                                >
                                  {page + 1}
                                </PaginationLink>
                              </PaginationItem>
                            )
                          } else if (page === 3 || page === paginationInfo.totalPages - 4) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )
                          }
                          return null
                        }
                      )}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (paginationInfo.hasNext) {
                              handlePageChange(currentPage + 1)
                            }
                          }}
                          className={
                            !paginationInfo.hasNext
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
