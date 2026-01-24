# 프론트엔드 개발 가이드 - STEP 01: 검색 모듈 (Search)

> 생성형 AI를 활용한 프론트엔드 개발을 위한 검색 API 연동 및 컴포넌트 생성 가이드

## 📋 목차

1. [모듈 개요](#모듈-개요)
2. [API 엔드포인트](#api-엔드포인트)
3. [DTO 구조](#dto-구조)
4. [인증 및 헤더](#인증-및-헤더)
5. [에러 처리](#에러-처리)
6. [프롬프트 작성 가이드](#프롬프트-작성-가이드)

---

## 모듈 개요

**검색 모듈 (Search)**은 다음과 같은 기능을 제공합니다:

- 🔍 **통합 검색**: 상품과 체험을 통합 검색
- 🛍️ **상품 검색**: 키워드 기반 상품 검색 및 자동완성 (필터링 지원)
- 🎯 **체험 검색**: 키워드 기반 체험 검색 및 자동완성

**Base URL**: `http://localhost:8092` (로컬) 또는 `http://ai-service:8092` (Docker)

**API Prefix**: `/api/v1`

---

## API 엔드포인트

### 1. 통합 검색

#### 통합 검색

```
GET /api/v1/search?q={keyword}&page={page}&size={size}
```

**Headers:**

- `X-User-Id` (optional): UUID - 사용자 ID (있으면 행동 로그 기록)

**Query Parameters:**

- `q` (required): string - 검색어
- `page` (optional, default: 0): number - 페이지 번호 (0부터 시작)
- `size` (optional, default: 10): number - 페이지 크기

**Response:**

```typescript
{
  success: boolean
  data: {
    products: {
      content: Array<{
        productId: string // UUID
        productName: string
        productCategoryName: string
        price: number // Long
      }>
      totalElements: number
      totalPages: number
      page: number
      size: number
    }
    experiences: {
      content: Array<{
        experienceId: string // UUID
        experienceName: string
        pricePerPerson: number // Long
        capacity: number // Integer
        durationMinutes: number // Integer
      }>
      totalElements: number
      totalPages: number
      page: number
      size: number
    }
  }
}
```

---

#### 통합 자동완성

```
GET /api/v1/search/autocomplete?q={keyword}&pSize={productSize}&eSize={experienceSize}
```

**Query Parameters:**

- `q` (required): string - 자동완성 키워드
- `pSize` (optional, default: 5): number - 상품 자동완성 개수
- `eSize` (optional, default: 5): number - 체험 자동완성 개수

**Response:**

```typescript
{
  success: boolean
  data: {
    products: Array<{
      productId: string
      productName: string
    }>
    experiences: Array<{
      experienceId: string
      experienceName: string
    }>
  }
}
```

**비고:**

- 자동완성은 행동 로그 대상에서 제외 (검색 실행만 로그)

---

### 2. 상품 검색

#### 상품 검색 (필터링 지원)

```
GET /api/v1/search/product?keyword={keyword}&categories={categories}&priceMin={min}&priceMax={max}&page={page}&size={size}
```

**Headers:**

- `X-User-Id` (optional): UUID - 사용자 ID (있으면 행동 로그 기록)

**Query Parameters:**

- `keyword` (optional): string - 검색 키워드
- `categories` (optional): string[] - 카테고리 필터 (배열, 여러 개 가능)
- `priceMin` (optional): number - 최소 가격
- `priceMax` (optional): number - 최대 가격
- `page` (optional, default: 0): number - 페이지 번호
- `size` (optional, default: 20): number - 페이지 크기

**Response:**

```typescript
{
  content: Array<{
    productId: string
    productName: string
    productCategoryName: string
    price: number
  }>
  totalElements: number
  totalPages: number
  page: number
  size: number
}
```

**예시:**

```
GET /api/v1/search/product?keyword=토마토&categories=과일&categories=채소&priceMin=1000&priceMax=10000&page=0&size=20
```

---

#### 상품 자동완성

```
GET /api/v1/search/product/autocomplete?query={keyword}&size={size}
```

**Query Parameters:**

- `query` (required): string - 자동완성 키워드
- `size` (optional, default: 5): number - 자동완성 개수

**Response:**

```typescript
Array<{
  productId: string
  productName: string
}>
```

**비고:**

- 자동완성 호출은 행동 로그 대상이 아님

---

### 3. 체험 검색

#### 체험 검색

```
GET /api/v1/search/experience?keyword={keyword}&page={page}&size={size}
```

**Query Parameters:**

- `keyword` (optional): string - 검색 키워드
- `page` (optional, default: 0): number - 페이지 번호
- `size` (optional, default: 20): number - 페이지 크기

**Response:**

```typescript
{
  content: Array<{
    experienceId: string
    experienceName: string
    pricePerPerson: number
    capacity: number
    durationMinutes: number
  }>
  totalElements: number
  totalPages: number
  page: number
  size: number
}
```

---

#### 체험 자동완성

```
GET /api/v1/search/experience/autocomplete?query={keyword}&size={size}
```

**Query Parameters:**

- `query` (required): string - 자동완성 키워드
- `size` (optional, default: 5): number - 자동완성 개수

**Response:**

```typescript
Array<{
  experienceId: string
  experienceName: string
}>
```

---

## DTO 구조

### 공통 응답 형식

대부분의 API는 다음 형식으로 응답합니다:

```typescript
// 성공 응답
{
  success: true
  data: T // 실제 데이터
}

// 에러 응답
{
  success: false
  error: {
    code: string
    message: string
  }
}
```

**단, 상품/체험 단독 검색 API는 `CustomPage<T>` 형식으로 직접 반환합니다.**

---

### 주요 DTO

#### ProductSearchResponse

```typescript
{
  productId: string // UUID
  productName: string
  productCategoryName: string
  price: number // Long
}
```

#### ExperienceSearchResponse

```typescript
{
  experienceId: string // UUID
  experienceName: string
  pricePerPerson: number // Long
  capacity: number // Integer
  durationMinutes: number // Integer
}
```

#### UnifiedSearchResponse

```typescript
{
  products: CustomPage<ProductSearchResponse>
  experiences: CustomPage<ExperienceSearchResponse>
}
```

#### UnifiedAutoCompleteResponse

```typescript
{
  products: Array<{
    productId: string
    productName: string
  }>
  experiences: Array<{
    experienceId: string
    experienceName: string
  }>
}
```

#### CustomPage<T>

```typescript
{
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
```

---

## 인증 및 헤더

### 사용자 ID 헤더

일부 API는 선택적으로 `X-User-Id` 헤더를 받습니다:

```typescript
headers: {
  'X-User-Id': '550e8400-e29b-41d4-a716-446655440000'  // UUID 형식
}
```

**용도:**

- 사용자 행동 로그 기록 (검색 실행 시)
- 개인화 추천을 위한 사용자 식별

**주의:**

- 로그인한 사용자: 실제 사용자 ID 전달
- 비로그인 사용자: 헤더 생략 가능 (로그 기록 안 됨)
- 자동완성은 로그 대상이 아님

---

## 에러 처리

### HTTP 상태 코드

- `200 OK`: 성공
- `400 Bad Request`: 잘못된 요청 (파라미터 오류 등)
- `404 Not Found`: 리소스를 찾을 수 없음
- `500 Internal Server Error`: 서버 오류

### 에러 응답 형식

```typescript
{
  success: false
  error: {
    code: string // 예: "INVALID_PARAMETER"
    message: string // 예: "검색어를 입력해주세요"
  }
}
```

---

## 프롬프트 작성 가이드

### 생성형 AI에게 전달할 프롬프트 구조

다음 템플릿을 사용하여 프론트엔드 컴포넌트 생성을 요청하세요:

```
당신은 React/TypeScript 프론트엔드 개발자입니다.
다음 API를 연동하는 검색 컴포넌트를 생성해주세요.

## 프로젝트 정보
- 프레임워크: [React / Next.js / Vue 등]
- 상태 관리: [Redux / Zustand / React Query 등]
- 스타일링: [Tailwind CSS / styled-components / CSS Modules 등]

## API 정보
- Base URL: http://localhost:8092
- API Prefix: /api/v1

## 구현할 기능
[구체적인 기능 설명]

## API 엔드포인트
[위의 API 문서에서 해당 엔드포인트 복사]

## 요구사항
1. TypeScript 타입 정의 포함
2. 에러 처리 포함
3. 로딩 상태 관리
4. 반응형 디자인
5. 접근성 고려

## 컴포넌트 구조
[원하는 컴포넌트 구조 설명]
```

---

### 예시 프롬프트 1: 통합 검색 컴포넌트

```
당신은 React/TypeScript 프론트엔드 개발자입니다.
통합 검색 기능을 구현하는 컴포넌트를 생성해주세요.

## 프로젝트 정보
- 프레임워크: React 18 + TypeScript
- 상태 관리: React Query
- 스타일링: Tailwind CSS
- HTTP 클라이언트: axios

## 구현할 기능
1. 검색어 입력 필드
2. 자동완성 드롭다운 (검색어 입력 시)
3. 검색 결과 표시 (상품 + 체험)
4. 페이지네이션
5. 로딩 상태 표시
6. 탭으로 상품/체험 전환

## API 엔드포인트

### 통합 자동완성
GET /api/v1/search/autocomplete?q={keyword}&pSize=5&eSize=5

Response:
{
  success: true;
  data: {
    products: Array<{ productId: string; productName: string; }>;
    experiences: Array<{ experienceId: string; experienceName: string; }>;
  };
}

### 통합 검색
GET /api/v1/search?q={keyword}&page={page}&size={size}

Headers:
- X-User-Id (optional): UUID

Response:
{
  success: true;
  data: {
    products: {
      content: Array<{
        productId: string;
        productName: string;
        productCategoryName: string;
        price: number;
      }>;
      totalElements: number;
      totalPages: number;
    };
    experiences: {
      content: Array<{
        experienceId: string;
        experienceName: string;
        pricePerPerson: number;
        capacity: number;
        durationMinutes: number;
      }>;
      totalElements: number;
      totalPages: number;
    };
  };
}

## 요구사항
1. TypeScript 타입 정의 포함
2. 디바운싱 적용 (자동완성 300ms)
3. 에러 처리 및 로딩 상태
4. 반응형 디자인 (모바일/데스크톱)
5. 접근성 (키보드 네비게이션, ARIA 레이블)
6. 검색 결과 클릭 시 상세 페이지로 이동
7. 상품/체험 탭으로 전환 가능
8. 페이지네이션 UI

## 컴포넌트 구조
- SearchPage.tsx: 메인 검색 페이지
- SearchInput.tsx: 검색 입력 필드
- AutocompleteDropdown.tsx: 자동완성 드롭다운
- SearchResults.tsx: 검색 결과 표시
- ProductCard.tsx: 상품 카드 컴포넌트
- ExperienceCard.tsx: 체험 카드 컴포넌트
- SearchTabs.tsx: 상품/체험 탭
```

---

### 예시 프롬프트 2: 상품 검색 컴포넌트 (필터링)

```
당신은 React/TypeScript 프론트엔드 개발자입니다.
필터링 기능이 있는 상품 검색 컴포넌트를 생성해주세요.

## 프로젝트 정보
- 프레임워크: React 18 + TypeScript
- 상태 관리: React Query
- 스타일링: Tailwind CSS
- HTTP 클라이언트: axios

## 구현할 기능
1. 검색어 입력
2. 카테고리 필터 (다중 선택)
3. 가격 범위 필터 (최소/최대)
4. 검색 결과 표시
5. 페이지네이션
6. 필터 초기화 버튼

## API 엔드포인트

### 상품 검색
GET /api/v1/search/product?keyword={keyword}&categories={categories}&priceMin={min}&priceMax={max}&page={page}&size={size}

Headers:
- X-User-Id (optional): UUID

Query Parameters:
- keyword (optional): string
- categories (optional): string[] - 배열로 여러 개 전송 가능
- priceMin (optional): number
- priceMax (optional): number
- page (optional, default: 0): number
- size (optional, default: 20): number

Response:
{
  content: Array<{
    productId: string;
    productName: string;
    productCategoryName: string;
    price: number;
  }>;
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

### 상품 자동완성
GET /api/v1/search/product/autocomplete?query={keyword}&size=5

Response:
Array<{
  productId: string;
  productName: string;
}>

## 요구사항
1. TypeScript 타입 정의 포함
2. 필터 상태 관리 (URL 쿼리 파라미터와 동기화)
3. 필터 변경 시 자동 검색 (디바운싱 500ms)
4. 로딩 스켈레톤 UI
5. 에러 처리
6. 반응형 디자인
7. 필터 사이드바 (모바일에서는 드로어)
8. 가격 범위 슬라이더 또는 입력 필드

## 컴포넌트 구조
- ProductSearchPage.tsx: 메인 상품 검색 페이지
- SearchBar.tsx: 검색 입력 및 자동완성
- FilterSidebar.tsx: 필터 사이드바
- CategoryFilter.tsx: 카테고리 필터
- PriceRangeFilter.tsx: 가격 범위 필터
- ProductGrid.tsx: 상품 그리드
- ProductCard.tsx: 상품 카드
- Pagination.tsx: 페이지네이션
```

---

## 추가 팁

### 1. API 클라이언트 설정

```typescript
// api/client.ts
import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:8092/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// 사용자 ID 헤더 추가 인터셉터
apiClient.interceptors.request.use((config) => {
  const userId = localStorage.getItem('userId')
  if (userId) {
    config.headers['X-User-Id'] = userId
  }
  return config
})

export default apiClient
```

### 2. TypeScript 타입 정의

```typescript
// types/search.ts

export interface ProductSearchResponse {
  productId: string
  productName: string
  productCategoryName: string
  price: number
}

export interface ExperienceSearchResponse {
  experienceId: string
  experienceName: string
  pricePerPerson: number
  capacity: number
  durationMinutes: number
}

export interface UnifiedSearchResponse {
  products: CustomPage<ProductSearchResponse>
  experiences: CustomPage<ExperienceSearchResponse>
}

export interface UnifiedAutoCompleteResponse {
  products: Array<{
    productId: string
    productName: string
  }>
  experiences: Array<{
    experienceId: string
    experienceName: string
  }>
}

export interface CustomPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}
```

### 3. React Query 훅 예시

```typescript
// hooks/useSearch.ts
import { useQuery } from '@tanstack/react-query'
import apiClient from '../api/client'
import { ApiResponse, UnifiedSearchResponse } from '../types/search'

export const useUnifiedSearch = (keyword: string, page: number = 0, size: number = 10) => {
  return useQuery({
    queryKey: ['unified-search', keyword, page, size],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<UnifiedSearchResponse>>('/search', {
        params: { q: keyword, page, size },
      })
      if (!data.success || !data.data) {
        throw new Error(data.error?.message || '검색 실패')
      }
      return data.data
    },
    enabled: !!keyword && keyword.length > 0,
  })
}

export const useUnifiedAutocomplete = (keyword: string) => {
  return useQuery({
    queryKey: ['unified-autocomplete', keyword],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<UnifiedAutoCompleteResponse>>(
        '/search/autocomplete',
        {
          params: { q: keyword, pSize: 5, eSize: 5 },
        }
      )
      if (!data.success || !data.data) {
        throw new Error(data.error?.message || '자동완성 실패')
      }
      return data.data
    },
    enabled: !!keyword && keyword.length > 0,
    staleTime: 30000, // 30초간 캐시 유지
  })
}
```

### 4. 디바운싱 예시

```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react'

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// 사용 예시
const SearchComponent = () => {
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, 300)
  const { data } = useUnifiedAutocomplete(debouncedKeyword)

  // ...
}
```

---

## Swagger UI

API 문서는 Swagger UI에서 확인할 수 있습니다:

- 로컬: `http://localhost:8092/swagger-ui.html`
- Docker: `http://ai-service:8092/swagger-ui.html`

---

## 다음 단계

검색 모듈 구현이 완료되면 다음 단계로 진행하세요:

- **STEP 02**: 추천 모듈 (Recommend) - `STEP_02_RECOMMEND_MODULE.md` 참고
