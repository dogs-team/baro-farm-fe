# 프론트엔드 개발 가이드 - STEP 02: 추천 모듈 (Recommend)

> 생성형 AI를 활용한 프론트엔드 개발을 위한 추천 API 연동 및 컴포넌트 생성 가이드

## 📋 목차

1. [모듈 개요](#모듈-개요)
2. [API 엔드포인트](#api-엔드포인트)
3. [DTO 구조](#dto-구조)
4. [인증 및 헤더](#인증-및-헤더)
5. [에러 처리](#에러-처리)
6. [프롬프트 작성 가이드](#프롬프트-작성-가이드)

---

## 모듈 개요

**추천 모듈 (Recommend)**은 다음과 같은 기능을 제공합니다:

- 🎯 **개인화 추천**: 사용자 행동 로그 기반 개인화된 상품 추천
- 🍳 **레시피 추천**: 장바구니 기반 레시피 및 부족한 재료 추천
- 🔗 **유사 상품 추천**: 특정 상품과 유사한 상품 추천

**Base URL**: `http://localhost:8092` (로컬) 또는 `http://ai-service:8092` (Docker)

**API Prefix**: `/api/v1`

**주의사항:**

- 개인화 추천은 사용자 프로필 벡터가 생성되어 있어야 작동합니다.
- 프로필 벡터는 사용자의 행동 로그(검색, 장바구니, 주문)가 충분히 쌓여야 생성됩니다.

---

## API 엔드포인트

### 1. 개인화 추천

#### 개인화 추천 상품 조회

```
GET /api/v1/recommendations/personalized/{userId}?topK={count}
```

**Path Parameters:**

- `userId` (required): UUID - 사용자 ID

**Query Parameters:**

- `topK` (optional, default: 5): number - 추천할 상품 개수

**Response:**

```typescript
Array<{
  productId: string // UUID
  productName: string
  productCategoryName: string
  price: number // Long
}>
```

**비고:**

- 사용자 프로필 벡터가 없으면 빈 배열 반환
- 이미 구매했거나 장바구니에 담은 상품은 추천에서 제외됨
- 사용자의 최근 30일간 행동 로그를 기반으로 추천

---

### 2. 레시피 추천

#### 사용자의 장바구니 기반 레시피 추천

```
GET /api/v1/recommendations/recipes/{userId}
```

**Path Parameters:**

- `userId` (required): UUID - 사용자 ID

**Response:**

```typescript
{
  recipeName: string;                    // 레시피 이름
  ownedIngredients: string[];            // 보유 중인 재료 목록
  missingCoreIngredients: string[];      // 부족한 핵심 재료 목록
  missingRecommendations: Array<{       // 부족한 재료별 상품 추천
    ingredientName: string;              // 재료 이름
    products: Array<{                    // 추천 상품 목록 (최대 2개)
      productId: string;
      productName: string;
      productCategoryName: string;
      price: number;
    }>;
  }>;
  instructions: string;                  // 레시피 조리법
}
```

**비고:**

- 사용자의 실제 장바구니를 기반으로 레시피 추천
- 장바구니가 비어있으면 추천 불가
- 부족한 재료에 대한 상품 추천도 함께 제공

---

#### 레시피 추천 (테스트용)

```
POST /api/v1/recommendations/recipes/test
```

**Request Body:**

```typescript
{
  cartId: string | null // UUID
  buyerId: string | null // UUID
  items: Array<{
    productId: string // UUID
    productName: string
    quantity: number // Integer
    unitPrice: number // Long
    inventoryId: string // UUID
  }>
  totalPrice: number // Long
  createdAt: string | null // ISO 8601
  updatedAt: string | null // ISO 8601
}
```

**Response:** (위와 동일)

**비고:**

- 테스트/개발용 API
- 실제 장바구니 없이 테스트할 수 있음

---

### 3. 유사 상품 추천

#### 특정 상품과 유사한 상품 추천

```
GET /api/v1/recommendations/similar/{productId}?topK={count}
```

**Path Parameters:**

- `productId` (required): UUID - 기준 상품 ID

**Query Parameters:**

- `topK` (optional, default: 3): number - 추천할 상품 개수

**Response:**

```typescript
Array<{
  productId: string
  productName: string
  productCategoryName: string
  price: number
}>
```

**비고:**

- 상품 상세 페이지에서 사용
- 상품의 임베딩 벡터를 기반으로 유사도가 높은 상품 추천
- 벡터 유사도 검색 사용

---

## DTO 구조

### 주요 DTO

#### ProductRecommendResponse

```typescript
{
  productId: string // UUID
  productName: string
  productCategoryName: string
  price: number // Long
}
```

#### RecipeRecommendResponse

```typescript
{
  recipeName: string;
  ownedIngredients: string[];
  missingCoreIngredients: string[];
  missingRecommendations: Array<{
    ingredientName: string;
    products: Array<ProductRecommendResponse>;  // 최대 2개
  }>;
  instructions: string;
}
```

#### IngredientRecommendResponse

```typescript
{
  ingredientName: string
  products: Array<ProductRecommendResponse> // 최대 2개
}
```

---

## 인증 및 헤더

### 사용자 ID

대부분의 추천 API는 Path Parameter로 `userId`를 받습니다:

```typescript
// 로그인한 사용자
const userId = localStorage.getItem('userId');

// API 호출
GET /api/v1/recommendations/personalized/${userId}
```

**주의:**

- 로그인한 사용자만 사용 가능
- 비로그인 사용자는 추천 기능 사용 불가

---

## 에러 처리

### HTTP 상태 코드

- `200 OK`: 성공
- `400 Bad Request`: 잘못된 요청
- `404 Not Found`: 리소스를 찾을 수 없음
- `500 Internal Server Error`: 서버 오류

### 주요 에러 코드

- `USER_PROFILE_NOT_FOUND`: 사용자 프로필 벡터를 찾을 수 없음 (개인화 추천)
- `PRODUCT_NOT_FOUND`: 기준 상품을 찾을 수 없음 (유사 상품 추천)
- `CART_NOT_FOUND`: 장바구니를 찾을 수 없음 (레시피 추천)
- `INVALID_TOP_K`: 추천할 상품 개수가 유효하지 않음
- `RECOMMENDATION_FAILED`: 추천 생성 실패
- `VECTOR_SEARCH_FAILED`: 벡터 유사도 검색 실패

### 에러 처리 예시

```typescript
// 개인화 추천이 비어있을 때
if (recommendations.length === 0) {
  // 프로필 벡터가 없거나 추천할 상품이 없음
  // 사용자에게 안내 메시지 표시
}
```

---

## 프롬프트 작성 가이드

### 예시 프롬프트 1: 개인화 추천 컴포넌트

```
당신은 React/TypeScript 프론트엔드 개발자입니다.
개인화 추천 상품 컴포넌트를 생성해주세요.

## 프로젝트 정보
- 프레임워크: React 18 + TypeScript
- 상태 관리: React Query
- 스타일링: Tailwind CSS
- HTTP 클라이언트: axios

## 구현할 기능
1. 사용자별 개인화 추천 상품 목록 표시
2. 로딩 스켈레톤 UI
3. 추천 상품이 없을 때 안내 메시지
4. 상품 클릭 시 상세 페이지로 이동
5. 새로고침 버튼 (선택사항)

## API 엔드포인트

### 개인화 추천
GET /api/v1/recommendations/personalized/{userId}?topK=5

Path Parameters:
- userId (required): UUID

Query Parameters:
- topK (optional, default: 5): number

Response:
Array<{
  productId: string;
  productName: string;
  productCategoryName: string;
  price: number;
}>

## 요구사항
1. TypeScript 타입 정의 포함
2. React Query로 데이터 페칭 및 캐싱
3. 로딩 스켈레톤 UI
4. 에러 처리 (에러 메시지 표시)
5. 반응형 그리드 레이아웃
6. 상품 카드 컴포넌트 재사용
7. 추천 상품이 없을 때 안내 메시지 표시
8. 가격 포맷팅 (천 단위 구분)

## 컴포넌트 구조
- PersonalizedRecommendation.tsx: 메인 개인화 추천 컴포넌트
- ProductCard.tsx: 재사용 가능한 상품 카드 컴포넌트
- RecommendationSkeleton.tsx: 로딩 스켈레톤
- EmptyRecommendation.tsx: 추천 상품 없을 때 표시
```

---

### 예시 프롬프트 2: 레시피 추천 컴포넌트

```
당신은 React/TypeScript 프론트엔드 개발자입니다.
장바구니 기반 레시피 추천 컴포넌트를 생성해주세요.

## 프로젝트 정보
- 프레임워크: React 18 + TypeScript
- 상태 관리: React Query
- 스타일링: Tailwind CSS
- HTTP 클라이언트: axios

## 구현할 기능
1. 레시피 정보 표시 (레시피명, 조리법)
2. 보유 재료 목록 표시
3. 부족한 재료 목록 표시
4. 부족한 재료별 상품 추천 표시
5. 상품 클릭 시 장바구니 추가 또는 상세 페이지 이동
6. 레시피 조리법 단계별 표시

## API 엔드포인트

### 레시피 추천
GET /api/v1/recommendations/recipes/{userId}

Path Parameters:
- userId (required): UUID

Response:
{
  recipeName: string;
  ownedIngredients: string[];
  missingCoreIngredients: string[];
  missingRecommendations: Array<{
    ingredientName: string;
    products: Array<{
      productId: string;
      productName: string;
      productCategoryName: string;
      price: number;
    }>;
  }>;
  instructions: string;
}

## 요구사항
1. TypeScript 타입 정의 포함
2. 레시피 조리법은 단계별로 표시 (줄바꿈 처리)
3. 보유/부족 재료를 시각적으로 구분 (체크박스, 배지 등)
4. 부족한 재료별 상품 추천을 아코디언 또는 탭으로 표시
5. 상품 카드에 가격, 카테고리 표시
6. 로딩 및 에러 상태 처리
7. 장바구니가 비어있을 때 안내 메시지
8. 반응형 디자인

## 컴포넌트 구조
- RecipeRecommendation.tsx: 메인 레시피 추천 컴포넌트
- RecipeInfo.tsx: 레시피 정보 표시
- IngredientsList.tsx: 재료 목록 표시
- OwnedIngredients.tsx: 보유 재료 표시
- MissingIngredients.tsx: 부족한 재료 표시
- MissingIngredientRecommendation.tsx: 부족한 재료별 상품 추천
- ProductCard.tsx: 상품 카드 컴포넌트
- RecipeInstructions.tsx: 레시피 조리법 표시
```

---

### 예시 프롬프트 3: 유사 상품 추천 컴포넌트

```
당신은 React/TypeScript 프론트엔드 개발자입니다.
상품 상세 페이지에 유사 상품 추천 컴포넌트를 생성해주세요.

## 프로젝트 정보
- 프레임워크: React 18 + TypeScript
- 상태 관리: React Query
- 스타일링: Tailwind CSS
- HTTP 클라이언트: axios

## 구현할 기능
1. 현재 상품과 유사한 상품 목록 표시
2. 로딩 스켈레톤 UI
3. 상품 클릭 시 해당 상품 상세 페이지로 이동
4. 가로 스크롤 또는 그리드 레이아웃

## API 엔드포인트

### 유사 상품 추천
GET /api/v1/recommendations/similar/{productId}?topK=3

Path Parameters:
- productId (required): UUID

Query Parameters:
- topK (optional, default: 3): number

Response:
Array<{
  productId: string;
  productName: string;
  productCategoryName: string;
  price: number;
}>

## 요구사항
1. TypeScript 타입 정의 포함
2. React Query로 데이터 페칭 및 캐싱
3. 로딩 스켈레톤 UI
4. 에러 처리
5. 가로 스크롤 또는 그리드 레이아웃
6. 상품 카드 컴포넌트 재사용
7. 반응형 디자인
8. "이런 상품은 어때요?" 같은 제목 표시

## 컴포넌트 구조
- SimilarProducts.tsx: 메인 유사 상품 추천 컴포넌트
- ProductCard.tsx: 재사용 가능한 상품 카드 컴포넌트
- ProductSkeleton.tsx: 로딩 스켈레톤
```

---

## 추가 팁

### 1. TypeScript 타입 정의

```typescript
// types/recommend.ts

export interface ProductRecommendResponse {
  productId: string
  productName: string
  productCategoryName: string
  price: number
}

export interface IngredientRecommendResponse {
  ingredientName: string
  products: ProductRecommendResponse[] // 최대 2개
}

export interface RecipeRecommendResponse {
  recipeName: string
  ownedIngredients: string[]
  missingCoreIngredients: string[]
  missingRecommendations: IngredientRecommendResponse[]
  instructions: string
}
```

### 2. React Query 훅 예시

```typescript
// hooks/useRecommendations.ts
import { useQuery } from '@tanstack/react-query'
import apiClient from '../api/client'
import { ProductRecommendResponse, RecipeRecommendResponse } from '../types/recommend'

export const usePersonalizedRecommendations = (userId: string, topK: number = 5) => {
  return useQuery({
    queryKey: ['personalized-recommendations', userId, topK],
    queryFn: async () => {
      const { data } = await apiClient.get<ProductRecommendResponse[]>(
        `/recommendations/personalized/${userId}`,
        { params: { topK } }
      )
      return data
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
  })
}

export const useRecipeRecommendation = (userId: string) => {
  return useQuery({
    queryKey: ['recipe-recommendation', userId],
    queryFn: async () => {
      const { data } = await apiClient.get<RecipeRecommendResponse>(
        `/recommendations/recipes/${userId}`
      )
      return data
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2분간 캐시 유지
  })
}

export const useSimilarProducts = (productId: string, topK: number = 3) => {
  return useQuery({
    queryKey: ['similar-products', productId, topK],
    queryFn: async () => {
      const { data } = await apiClient.get<ProductRecommendResponse[]>(
        `/recommendations/similar/${productId}`,
        { params: { topK } }
      )
      return data
    },
    enabled: !!productId,
    staleTime: 10 * 60 * 1000, // 10분간 캐시 유지
  })
}
```

### 3. 레시피 조리법 단계별 표시

```typescript
// components/RecipeInstructions.tsx
import React from 'react';

interface RecipeInstructionsProps {
  instructions: string;
}

export const RecipeInstructions: React.FC<RecipeInstructionsProps> = ({ instructions }) => {
  // 줄바꿈을 기준으로 단계 분리
  const steps = instructions
    .split('\n')
    .filter(step => step.trim().length > 0)
    .map(step => step.trim());

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">조리법</h3>
      <ol className="list-decimal list-inside space-y-2">
        {steps.map((step, index) => (
          <li key={index} className="text-gray-700">
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
};
```

### 4. 부족한 재료별 상품 추천 아코디언

```typescript
// components/MissingIngredientRecommendation.tsx
import React, { useState } from 'react';
import { IngredientRecommendResponse } from '../types/recommend';
import { ProductCard } from './ProductCard';

interface MissingIngredientRecommendationProps {
  recommendations: IngredientRecommendResponse[];
}

export const MissingIngredientRecommendation: React.FC<MissingIngredientRecommendationProps> = ({
  recommendations,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {recommendations.map((rec, index) => (
        <div key={index} className="border rounded-lg">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="font-medium">{rec.ingredientName}</span>
            <span>{openIndex === index ? '▼' : '▶'}</span>
          </button>
          {openIndex === index && (
            <div className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-4">
                {rec.products.map((product) => (
                  <ProductCard key={product.productId} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
```

---

## Swagger UI

API 문서는 Swagger UI에서 확인할 수 있습니다:

- 로컬: `http://localhost:8092/swagger-ui.html`
- Docker: `http://ai-service:8092/swagger-ui.html`

---

## 다음 단계

추천 모듈 구현이 완료되면 다음 단계로 진행하세요:

- **STEP 03**: 로그/임베딩 모듈 (참고용) - `STEP_03_LOG_EMBEDDING_MODULE.md` 참고
