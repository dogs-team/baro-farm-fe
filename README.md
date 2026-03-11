# 바로팜 Frontend

[English README](./README_ENG.md)

바로팜은 농산물 직거래를 위한 Next.js 기반 프론트엔드입니다.  
상품 탐색, 검색, 장바구니, 결제, 주문 조회, 카카오 로그인, 판매자 신청, 판매자 대시보드, 관리자 사용자 조회 기능을 제공합니다.

## 주요 기능

- 상품 목록 및 상품 상세
- 검색 및 위시리스트
- 장바구니 및 결제
- 주문 내역 및 주문 상세
- 카카오 OAuth 로그인
- Toss Payments 연동
- 마이페이지 및 알림
- 판매자 신청 및 판매자 대시보드
- 관리자 사용자 조회

## 기술 스택

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand
- React Hook Form
- Zod
- pnpm

## 시작하기

### 실행 환경

- Node.js 20 이상
- pnpm 10 이상

### 설치

```bash
pnpm install
```

### 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 `http://localhost:3000` 을 열면 됩니다.

### 프로덕션 빌드

```bash
pnpm build
pnpm start
```

## 사용 가능한 스크립트

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
pnpm typecheck
```

## 환경 변수

프로젝트 루트에 `.env.local` 파일을 생성해 설정합니다.

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080

# 선택: 서비스별 URL 직접 지정
NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:8080/user-service
NEXT_PUBLIC_BUYER_SERVICE_URL=http://localhost:8080/buyer-service
NEXT_PUBLIC_ORDER_SERVICE_URL=http://localhost:8080/order-service
NEXT_PUBLIC_PAYMENT_SERVICE_URL=http://localhost:8080/payment-service
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8080/ai-service

NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_client_id
NEXT_PUBLIC_TOSS_CLIENT_KEY=your_toss_client_key
NEXT_PUBLIC_IMAGE_BASE_URL=/uploads
```

### 환경 변수 설명

- `NEXT_PUBLIC_API_BASE_URL`: 프론트엔드 공개 주소
- `NEXT_PUBLIC_API_GATEWAY_URL`: 백엔드 게이트웨이 주소
- `NEXT_PUBLIC_KAKAO_CLIENT_ID`: 카카오 로그인 Client ID
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`: Toss Payments 클라이언트 키
- 서비스별 URL 변수는 필요할 때 게이트웨이 기본값을 덮어쓰는 용도입니다

## 프로젝트 구조

```text
app/           Next.js App Router 페이지 및 Route Handler
components/    공통 UI 및 기능 컴포넌트
hooks/         커스텀 React 훅
lib/           API 클라이언트, 서비스, 스토어, 유틸리티
public/        정적 파일
scripts/       저장소에 포함된 보조 스크립트
```

## 주요 라우트

| 경로 | 설명 |
| --- | --- |
| `/` | 메인 페이지 |
| `/products` | 상품 목록 |
| `/products/[id]` | 상품 상세 |
| `/search` | 검색 |
| `/cart` | 장바구니 |
| `/checkout` | 결제 |
| `/orders` | 주문 내역 |
| `/order/[id]` | 주문 상세 |
| `/login` | 로그인 |
| `/signup` | 회원가입 |
| `/oauth/kakao/callback` | 카카오 OAuth 콜백 |
| `/profile` | 마이페이지 |
| `/dashboard` | 판매자 대시보드 진입 |
| `/seller/products` | 판매자 상품 관리 |
| `/seller/orders` | 판매자 주문 관리 |
| `/seller/reviews` | 판매자 리뷰 관리 |
| `/seller/settlement` | 판매자 정산 |
| `/admin/users` | 관리자 사용자 조회 |

## 배포

현재 배포 기준은 Vercel입니다.

### Vercel 설정

1. GitHub 저장소를 Vercel에 Import 합니다.
2. Framework Preset은 `Next.js` 를 사용합니다.
3. 필요 시 Install Command를 `pnpm install --frozen-lockfile` 로 설정합니다.
4. 필요 시 Build Command를 `pnpm build` 로 설정합니다.
5. Vercel Project Settings에 환경 변수를 등록합니다.

### 권장 Vercel 환경 변수

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_API_GATEWAY_URL`
- `NEXT_PUBLIC_KAKAO_CLIENT_ID`
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`
- 필요 시 서비스별 API URL

## API 연동 구조

프론트엔드는 `lib/api/services` 아래의 서비스 모듈을 통해 백엔드와 통신합니다.

- `user-service`: 인증, OAuth, 판매자 신청
- `buyer-service`: 상품, 장바구니 등 구매자 영역
- `order-service`: 주문 관련 기능
- `payment-service`: 결제 관련 기능
- `ai-service`: 챗봇 및 AI 관련 기능
- `support-service`: 알림, 리뷰, 정산, 지원 기능

## 참고

- 현재 공개 서비스 범위는 농산물 커머스 중심입니다.
- 체험 예약은 현재 활성 서비스 플로우에 포함되어 있지 않습니다.
- 저장소 내부에 과거 기능 흔적이나 정적 리소스가 일부 남아 있을 수 있으며, 필요 시 별도 정리할 수 있습니다.

## 라이선스

별도 라이선스 파일이 없다면 저장소 정책을 따릅니다.
