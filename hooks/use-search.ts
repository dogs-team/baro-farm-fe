'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { debounce } from '@/lib/utils/search'
import { searchService } from '@/lib/api/services/search'
import type {
  UnifiedAutoCompleteResponse,
  ProductAutoItem,
  ExperienceAutoItem,
} from '@/lib/api/types'

export interface UseSearchOptions {
  /** 검색어 최소 길이 */
  minLength?: number
  /** 디바운스 지연 시간 (ms) */
  debounceDelay?: number
  /** 자동완성 활성화 여부 */
  enableSuggestions?: boolean
  /** 인기 검색어 활성화 여부 */
  enablePopularKeywords?: boolean
  /** 자동완성 타입: 'unified' | 'product' | 'experience' */
  autocompleteType?: 'unified' | 'product' | 'experience'
}

export interface SearchSuggestion {
  keyword: string
  type?: 'product' | 'experience' | 'keyword'
  id?: string
  count?: number
}

export function useSearch(options: UseSearchOptions = {}) {
  const {
    minLength = 1,
    debounceDelay = 300,
    enableSuggestions = true,
    enablePopularKeywords = true,
    autocompleteType = 'unified',
  } = options

  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [popularKeywords, setPopularKeywords] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // 인기 검색어 로드
  // TODO: 인기 검색어 API가 추가되면 구현
  useEffect(() => {
    if (!enablePopularKeywords) return

    // 현재는 인기 검색어 API가 없으므로 빈 배열로 설정
    setPopularKeywords([])
  }, [enablePopularKeywords])

  // 검색어 자동완성
  const fetchSuggestions = useCallback(
    async (searchQuery: string) => {
      if (!enableSuggestions || searchQuery.length < minLength) {
        setSuggestions([])
        return
      }

      // 이전 요청 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()
      setIsLoading(true)
      setError(null)

      try {
        let allSuggestions: SearchSuggestion[] = []

        if (autocompleteType === 'unified') {
          // 통합 자동완성 API 사용
          const response = await searchService.unifiedAutocomplete({ q: searchQuery })
          allSuggestions = [
            ...response.products.map((p) => ({
              keyword: p.productName,
              type: 'product' as const,
              id: p.productId,
            })),
            ...response.experiences.map((e) => ({
              keyword: e.experienceName,
              type: 'experience' as const,
              id: e.experienceId,
            })),
          ]
        } else if (autocompleteType === 'product') {
          // 상품 자동완성 API 사용
          const response = await searchService.productAutocomplete({ query: searchQuery })
          allSuggestions = response.map((p) => ({
            keyword: p.productName,
            type: 'product' as const,
            id: p.productId,
          }))
        } else if (autocompleteType === 'experience') {
          // 체험 자동완성 API 사용
          const response = await searchService.experienceAutocomplete({ query: searchQuery })
          allSuggestions = response.map((e) => ({
            keyword: e.experienceName,
            type: 'experience' as const,
            id: e.experienceId,
          }))
        }

        setSuggestions(allSuggestions)
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err)
          console.error('검색어 자동완성 실패:', err)
        }
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    },
    [enableSuggestions, minLength, autocompleteType]
  )

  // 디바운스된 자동완성 함수
  const debouncedFetchSuggestions = useCallback(
    debounce((searchQuery: string) => {
      fetchSuggestions(searchQuery)
    }, debounceDelay),
    [fetchSuggestions, debounceDelay]
  )

  // 검색어 변경 핸들러
  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery)
      debouncedFetchSuggestions(newQuery)
    },
    [debouncedFetchSuggestions]
  )

  // 검색어 초기화
  const clearQuery = useCallback(() => {
    setQuery('')
    setSuggestions([])
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  // 검색어 선택 (자동완성에서)
  const selectSuggestion = useCallback((suggestion: SearchSuggestion | string) => {
    if (typeof suggestion === 'string') {
      setQuery(suggestion)
    } else {
      setQuery(suggestion.keyword)
    }
    setSuggestions([])
  }, [])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    query,
    suggestions,
    popularKeywords,
    isLoading,
    error,
    handleQueryChange,
    clearQuery,
    selectSuggestion,
    hasQuery: query.trim().length >= minLength,
  }
}
