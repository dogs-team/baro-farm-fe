# 프론트엔드 개발 가이드 - Buyer 서비스 API 연동

> 생성형 AI를 활용한 프론트엔드 개발을 위한 API 연동 및 컴포넌트 생성 가이드

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [API 엔드포인트](#api-엔드포인트)
   - [장바구니 (Cart)](#장바구니-cart)
   - [상품 (Product)](#상품-product)
   - [재고 (Inventory)](#재고-inventory)
3. [DTO 구조](#dto-구조)
4. [인증 및 헤더](#인증-및-헤더)
5. [에러 처리](#에러-처리)
6. [프롬프트 작성 가이드](#프롬프트-작성-가이드)

---

## 프로젝트 개요

**Buyer 서비스 (baro-buyer)**는 다음과 같은 기능을 제공합니다:

- 🛒 **장바구니 관리**: 로그인/비로그인 사용자 장바구니 관리
- 🛍️ **상품 조회**: 상품 상세 정보 및 목록 조회
- 📦 **카테고리 조회**: 상품 카테고리 계층 구조 조회
- 📊 **재고 관리**: 주문 관련 재고 예약/취소 (내부 API)

**Base URL**: `http://localhost:8082` (로컬) 또는 Gateway를 통해 `/buyer-service` 경로 사용

**API Prefix**: `/api/v1`

---

## API 엔드포인트

### 장바구니 (Cart)

#### 1. 장바구니 조회

```
GET /api/v1/carts
```

**Headers:**

- `X-User-Id` (optional): UUID - 로그인 사용자 ID
- `X-Session-Key` (optional): string - 비로그인 사용자 세션 키

**Response:**

```typescript
{
  success: boolean
  data: {
    cartId: string | null // UUID
    buyerId: string | null // UUID
    items: Array<{
      itemId: string // UUID
      productId: string // UUID
      productName: string
      productCategoryName: string
      quantity: number // Integer
      unitPrice: number // Long
      lineTotalPrice: number // Long
      inventoryId: string // UUID
      unit: number // Integer (재고 단위)
    }>
    totalPrice: number // Long
    createdAt: string | null // ISO 8601
    updatedAt: string | null // ISO 8601
  }
}
```

**비고:**

- 로그인 사용자: `X-User-Id` 헤더만 설정
- 비로그인 사용자: `X-Session-Key` 헤더만 설정
- 장바구니가 비어있으면 `items`는 빈 배열, `cartId`는 `null`

---

#### 2. 장바구니에 상품 추가

```
POST /api/v1/carts/items
```

**Headers:**

- `X-User-Id` (optional): UUID - 로그인 사용자 ID
- `X-Session-Key` (optional): string - 비로그인 사용자 세션 키

**Request Body:**

```typescript
{
  productId: string // UUID
  quantity: number // Integer
  unitPrice: number // Long
  inventoryId: string // UUID
}
```

**Response:**

```typescript
{
  success: boolean
  data: CartInfo // 위의 장바구니 조회 응답과 동일
}
```

**비고:**

- 같은 상품+옵션 조합이면 수량이 병합됨
- 장바구니가 없으면 자동 생성

---

#### 3. 장바구니 항목 수량 변경

```
PATCH /api/v1/carts/items/{itemId}/quantity
```

**Headers:**

- `X-User-Id` (optional): UUID
- `X-Session-Key` (optional): string

**Path Parameters:**

- `itemId` (required): UUID - 장바구니 항목 ID

**Request Body:**

```typescript
{
  quantity: number // Integer
}
```

**Response:**

```typescript
{
  success: boolean
  data: CartInfo
}
```

---

#### 4. 장바구니 항목 옵션 변경

```
PATCH /api/v1/carts/items/{itemId}/option
```

**Headers:**

- `X-User-Id` (optional): UUID
- `X-Session-Key` (optional): string

**Path Parameters:**

- `itemId` (required): UUID - 장바구니 항목 ID

**Request Body:**

```typescript
{
  inventoryId: string // UUID - 변경할 재고 옵션 ID
}
```

**Response:**

```typescript
{
  success: boolean
  data: CartInfo
}
```

---

#### 5. 장바구니 항목 삭제

```
DELETE /api/v1/carts/items/{itemId}
```

**Headers:**

- `X-User-Id` (optional): UUID
- `X-Session-Key` (optional): string

**Path Parameters:**

- `itemId` (required): UUID - 장바구니 항목 ID

**Response:**

```typescript
{
  success: boolean
  data: null
}
```

---

#### 6. 장바구니 비우기

```
DELETE /api/v1/carts
```

**Headers:**

- `X-User-Id` (optional): UUID
- `X-Session-Key` (optional): string

**Response:**

```typescript
{
  success: boolean
  data: null
}
```

---

#### 7. 장바구니 병합 (로그인 시)

```
POST /api/v1/carts/merge
```

**Headers:**

- `X-User-Id` (required): UUID - 로그인한 사용자 ID
- `X-Session-Key` (required): string - 비로그인 시 사용했던 세션 키

**Response:**

```typescript
{
  success: boolean
  data: CartInfo
}
```

**비고:**

- 비로그인 상태에서 장바구니에 담은 후 로그인할 때 호출
- 비로그인 장바구니의 항목들이 로그인 사용자 장바구니로 병합됨

---

### 상품 (Product)

#### 1. 상품 상세 조회

```
GET /api/v1/products/{id}
```

**Path Parameters:**

- `id` (required): UUID - 상품 ID

**Response:**

```typescript
{
  success: boolean;
  data: {
    id: string;                      // UUID
    sellerId: string;                 // UUID
    productName: string;
    description: string;
    categoryId: string | null;        // UUID
    categoryCode: string | null;
    categoryName: string | null;
    price: number;                    // Long
    stockQuantity: number;             // Integer
    productStatus: string;             // "ACTIVE" | "INACTIVE" | "SOLD_OUT" | "DELETED"
    createdAt: string;                // ISO 8601
    updatedAt: string;                // ISO 8601
    imageUrls: string[];               // 이미지 URL 배열
    positiveReviewSummary: string[];  // 긍정 리뷰 요약
    negativeReviewSummary: string[];  // 부정 리뷰 요약
  };
}
```

---

#### 2. 상품 목록 조회 (페이징)

```
GET /api/v1/products?page={page}&size={size}
```

**Query Parameters:**

- `page` (optional, default: 0): number - 페이지 번호 (0부터 시작)
- `size` (optional, default: 20): number - 페이지 크기

**Response:**

```typescript
{
  success: boolean
  data: {
    content: Array<ProductDetailInfo> // 위의 상품 상세 정보 배열
    totalElements: number
    totalPages: number
    page: number
    size: number
  }
}
```

---

#### 3. 상품 생성 (관리자/판매자용)

```
POST /api/v1/products
```

**Headers:**

- `X-User-Id` (required): UUID - 사용자 ID
- `X-User-Role` (required): string - 사용자 역할 ("SELLER" | "ADMIN")

**Request Body:**

```typescript
{
  productName: string;
  description: string;
  categoryId: string;      // UUID
  price: number;           // Long
  stockQuantity: number;   // Integer
  imageUrls: string[];     // 이미지 URL 배열
}
```

**Response:**

```typescript
{
  success: boolean
  data: ProductDetailInfo // 위의 상품 상세 정보
}
```

---

#### 4. 상품 수정 (관리자/판매자용)

```
PATCH /api/v1/products/{id}
```

**Headers:**

- `X-User-Id` (required): UUID
- `X-User-Role` (required): string

**Path Parameters:**

- `id` (required): UUID - 상품 ID

**Request Body:**

```typescript
{
  productName?: string;
  description?: string;
  categoryId?: string;      // UUID
  price?: number;           // Long
  stockQuantity?: number;   // Integer
  imageUrls?: string[];     // 이미지 URL 배열
}
```

**Response:**

```typescript
{
  success: boolean
  data: ProductDetailInfo
}
```

---

#### 5. 상품 삭제 (관리자/판매자용)

```
DELETE /api/v1/products/{id}
```

**Headers:**

- `X-User-Id` (required): UUID
- `X-User-Role` (required): string

**Path Parameters:**

- `id` (required): UUID - 상품 ID

**Response:**

```typescript
{
  success: boolean
  data: null
}
```

---

#### 6. 카테고리 목록 조회

```
GET /api/v1/categories?parentId={parentId}
```

**Query Parameters:**

- `parentId` (optional): UUID - 부모 카테고리 ID
  - 없으면: 1차 카테고리 목록 조회
  - 있으면: 해당 카테고리의 하위 카테고리 목록 조회

**Response:**

```typescript
{
  success: boolean
  data: Array<{
    id: string // UUID
    name: string
    code: string
    parentId: string | null // UUID
    level: number // Integer (1차, 2차, 3차 등)
    sortOrder: number // Integer
  }>
}
```

---

### 재고 (Inventory)

> ⚠️ **주의**: 재고 API는 내부 서비스 간 통신용입니다. 프론트엔드에서 직접 호출하지 않습니다.
> 주문 서비스에서 주문 생성 시 자동으로 호출됩니다.

#### 1. 재고 예약 (내부 API)

```
POST /internal/inventories/reserve
```

**Request Body:**

```typescript
{
  orderId: string // UUID
  items: Array<{
    productId: string // UUID
    inventoryId: string // UUID
    quantity: number // Long
  }>
}
```

---

#### 2. 재고 취소 (내부 API)

```
POST /internal/inventories/cancel
```

**Request Body:**

```typescript
{
  orderId: string // UUID
  items: Array<{
    productId: string // UUID
    inventoryId: string // UUID
    quantity: number // Long
  }>
}
```

---

## DTO 구조

### 공통 응답 형식

모든 API는 다음 형식으로 응답합니다:

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

### 주요 DTO

#### CartInfo

```typescript
{
  cartId: string | null;
  buyerId: string | null;
  items: CartItemInfo[];
  totalPrice: number;  // Long
  createdAt: string | null;
  updatedAt: string | null;
}
```

#### CartItemInfo

```typescript
{
  itemId: string // UUID
  productId: string // UUID
  productName: string
  productCategoryName: string
  quantity: number // Integer
  unitPrice: number // Long
  lineTotalPrice: number // Long
  inventoryId: string // UUID
  unit: number // Integer
}
```

#### ProductDetailInfo

```typescript
{
  id: string;                      // UUID
  sellerId: string;                 // UUID
  productName: string;
  description: string;
  categoryId: string | null;        // UUID
  categoryCode: string | null;
  categoryName: string | null;
  price: number;                    // Long
  stockQuantity: number;             // Integer
  productStatus: "ACTIVE" | "INACTIVE" | "SOLD_OUT" | "DELETED";
  createdAt: string;                // ISO 8601
  updatedAt: string;                // ISO 8601
  imageUrls: string[];
  positiveReviewSummary: string[];
  negativeReviewSummary: string[];
}
```

#### CategoryListItem

```typescript
{
  id: string // UUID
  name: string
  code: string
  parentId: string | null // UUID
  level: number // Integer
  sortOrder: number // Integer
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

### 사용자 인증 헤더

#### 로그인 사용자

```typescript
headers: {
  'X-User-Id': '550e8400-e29b-41d4-a716-446655440000',  // UUID 형식
  'Authorization': 'Bearer {jwt-token}'  // Gateway 인증용
}
```

#### 비로그인 사용자

```typescript
headers: {
  'X-Session-Key': 'session-key-string',  // 세션 키 (로컬스토리지 등에 저장)
  'Authorization': 'Bearer {jwt-token}'  // Gateway 인증용 (선택적)
}
```

### 관리자/판매자 전용 API

```typescript
headers: {
  'X-User-Id': '550e8400-e29b-41d4-a716-446655440000',
  'X-User-Role': 'SELLER' | 'ADMIN',
  'Authorization': 'Bearer {jwt-token}'
}
```

### 세션 키 관리

비로그인 사용자의 경우:

1. 첫 방문 시 세션 키 생성 (UUID 또는 랜덤 문자열)
2. 로컬스토리지에 저장: `localStorage.setItem('sessionKey', sessionKey)`
3. 모든 장바구니 API 호출 시 `X-Session-Key` 헤더에 포함
4. 로그인 시 `POST /api/v1/carts/merge` 호출하여 장바구니 병합

---

## 에러 처리

### HTTP 상태 코드

- `200 OK`: 성공
- `400 Bad Request`: 잘못된 요청 (파라미터 오류 등)
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스를 찾을 수 없음
- `500 Internal Server Error`: 서버 오류

### 에러 응답 형식

```typescript
{
  success: false
  error: {
    code: string // 예: "CART_NOT_FOUND", "PRODUCT_NOT_FOUND"
    message: string // 예: "장바구니를 찾을 수 없습니다"
  }
}
```

### 주요 에러 코드

#### 장바구니 관련

- `CART_NOT_FOUND`: 장바구니를 찾을 수 없음
- `CART_ITEM_NOT_FOUND`: 장바구니 항목을 찾을 수 없음
- `INVALID_QUANTITY`: 잘못된 수량

#### 상품 관련

- `PRODUCT_NOT_FOUND`: 상품을 찾을 수 없음
- `PRODUCT_ALREADY_DELETED`: 이미 삭제된 상품
- `INSUFFICIENT_STOCK`: 재고 부족

#### 권한 관련

- `UNAUTHORIZED`: 인증되지 않음
- `FORBIDDEN`: 권한 없음
- `INVALID_ROLE`: 잘못된 역할

---

## 프롬프트 작성 가이드

### 생성형 AI에게 전달할 프롬프트 구조

다음 템플릿을 사용하여 프론트엔드 컴포넌트 생성을 요청하세요:

```
당신은 React/TypeScript 프론트엔드 개발자입니다.
다음 API를 연동하는 컴포넌트를 생성해주세요.

## 프로젝트 정보
- 프레임워크: [React / Next.js / Vue 등]
- 상태 관리: [Redux / Zustand / React Query 등]
- 스타일링: [Tailwind CSS / styled-components / CSS Modules 등]

## API 정보
- Base URL: http://localhost:8082
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

### 예시 프롬프트 1: 장바구니 컴포넌트

```
당신은 React/TypeScript 프론트엔드 개발자입니다.
장바구니 기능을 구현하는 컴포넌트를 생성해주세요.

## 프로젝트 정보
- 프레임워크: React 18 + TypeScript
- 상태 관리: React Query
- 스타일링: Tailwind CSS
- HTTP 클라이언트: axios

## 구현할 기능
1. 장바구니 조회 및 표시
2. 장바구니 항목 수량 변경 (증가/감소 버튼)
3. 장바구니 항목 삭제
4. 장바구니 비우기
5. 로그인/비로그인 사용자 모두 지원
6. 로그인 시 장바구니 병합

## API 엔드포인트

### 장바구니 조회
GET /api/v1/carts

Headers:
- X-User-Id (optional): UUID - 로그인 사용자 ID
- X-Session-Key (optional): string - 비로그인 사용자 세션 키

Response:
{
  success: boolean;
  data: {
    cartId: string | null;
    buyerId: string | null;
    items: Array<{
      itemId: string;
      productId: string;
      productName: string;
      productCategoryName: string;
      quantity: number;
      unitPrice: number;
      lineTotalPrice: number;
      inventoryId: string;
      unit: number;
    }>;
    totalPrice: number;
    createdAt: string | null;
    updatedAt: string | null;
  };
}

### 수량 변경
PATCH /api/v1/carts/items/{itemId}/quantity

Headers:
- X-User-Id (optional): UUID
- X-Session-Key (optional): string

Request Body:
{
  quantity: number;
}

### 항목 삭제
DELETE /api/v1/carts/items/{itemId}

Headers:
- X-User-Id (optional): UUID
- X-Session-Key (optional): string

### 장바구니 비우기
DELETE /api/v1/carts

Headers:
- X-User-Id (optional): UUID
- X-Session-Key (optional): string

### 장바구니 병합 (로그인 시)
POST /api/v1/carts/merge

Headers:
- X-User-Id (required): UUID
- X-Session-Key (required): string

## 요구사항
1. TypeScript 타입 정의 포함
2. React Query로 데이터 페칭 및 캐싱
3. 낙관적 업데이트 (Optimistic Update) 적용
4. 로딩 스켈레톤 UI
5. 에러 처리 (에러 메시지 표시)
6. 반응형 디자인 (모바일/데스크톱)
7. 접근성 (키보드 네비게이션, ARIA 레이블)
8. 수량 변경 시 즉시 UI 업데이트
9. 장바구니가 비어있을 때 빈 상태 표시
10. 총 금액 표시 및 포맷팅 (천 단위 구분)

## 컴포넌트 구조
- CartPage.tsx: 메인 장바구니 페이지
- CartItemList.tsx: 장바구니 항목 목록
- CartItem.tsx: 개별 장바구니 항목 컴포넌트
- QuantityControl.tsx: 수량 증가/감소 컨트롤
- CartSummary.tsx: 장바구니 요약 (총 금액 등)
- EmptyCart.tsx: 빈 장바구니 상태 컴포넌트
```

---

### 예시 프롬프트 2: 상품 상세 페이지

```
당신은 React/TypeScript 프론트엔드 개발자입니다.
상품 상세 페이지를 구현하는 컴포넌트를 생성해주세요.

## 프로젝트 정보
- 프레임워크: React 18 + TypeScript
- 상태 관리: React Query
- 스타일링: Tailwind CSS
- HTTP 클라이언트: axios
- 라우팅: React Router

## 구현할 기능
1. 상품 상세 정보 표시
2. 상품 이미지 갤러리 (캐러셀 또는 그리드)
3. 장바구니에 추가 기능
4. 옵션 선택 (재고 단위 선택)
5. 수량 선택
6. 리뷰 요약 표시 (긍정/부정)
7. 로딩 및 에러 상태 처리

## API 엔드포인트

### 상품 상세 조회
GET /api/v1/products/{id}

Response:
{
  success: boolean;
  data: {
    id: string;
    sellerId: string;
    productName: string;
    description: string;
    categoryId: string | null;
    categoryCode: string | null;
    categoryName: string | null;
    price: number;
    stockQuantity: number;
    productStatus: "ACTIVE" | "INACTIVE" | "SOLD_OUT" | "DELETED";
    createdAt: string;
    updatedAt: string;
    imageUrls: string[];
    positiveReviewSummary: string[];
    negativeReviewSummary: string[];
  };
}

### 장바구니에 추가
POST /api/v1/carts/items

Headers:
- X-User-Id (optional): UUID
- X-Session-Key (optional): string

Request Body:
{
  productId: string;
  quantity: number;
  unitPrice: number;
  inventoryId: string;
}

## 요구사항
1. TypeScript 타입 정의 포함
2. React Query로 데이터 페칭
3. 이미지 갤러리 (캐러셀 또는 그리드 레이아웃)
4. 옵션 선택 UI (재고 단위 선택)
5. 수량 선택 UI (증가/감소 버튼)
6. 장바구니 추가 시 로딩 상태 및 성공/실패 피드백
7. 상품 상태에 따른 UI 표시 (품절, 비활성화 등)
8. 반응형 디자인
9. 접근성 고려
10. 가격 포맷팅 (천 단위 구분)
11. 리뷰 요약을 아코디언 또는 탭으로 표시

## 컴포넌트 구조
- ProductDetailPage.tsx: 메인 상품 상세 페이지
- ProductImageGallery.tsx: 상품 이미지 갤러리
- ProductInfo.tsx: 상품 기본 정보
- ProductOptions.tsx: 옵션 선택 컴포넌트
- QuantitySelector.tsx: 수량 선택 컴포넌트
- AddToCartButton.tsx: 장바구니 추가 버튼
- ReviewSummary.tsx: 리뷰 요약 컴포넌트
```

---

### 예시 프롬프트 3: 상품 목록 페이지

```
당신은 React/TypeScript 프론트엔드 개발자입니다.
상품 목록 페이지를 구현하는 컴포넌트를 생성해주세요.

## 프로젝트 정보
- 프레임워크: React 18 + TypeScript
- 상태 관리: React Query
- 스타일링: Tailwind CSS
- HTTP 클라이언트: axios
- 라우팅: React Router

## 구현할 기능
1. 상품 목록 조회 (페이징)
2. 상품 카드 그리드 레이아웃
3. 페이지네이션
4. 무한 스크롤 (선택사항)
5. 로딩 스켈레톤 UI
6. 상품 클릭 시 상세 페이지로 이동

## API 엔드포인트

### 상품 목록 조회
GET /api/v1/products?page={page}&size={size}

Query Parameters:
- page (optional, default: 0): number
- size (optional, default: 20): number

Response:
{
  success: boolean;
  data: {
    content: Array<{
      id: string;
      sellerId: string;
      productName: string;
      description: string;
      categoryId: string | null;
      categoryCode: string | null;
      categoryName: string | null;
      price: number;
      stockQuantity: number;
      productStatus: "ACTIVE" | "INACTIVE" | "SOLD_OUT" | "DELETED";
      createdAt: string;
      updatedAt: string;
      imageUrls: string[];
      positiveReviewSummary: string[];
      negativeReviewSummary: string[];
    }>;
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
  };
}

## 요구사항
1. TypeScript 타입 정의 포함
2. React Query로 데이터 페칭 및 캐싱
3. 페이지네이션 UI (이전/다음, 페이지 번호)
4. 로딩 스켈레톤 UI
5. 에러 처리
6. 반응형 그리드 레이아웃 (모바일: 1열, 태블릿: 2열, 데스크톱: 3-4열)
7. 상품 카드에 이미지, 이름, 가격, 상태 표시
8. 상품 상태에 따른 배지 표시 (품절, 비활성화 등)
9. 가격 포맷팅
10. 이미지 로딩 실패 시 플레이스홀더 표시

## 컴포넌트 구조
- ProductListPage.tsx: 메인 상품 목록 페이지
- ProductGrid.tsx: 상품 그리드 레이아웃
- ProductCard.tsx: 개별 상품 카드 컴포넌트
- Pagination.tsx: 페이지네이션 컴포넌트
- ProductSkeleton.tsx: 로딩 스켈레톤 컴포넌트
```

---

### 예시 프롬프트 4: 카테고리 네비게이션

```
당신은 React/TypeScript 프론트엔드 개발자입니다.
카테고리 네비게이션 컴포넌트를 생성해주세요.

## 프로젝트 정보
- 프레임워크: React 18 + TypeScript
- 상태 관리: React Query
- 스타일링: Tailwind CSS
- HTTP 클라이언트: axios

## 구현할 기능
1. 1차 카테고리 목록 조회
2. 선택한 카테고리의 하위 카테고리 조회
3. 계층형 카테고리 네비게이션 (드롭다운 또는 사이드바)
4. 카테고리 선택 시 상품 필터링 (선택사항)

## API 엔드포인트

### 카테고리 목록 조회
GET /api/v1/categories?parentId={parentId}

Query Parameters:
- parentId (optional): UUID
  - 없으면: 1차 카테고리 목록
  - 있으면: 해당 카테고리의 하위 카테고리 목록

Response:
{
  success: boolean;
  data: Array<{
    id: string;
    name: string;
    code: string;
    parentId: string | null;
    level: number;
    sortOrder: number;
  }>;
}

## 요구사항
1. TypeScript 타입 정의 포함
2. React Query로 데이터 페칭 및 캐싱
3. 계층형 구조 표시 (1차 → 2차 → 3차)
4. 드롭다운 또는 사이드바 UI
5. 호버/클릭 시 하위 카테고리 표시
6. 반응형 디자인
7. 접근성 (키보드 네비게이션)
8. 로딩 상태 처리

## 컴포넌트 구조
- CategoryNavigation.tsx: 메인 카테고리 네비게이션
- CategoryMenu.tsx: 카테고리 메뉴 (드롭다운)
- CategoryItem.tsx: 개별 카테고리 항목
- CategoryDropdown.tsx: 하위 카테고리 드롭다운
```

---

## 추가 팁

### 1. API 클라이언트 설정

```typescript
// api/client.ts
import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:8082/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// 사용자 ID 및 세션 키 헤더 추가 인터셉터
apiClient.interceptors.request.use((config) => {
  const userId = localStorage.getItem('userId')
  const sessionKey = localStorage.getItem('sessionKey')

  if (userId) {
    config.headers['X-User-Id'] = userId
  } else if (sessionKey) {
    config.headers['X-Session-Key'] = sessionKey
  }

  return config
})

export default apiClient
```

### 2. TypeScript 타입 정의

```typescript
// types/api.ts

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

export interface CartInfo {
  cartId: string | null
  buyerId: string | null
  items: CartItemInfo[]
  totalPrice: number
  createdAt: string | null
  updatedAt: string | null
}

export interface CartItemInfo {
  itemId: string
  productId: string
  productName: string
  productCategoryName: string
  quantity: number
  unitPrice: number
  lineTotalPrice: number
  inventoryId: string
  unit: number
}

export interface ProductDetailInfo {
  id: string
  sellerId: string
  productName: string
  description: string
  categoryId: string | null
  categoryCode: string | null
  categoryName: string | null
  price: number
  stockQuantity: number
  productStatus: 'ACTIVE' | 'INACTIVE' | 'SOLD_OUT' | 'DELETED'
  createdAt: string
  updatedAt: string
  imageUrls: string[]
  positiveReviewSummary: string[]
  negativeReviewSummary: string[]
}

export interface CategoryListItem {
  id: string
  name: string
  code: string
  parentId: string | null
  level: number
  sortOrder: number
}

export interface CustomPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}
```

### 3. React Query 훅 예시

```typescript
// hooks/useCart.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/client'
import { ApiResponse, CartInfo } from '../types/api'

export const useCart = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<CartInfo>>('/carts')
      if (!data.success || !data.data) {
        throw new Error(data.error?.message || '장바구니 조회 실패')
      }
      return data.data
    },
  })
}

export const useAddToCart = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (item: {
      productId: string
      quantity: number
      unitPrice: number
      inventoryId: string
    }) => {
      const { data } = await apiClient.post<ApiResponse<CartInfo>>('/carts/items', item)
      if (!data.success || !data.data) {
        throw new Error(data.error?.message || '장바구니 추가 실패')
      }
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}

export const useUpdateCartQuantity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const { data } = await apiClient.patch<ApiResponse<CartInfo>>(
        `/carts/items/${itemId}/quantity`,
        { quantity }
      )
      if (!data.success || !data.data) {
        throw new Error(data.error?.message || '수량 변경 실패')
      }
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}
```

### 4. 세션 키 관리

```typescript
// utils/session.ts

export const getOrCreateSessionKey = (): string => {
  let sessionKey = localStorage.getItem('sessionKey')

  if (!sessionKey) {
    sessionKey = crypto.randomUUID() // 또는 다른 랜덤 문자열 생성 방법
    localStorage.setItem('sessionKey', sessionKey)
  }

  return sessionKey
}

export const clearSessionKey = (): void => {
  localStorage.removeItem('sessionKey')
}
```

### 5. 장바구니 병합 (로그인 시)

```typescript
// hooks/useCartMerge.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../api/client'
import { ApiResponse, CartInfo } from '../types/api'
import { getOrCreateSessionKey } from '../utils/session'

export const useCartMerge = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      const sessionKey = getOrCreateSessionKey()

      const { data } = await apiClient.post<ApiResponse<CartInfo>>(
        '/carts/merge',
        {},
        {
          headers: {
            'X-User-Id': userId,
            'X-Session-Key': sessionKey,
          },
        }
      )

      if (!data.success || !data.data) {
        throw new Error(data.error?.message || '장바구니 병합 실패')
      }

      // 병합 후 세션 키 제거 (선택사항)
      localStorage.removeItem('sessionKey')

      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
}
```

---

## Swagger UI

API 문서는 Swagger UI에서 확인할 수 있습니다:

- 로컬: `http://localhost:8082/swagger-ui.html`
- Docker: `http://buyer-service:8082/swagger-ui.html`

---

## 문의 및 지원

프론트엔드 개발 중 문제가 발생하면 백엔드 팀에 문의하세요.
