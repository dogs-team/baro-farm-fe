# E2E Playwright Guide

## 1. 목적
- 브라우저 기준 실제 사용자 경로 검증
- 특히 토스 결제창 -> 복귀(success/fail) -> 서버 confirm 흐름 확인

## 2. 범위(P0)
- `E2E-ORD-PAY-001` 토스 결제 성공
- `E2E-ORD-PAY-002` 토스 결제 실패/취소
- `E2E-CART-ORD-001` 장바구니 주문
- `E2E-DEP-ORD-001` 예치금 결제 성공
- `E2E-DEP-ORD-002` 예치금 부족
- `E2E-AUTH-CHK-001` 비인증 접근

## 3. 실행 환경
- APP: 기본 `http://localhost:3000`
- API: 기본 local gateway endpoint
- 비고: staging이 없는 경우 local 검증 후 prod(dev 성격) 반영
- 테스트 계정:
  - `e2e_user_ok` (예치금 충분)
  - `e2e_user_low` (예치금 부족)

## 4. 권장 태깅
- `@p0 @payment @toss`
- `@p0 @deposit`
- `@auth`

## 5. 구현 포인트
- 결제창은 외부 도메인이므로, 테스트를 2층으로 나눈다.
  - Layer A: 프론트 라우팅/파라미터/confirm 호출 검증 (`/order/success?paymentKey=...`)
  - Layer B: 실제 토스 UI 클릭 검증 (local/nightly)
- flaky 방지:
  - 네트워크 대기 조건을 명시(`waitForResponse`)
  - 토스트 문구 대신 URL + 핵심 텍스트를 1차 assertion으로 사용

## 6. 기본 체크리스트
- 주문 전:
  - 사용자 로그인 상태
  - 장바구니/바로구매 데이터 존재
- 결제 중:
  - 요청 payload에 orderId/amount/orderName 존재
  - successUrl/failUrl 정확
- 결제 후:
  - 성공: `/order/success` + 주문번호
  - 실패: `/order/fail` 또는 성공 페이지 내 confirm 실패 메시지

## 7. 실패 시 triage 순서
1. FE-INT 케이스로 재현되는지 확인
2. API 로그에서 confirm/createOrder 실패 지점 확인
3. DB에서 주문/결제 상태 수렴 확인
4. outbox/event 지연 여부 확인
