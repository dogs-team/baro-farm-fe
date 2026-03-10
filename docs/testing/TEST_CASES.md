# Test Cases (P0)

## 공통 컬럼
- Scenario ID
- Level (BE-INT/FE-INT/E2E)
- Priority
- Precondition
- Steps (Given/When/Then)
- Assertions (UI/API/DB/Event)
- Automation
- Owner

## Priority 해석
- P0: PR/배포 게이트 대상
- P1: 야간 배치 우선 대상
- P2: 회귀 모니터링 대상

## 라우트 정합성 메모
- 현재 프론트 기준 리뷰 화면은 별도 라우트 `/products/[id]/reviews`가 아니라 상품 상세(`/products/[id]`) 내부 섹션/탭 기반으로 본다.

## 시나리오 카탈로그

### ORD-PAY-001 주문 생성 후 토스 결제 성공
- Level: BE-INT
- Case ID: BE-INT-ORD-PAY-001
- Priority: P0
- Precondition: 테스트 사용자/상품/재고 준비, 토스 테스트 paymentKey
- Given: 유효한 주문 항목과 배송정보
- When: `POST /api/v1/orders` 후 `POST /api/v1/payments/toss/confirm`
- Then:
  - API: 200/성공 응답
  - DB: `orders.status=CONFIRMED`, `payment.status=CONFIRMED`
  - DB: `inventory.quantity` 감소, 예약수량 정리
  - Event: outbox 성공 또는 재시도 후 성공
- Automation: 백 통합 테스트
- Owner: BE

- Level: FE-INT
- Case ID: FE-INT-ORD-PAY-001
- Priority: P0
- Precondition: 프론트에서 주문 폼 입력 가능 상태
- Given: checkout 진입, 결제수단 toss 선택
- When: 주문 생성 API 성공 응답 수신 후 Toss requestPayment 호출
- Then:
  - UI: 로딩/버튼 disabled 상태 전환
  - API: 주문 생성 payload 필드 누락 없음(productId/sellerId/inventoryId)
  - Routing: successUrl/failUrl 설정 정확
- Automation: 단위+통합(모킹)
- Owner: FE

- Level: E2E
- Case ID: E2E-ORD-PAY-001
- Priority: P0
- Precondition: staging, 토스 테스트 결제 가능
- Given: 사용자 로그인 + 장바구니 상품 존재
- When: `/checkout`에서 주문하기 -> 토스 결제창 결제 완료 -> `/order/success`
- Then:
  - UI: 성공 페이지 표시, 주문번호 노출
  - API: `/api/payments/toss/confirm` 성공
  - DB/Event: 주문/결제 최종 상태 confirmed
- Automation: Playwright
- Owner: FE+BE

### ORD-PAY-002 토스 결제 실패/취소
- Level: BE-INT
- Case ID: BE-INT-ORD-PAY-002
- Priority: P0
- Precondition: 주문이 생성되어 있고 결제 승인 전 상태이며, 실패 유도용 paymentKey 또는 amount mismatch 입력값 준비
- Given: 주문 생성된 상태
- When: confirm API에 invalid key 또는 amount mismatch
- Then:
  - API: 4xx/5xx 정책대로 반환
  - DB: 주문 상태 실패/취소로 수렴
  - DB/Event: 재고 예약 해제(보상)
- Automation: 백 통합 테스트
- Owner: BE

- Level: FE-INT
- Case ID: FE-INT-ORD-PAY-002
- Priority: P0
- Given: checkout toss 결제 흐름
- When: Toss SDK에서 USER_CANCEL 또는 오류 반환
- Then:
  - UI: "결제 취소" 또는 "결제 실패" 토스트
  - State: `isProcessing` 해제
  - Side effect: 필요시 buyNow 세션 정리
- Automation: 컴포넌트 통합
- Owner: FE

- Level: E2E
- Case ID: E2E-ORD-PAY-002
- Priority: P0
- Given: 결제 실패를 유도할 테스트 카드/파라미터
- When: 결제 진행 후 `/order/fail` 또는 success 내 confirm 실패
- Then:
  - UI: 실패 화면/메시지 노출
  - API/DB: 주문/결제 상태 불일치 없음
- Automation: Playwright
- Owner: FE+BE

### ORD-PAY-003 결제 성공 리다이렉트 재진입/새로고침(idempotency)
- Level: BE-INT
- Case ID: BE-INT-ORD-PAY-003
- Priority: P0
- Given: 동일 `orderId/paymentKey`로 confirm 중복 호출
- When: confirm API를 2회 이상 호출
- Then:
  - DB: 결제 중복 생성 없음
  - DB/Event: 주문/결제 최종 상태 단일 수렴
- Automation: 백 통합 테스트
- Owner: BE

- Level: E2E
- Case ID: E2E-ORD-PAY-003
- Priority: P0
- Given: `/order/success?paymentKey=...&orderId=...&amount=...` 진입
- When: success 페이지 새로고침/재방문
- Then:
  - UI: 중복 실패 메시지 없이 안정 동작
  - API/DB: 중복 confirm 부작용 없음
- Automation: Playwright
- Owner: FE+BE

### ORD-PAY-004 주문 생성 실패 시 토스 결제 진입 차단
- Level: FE-INT
- Case ID: FE-INT-ORD-PAY-004
- Priority: P0
- Given: `createOrder` 실패 응답
- When: 결제 버튼 클릭
- Then:
  - UI: 주문 생성 실패 토스트
  - API: Toss requestPayment 미호출
  - State: `isProcessing=false`로 복구
- Automation: FE 통합(모킹)
- Owner: FE

- Level: E2E
- Case ID: E2E-ORD-PAY-004
- Priority: P0
- Given: 주문 생성 실패가 나는 데이터/상태
- When: checkout에서 toss 결제 시도
- Then:
  - UI: 실패 안내
  - Navigation: 토스 창 미진입
- Automation: Playwright
- Owner: FE+BE

### ORD-PAY-005 결제 파라미터 위변조(orderId/amount/paymentKey)
- Level: BE-INT
- Case ID: BE-INT-ORD-PAY-005
- Priority: P0
- Given: 정상 결제 파라미터가 아닌 조합
- When: confirm API 호출
- Then:
  - API: 정책된 4xx
  - DB: 주문/결제/재고 정합성 유지
- Automation: 백 통합 테스트
- Owner: BE

- Level: E2E
- Case ID: E2E-ORD-PAY-005
- Priority: P0
- Given: success URL query 변조
- When: `/order/success` 진입
- Then:
  - UI: 결제 승인 실패 메시지
  - DB: 확정 상태로 오염되지 않음
- Automation: Playwright
- Owner: FE+BE

### ORD-PAY-006 주문 상태 수렴(PENDING -> CONFIRMED)
- Level: BE-INT
- Case ID: BE-INT-ORD-PAY-006
- Priority: P0
- Given: 비동기 이벤트 처리 지연이 가능한 환경
- When: 결제 승인 직후 상태 조회
- Then:
  - 초기: PENDING 허용
  - 최종: 제한 시간 내 CONFIRMED 수렴
- Automation: 백 통합 테스트
- Owner: BE

- Level: E2E
- Case ID: E2E-ORD-PAY-006
- Priority: P0
- Given: 결제 성공 직후 주문 상세 진입
- When: 주문 상태 폴링/재조회
- Then: 사용자 화면이 최종 confirmed 상태로 수렴
- Automation: Playwright
- Owner: FE+BE

### CART-ORD-001 장바구니 기반 주문 생성
- Level: BE-INT
- Case ID: BE-INT-CART-ORD-001
- Priority: P0
- Given: cart item 존재
- When: 주문 생성 API 호출
- Then: 총액/수량/상품 매핑 정확
- Automation: 백 통합 테스트
- Owner: BE

- Level: FE-INT
- Case ID: FE-INT-CART-ORD-001
- Priority: P0
- Given: cart store item 존재
- When: checkout submit
- Then:
  - payload.item[].{productId,sellerId,inventoryId,quantity,unitPrice} 포함
  - 빈 장바구니면 `/cart` 리다이렉트
- Automation: FE 통합
- Owner: FE

- Level: E2E
- Case ID: E2E-CART-ORD-001
- Priority: P0
- Given: 로그인+장바구니 1개 이상
- When: cart -> checkout -> 주문
- Then: 주문 생성 및 성공/실패 페이지 일관
- Automation: Playwright
- Owner: FE+BE

### BUYNOW-ORD-001 바로구매(sessionStorage) 주문 플로우
- Level: FE-INT
- Case ID: FE-INT-BUYNOW-ORD-001
- Priority: P0
- Given: `buyNow=true` + `barofarm-buynow-item` 존재
- When: checkout 진입 후 주문
- Then:
  - UI: 단건 바로구매 아이템으로 주문 가능
  - State: 성공/취소 시 sessionStorage 정리
- Automation: FE 통합
- Owner: FE

- Level: E2E
- Case ID: E2E-BUYNOW-ORD-001
- Priority: P0
- Given: 상품 상세에서 바로구매 진입
- When: 결제 성공/취소
- Then: 아이템/세션/라우팅 일관
- Automation: Playwright
- Owner: FE+BE

### DEP-ORD-001 예치금 결제 성공
- Level: BE-INT
- Case ID: BE-INT-DEP-ORD-001
- Priority: P0
- Given: 예치금 충분
- When: `POST /api/v1/deposits/pay`
- Then: payment recorded + 잔액 차감 + 주문 확정
- Automation: 백 통합
- Owner: BE

- Level: FE-INT
- Case ID: FE-INT-DEP-ORD-001
- Priority: P0
- Given: deposit 선택, 잔액 >= 최종금액
- When: checkout submit
- Then:
  - API: createOrder -> payWithDeposit 순서
  - UI: 성공 토스트 및 `/order/success?orderId=` 이동
- Automation: FE 통합
- Owner: FE

- Level: E2E
- Case ID: E2E-DEP-ORD-001
- Priority: P0
- Given: 테스트 계정 예치금 충전 상태
- When: checkout에서 예치금 결제
- Then: 성공 페이지 + 주문 상태 confirmed
- Automation: Playwright
- Owner: FE+BE

### DEP-ORD-002 예치금 부족 처리
- Level: FE-INT
- Case ID: FE-INT-DEP-ORD-002
- Priority: P0
- Given: deposit 선택, 잔액 < 최종금액
- When: 주문하기 클릭
- Then: API 호출 없이 부족 토스트 표시
- Automation: FE 통합
- Owner: FE

- Level: E2E
- Case ID: E2E-DEP-ORD-002
- Priority: P0
- Given: 잔액 부족 계정
- When: 예치금 결제 시도
- Then: 실패 메시지, 주문 미생성 또는 롤백
- Automation: Playwright
- Owner: FE+BE

### CHK-VAL-001 체크아웃 입력값/주소 처리 검증
- Level: FE-INT
- Case ID: FE-INT-CHK-VAL-001
- Priority: P0
- Given: 이름/연락처/주소 필수값 누락 또는 주소 스크립트 실패
- When: 주문 제출
- Then:
  - UI: 필수값 오류 노출
  - API: 주문 생성 호출 차단
- Automation: FE 통합
- Owner: FE

- Level: E2E
- Case ID: E2E-CHK-VAL-001
- Priority: P0
- Given: 체크아웃 입력 미완료 상태
- When: 주문 버튼 클릭
- Then: 사용자에게 수정 가능한 오류 메시지 제공
- Automation: Playwright
- Owner: FE

### AUTH-CHK-001 비인증 사용자 체크아웃 접근
- Level: FE-INT
- Case ID: FE-INT-AUTH-CHK-001
- Priority: P0
- Given: 비로그인 상태
- When: `/checkout` 접근/주문 시도
- Then: 로그인 유도 또는 401 처리 UX 일관
- Automation: FE 통합
- Owner: FE

- Level: E2E
- Case ID: E2E-AUTH-CHK-001
- Priority: P0
- Given: 세션 없음
- When: checkout 진입 후 주문 시도
- Then: 보호 동작(로그인 리다이렉트/에러) 확인
- Automation: Playwright
- Owner: FE+BE

### PRD-REV-001 상품 상세 내 리뷰 조회/등록
- Level: FE-INT
- Case ID: FE-INT-PRD-REV-001
- Priority: P0
- Given: `/products/[id]` 상세 진입
- When: 리뷰 섹션 조회 및 리뷰 등록
- Then:
  - UI: 리뷰 목록/요약/등록 반영
  - API: 리뷰 조회/등록 호출 정확
- Automation: FE 통합
- Owner: FE

- Level: E2E
- Case ID: E2E-PRD-REV-001
- Priority: P0
- Given: 리뷰 가능한 사용자
- When: 상품 상세에서 리뷰 작성
- Then: 새 리뷰가 상세 화면에 표시
- Automation: Playwright
- Owner: FE+BE

## 추적 규칙
- 결함 티켓은 시나리오 ID 기준으로 등록한다. 예: `[E2E-ORD-PAY-002] 결제 실패 후 주문 상태 불일치`
- 한 시나리오의 하위 레벨(BE/FE)이 안정화되면 E2E flaky 우선순위를 낮출 수 있다.
