'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Clock, TrendingUp, X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getRecentSearches,
  removeSearchHistory,
  clearSearchHistory,
} from '@/lib/utils/search-history'

interface SearchSuggestionsProps {
  query: string
  suggestions: string[]
  popularKeywords: string[]
  isLoading?: boolean
  onSelect: (keyword: string) => void
  onClose?: () => void
  className?: string
}

export function SearchSuggestions({
  query,
  suggestions,
  popularKeywords,
  isLoading = false,
  onSelect,
  onClose,
  className,
}: SearchSuggestionsProps) {
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const loadRecentSearches = () => {
    const recent = getRecentSearches(5)
    setRecentSearches(recent.map((item) => item.keyword))
  }

  useEffect(() => {
    // 컴포넌트 마운트 시 최근 검색어 로드

    loadRecentSearches()

    // storage 이벤트 리스너 추가
    const handleStorageUpdate = () => {
      loadRecentSearches()
    }

    window.addEventListener('searchHistoryUpdated', handleStorageUpdate)

    return () => {
      window.removeEventListener('searchHistoryUpdated', handleStorageUpdate)
    }
    // query 변경 시에는 최근 검색어를 다시 로드하지 않음 (의도된 동작)
  }, [])

  const handleSelect = (keyword: string) => {
    onSelect(keyword)
    onClose?.()
  }

  const handleRemoveRecent = (e: React.MouseEvent, keyword: string) => {
    e.stopPropagation()
    removeSearchHistory(keyword)
    setRecentSearches((prev) => prev.filter((k) => k !== keyword))
  }

  const hasSuggestions = suggestions.length > 0
  const hasRecentSearches = recentSearches.length > 0 && !query
  const hasPopularKeywords = popularKeywords.length > 0 && !query

  // 표시 조건: 로딩 중이거나, 검색어가 비어있거나, 결과가 있을 때
  const shouldShow =
    isLoading || !query || hasSuggestions || hasRecentSearches || hasPopularKeywords

  // 검색어가 있고 결과가 없고 로딩 중이 아닐 때만 숨김
  if (!shouldShow) {
    return null
  }

  return (
    <Card
      ref={containerRef}
      className={cn(
        'absolute top-full left-0 right-0 mt-2 z-50 max-h-[400px] overflow-y-auto shadow-lg',
        className
      )}
    >
      <div className="p-2">
        {/* 로딩 상태 */}
        {isLoading && (
          <div className="p-4 text-center text-sm text-muted-foreground">검색 중...</div>
        )}

        {/* 자동완성 추천 */}
        {hasSuggestions && !isLoading && (
          <div className="mb-2">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">추천 검색어</div>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSelect(suggestion)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted rounded-md transition-colors flex items-center gap-2"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        )}

        {/* 최근 검색어 */}
        {hasRecentSearches && (
          <div className="mb-2">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                최근 검색어
              </div>
              <button
                onClick={() => {
                  clearSearchHistory()
                  setRecentSearches([])
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                전체 삭제
              </button>
            </div>
            {recentSearches.map((keyword, index) => (
              <div
                key={index}
                className="w-full hover:bg-muted rounded-md transition-colors flex items-center justify-between group"
              >
                <button
                  onClick={() => handleSelect(keyword)}
                  className="flex-1 px-3 py-2 text-left text-sm flex items-center gap-2"
                >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{keyword}</span>
                </button>
                <button
                  onClick={(e) => handleRemoveRecent(e, keyword)}
                  className="px-3 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
                  aria-label="삭제"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 인기 검색어 */}
        {hasPopularKeywords && (
          <div>
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              인기 검색어
            </div>
            <div className="flex flex-wrap gap-2 px-3 pb-2">
              {popularKeywords.slice(0, 10).map((keyword, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(keyword)}
                  className="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-full transition-colors"
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 검색어가 비어있을 때 안내 */}
        {!query && !hasRecentSearches && !hasPopularKeywords && !isLoading && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            검색어를 입력하거나 최근 검색어를 선택하세요
          </div>
        )}

        {/* 검색 결과 없음 */}
        {query && !hasSuggestions && !isLoading && (
          <div className="p-4 text-center text-sm text-muted-foreground">검색 결과가 없습니다</div>
        )}
      </div>
    </Card>
  )
}
