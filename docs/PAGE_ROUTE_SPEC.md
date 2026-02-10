# 페이지 라우트 스펙 (초안)

> 목적: 페이지 추가/삭제/리팩토링 시, "어떤 페이지가 어떤 책임을 가지는지"를 빠르게 확인하기 위한 라우트 기준 명세.
> 범위: `app/**/page.tsx` 전체(현재 저장소 기준).
> 상태: 자동 정적 분석 + 수동 보정 초안 (리팩토링 시 업데이트 필요).

## 1) 공통 OpenAPI 계약 링크

- Swagger UI: http://3.34.14.73:8080/swagger-ui/index.html
- Auth: `/openapi/auth/v3/api-docs`
- Buyer: `/openapi/buyer/v3/api-docs`
- Seller: `/openapi/seller/v3/api-docs`
- Order: `/openapi/order/v3/api-docs`
- Support: `/openapi/support/v3/api-docs`

## 2) 라우트 스펙

컬럼 설명

- **접근권한**: 공개 / 로그인 필요 / 역할 필요(판매자/농가/관리자)
- **필요 데이터(필드 리스트)**: 페이지가 직접 소비하는 핵심 도메인 필드의 요약
- **상태**: loading / success / empty / error / 401 / 403 중 페이지에서 고려해야 할 상태
- **액션(UX)**: 사용자 인터랙션 및 성공/실패 피드백 대상
- **컴포넌트 트리(대략)**: 페이지 기준 주요 UI 블록

| 라우트                    | 목적/유저 스토리                | 접근권한               | 필요한 데이터(필드 리스트)                                                                  | 상태                                | 액션(성공/실패 UX)                             | 컴포넌트 트리(대략)                                    | API 계약               |
| ------------------------- | ------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------- | ------------------------------------------------------ | ---------------------- |
| `/`                       | 홈에서 추천 상품/체험 탐색      | 공개                   | 상품 요약(id,name,price,image), 체험 요약(id,title,location), 배너/카테고리                 | loading,success,error               | 탐색/상세 이동, CTA 클릭                       | Header > Hero/배너 > 섹션 카드 리스트 > Chatbot        | Buyer, Support         |
| `/products`               | 상품 목록 탐색/필터링           | 공개                   | product(id,name,price,rating,image), seller(id,name), pagination(page,size,total)           | loading,success,empty,error         | 필터/정렬, 페이지 이동, 상세 이동              | Header > 필터바 > ProductCardGrid > Pagination         | Buyer                  |
| `/products/:id`           | 상품 상세 확인 후 장바구니/구매 | 공개(구매는 로그인)    | product(id,name,description,price,stock,images), review(id,rating,content), seller(id,name) | loading,success,error,401,403       | 장바구니 추가, 수량 변경, 구매 이동, 리뷰 확인 | DetailLayout > 갤러리 > 상품정보 > 구매패널 > 리뷰섹션 | Buyer, Support         |
| `/farms`                  | 농가 목록 탐색                  | 공개                   | farm(id,name,location,tags,image), pagination                                               | loading,success,empty,error         | 검색/필터, 상세 이동                           | Header > 검색/필터 > FarmCardGrid                      | Seller                 |
| `/farms/:id`              | 농가 상세 확인                  | 공개                   | farm(id,name,description,address,images), products/experiences 요약                         | loading,success,error               | 탭 전환, 상세 이동                             | Header > FarmHero > 소개/연관목록                      | Seller, Buyer          |
| `/experiences`            | 체험 목록 탐색                  | 공개                   | experience(id,title,price,date,capacity,farm), filter(keyword,region,date)                  | loading,success,empty,error         | 필터/정렬, 상세 이동                           | Header > 필터바 > ExperienceCardGrid > Pagination      | Support                |
| `/experiences/:id`        | 체험 상세/예약/리뷰             | 공개(예약은 로그인)    | experience 상세, reservation 슬롯(date,time,remaining), review 목록                         | loading,success,error,401,403       | 날짜선택, 예약, 리뷰 작성/조회                 | DetailLayout > 정보 > 예약패널 > 리뷰섹션              | Support, Order         |
| `/search`                 | 통합 검색 결과 확인             | 공개                   | keyword, product/farm/experience result list, paging                                        | loading,success,empty,error         | 결과 타입 전환, 상세 이동                      | Header > 검색요약 > 탭/섹션 리스트                     | Buyer, Seller, Support |
| `/reviews`                | 내/전체 리뷰 목록 확인          | 로그인 필요            | review(id,targetType,targetId,rating,content,createdAt)                                     | loading,success,empty,error,401     | 리뷰 작성 이동, 수정/삭제(정책별)              | Header > ReviewList > 필터                             | Support                |
| `/wishlist`               | 찜 목록 관리                    | 로그인 필요            | wishlist item(id,productId,name,price,image,stock)                                          | loading,success,empty,error,401     | 찜 해제, 상세 이동, 장바구니 이동              | Header > WishlistGrid                                  | Buyer                  |
| `/cart`                   | 장바구니 관리                   | 로그인 필요            | cart(id,userId,items[{id,productId,name,qty,price,image}],totalPrice)                       | loading,success,empty,error,401     | 수량 변경, 항목 삭제, 체크아웃 이동            | Header > CartItemList > SummaryPanel > ConfirmDialog   | Buyer                  |
| `/checkout`               | 주문/결제 진입                  | 로그인 필요            | 주문자 정보, 배송지, 결제수단, 주문요약(items,total)                                        | loading,success,error,401           | 결제 요청, 취소, 주소 변경                     | Header > 주문폼 > 결제요약                             | Order, Payment         |
| `/orders`                 | 주문 목록 조회                  | 로그인 필요            | order(id,status,totalAmount,createdAt,items)                                                | loading,success,empty,error,401     | 주문 상세 이동, 취소(가능 시)                  | Header > OrderCardList                                 | Order                  |
| `/order/:id`              | 주문 상세 조회                  | 로그인 필요            | order 상세(id,status,payment,shipping,items), timeline                                      | loading,success,error,empty,401,403 | 주문취소, 재주문, 문의 이동                    | Header > 주문요약 > 상태/배송 > 항목리스트             | Order                  |
| `/order/success`          | 결제 성공 확인                  | 로그인 필요            | paymentKey, orderId, amount, 승인결과                                                       | loading,success,error               | 확인 후 주문상세 이동                          | SuccessCard                                            | Payment, Order         |
| `/order/fail`             | 결제 실패 안내                  | 로그인 필요            | 에러코드, 메시지, 재시도 파라미터                                                           | success,error                       | 재시도, 주문/장바구니 복귀                     | FailCard                                               | Payment                |
| `/bookings`               | 체험 예약 목록 조회             | 로그인 필요            | reservation(id,experienceId,date,time,status,participants)                                  | loading,success,empty,error,401     | 예약 상세, 취소                                | Header > BookingList                                   | Support/Order          |
| `/booking/success`        | 예약 성공 안내                  | 로그인 필요            | reservationId, schedule, amount                                                             | success                             | 상세 이동                                      | SuccessCard                                            | Support/Order          |
| `/deposit/success`        | 예치금 충전 성공                | 로그인 필요            | transactionId, amount, balance                                                              | loading,success,error,401           | 내역 이동                                      | SuccessCard                                            | Payment                |
| `/deposit/fail`           | 예치금 충전 실패                | 로그인 필요            | code,message                                                                                | success,error,401                   | 재시도                                         | FailCard                                               | Payment                |
| `/notifications`          | 알림 조회/읽음/삭제             | 로그인 필요            | notification(id,type,title,body,isRead,createdAt,link)                                      | loading,success,empty,error,401     | 단건읽음, 전체읽음, 삭제(단건/다건)            | Header > Toolbar > NotificationList                    | Support                |
| `/profile`                | 내 정보/권한/요약 확인          | 로그인 필요            | user(id,name,email,roles), seller/farm 요약, account 상태                                   | loading,success,error,401,403       | 프로필 수정, 비밀번호 변경, 판매자 전환        | ProfileContainer                                       | Auth, Seller           |
| `/profile/orders`         | 내 주문 요약/관리               | 로그인 필요            | order list, status count, review 가능 여부                                                  | loading,success,empty,error,401     | 상세/취소/리뷰작성 이동                        | Header > OrderList                                     | Order, Support         |
| `/seller/products`        | 판매자 상품 관리                | 역할 필요(판매자)      | 상품목록(id,name,price,stock,status,updatedAt)                                              | loading,success,empty,error,401,403 | 상태변경, 상세/수정 이동                       | Header > SellerProductTable                            | Seller                 |
| `/seller/orders`          | 판매자 주문 처리                | 역할 필요(판매자)      | 판매 주문(id,buyer,items,status,amount,date)                                                | loading,success,empty,error,401,403 | 상태 변경(접수/발송), 상세 보기                | Header > OrderTable/Filter                             | Order, Seller          |
| `/seller/reviews`         | 판매자 리뷰 모니터링            | 역할 필요(판매자)      | review(id,productId,rating,content,author,createdAt)                                        | loading,success,empty,error,401,403 | 답글/처리(정책별)                              | Header > ReviewList                                    | Support                |
| `/seller/settlement`      | 정산 내역 확인                  | 역할 필요(판매자)      | settlement(period,sales,fee,netAmount,status)                                               | loading,success,empty,error,401,403 | 기간 필터, 다운로드/상세                       | Header > SettlementSummary > Table                     | Seller, Payment        |
| `/farmer`                 | 농가 허브 랜딩                  | 역할 필요(농가/판매자) | 농가 대시보드 카드 데이터                                                                   | loading,success,error,401,403       | 관리 메뉴 진입                                 | FarmerLanding                                          | Seller                 |
| `/farmer/dashboard`       | 농가 대시보드 조회              | 역할 필요(농가/판매자) | KPI(매출,주문,상품수,예약수), 최근 활동                                                     | loading,success,error,401,403       | 기간 변경, 상세 이동                           | DashboardCards > RecentList                            | Seller, Order          |
| `/farmer/farm`            | 농가 정보 수정                  | 역할 필요(농가/판매자) | farm profile(name,desc,address,phone,images)                                                | loading,success,error,401,403       | 저장, 이미지 업로드/교체                       | EditForm > ImageUploader                               | Seller                 |
| `/farmer/products`        | 농가 상품 목록 관리             | 역할 필요(농가/판매자) | product list(id,name,price,stock,status)                                                    | loading,success,empty,error,401,403 | 상품 삭제, 수정 진입                           | ProductTable > AlertDialog                             | Seller                 |
| `/farmer/products/new`    | 신규 상품 등록                  | 역할 필요(농가/판매자) | 카테고리(id,name), 상품입력(name,desc,price,stock,images)                                   | loading,success,error,empty,401,403 | 등록, 이미지 업로드, 유효성 검증               | ProductForm > Upload > Submit                          | Seller, Buyer          |
| `/farmer/experiences`     | 농가 체험 관리                  | 역할 필요(농가/판매자) | experience list/detail(title,price,capacity,schedule,image)                                 | loading,success,empty,error,401,403 | 생성, 수정, 삭제                               | ExperienceTable > Editor/Dialog                        | Support                |
| `/farmer/bookings`        | 농가 체험 예약 관리             | 역할 필요(농가/판매자) | reservation list(status,date,user,count,experience)                                         | loading,success,empty,error,401,403 | 예약 상태 처리, 취소/확정                      | BookingTable > Actions                                 | Support                |
| `/farmer/orders`          | 농가 주문 처리                  | 역할 필요(농가/판매자) | 판매 주문 목록/상태/금액                                                                    | loading,success,error,401,403       | 상태 변경, 상세 이동                           | OrderTable                                             | Order                  |
| `/farmer/settings`        | 농가 계정 설정                  | 역할 필요(농가/판매자) | 알림설정, 계정설정, 보안설정 필드                                                           | loading,success,error,401,403       | 저장, 토글 변경                                | SettingsForm                                           | Auth                   |
| `/admin/users`            | 관리자 사용자 관리              | 역할 필요(관리자)      | user(id,email,name,roles,status,createdAt), paging/filter                                   | loading,success,empty,error,401,403 | 권한변경, 상태변경, 검색                       | Header > UserTable > Dialog                            | Auth(Admin)            |
| `/login`                  | 사용자 로그인                   | 공개                   | credential(email,password), 로그인 응답(token,user)                                         | loading,success,error,401           | 로그인 제출, 실패 메시지, OAuth 이동           | AuthCard > Form                                        | Auth                   |
| `/signup`                 | 사용자 회원가입                 | 공개                   | 가입필드(name,email,password,phone,role), 약관동의                                          | loading,success,error,400           | 회원가입 제출, 검증 실패 표시                  | AuthCard > Form                                        | Auth                   |
| `/forgot-password`        | 비밀번호 재설정 요청            | 공개                   | email or account 식별자                                                                     | loading,success,error               | 재설정 메일/코드 요청                          | Card > Form                                            | Auth                   |
| `/oauth/kakao/callback`   | 소셜 로그인 콜백 처리           | 공개                   | code,state, 토큰 교환결과                                                                   | loading,success,error               | 토큰저장 후 리다이렉트, 실패 재시도            | CallbackStatusCard                                     | Auth                   |
| `/farmer/login`           | 농가 전용 로그인                | 공개                   | credential + 농가권한 확인 응답                                                             | loading,success,error,401,403       | 로그인 제출, 실패 안내                         | AuthCard > Form                                        | Auth                   |
| `/farmer/signup`          | 농가 전용 가입                  | 공개                   | 사업자/농가 가입 필드, 첨부 정보                                                            | loading,success,error               | 가입 제출, 검증 에러 노출                      | FarmerSignupForm                                       | Auth, Seller           |
| `/farmer/forgot-password` | 농가 계정 비밀번호 재설정       | 공개                   | email/phone 식별자                                                                          | loading,success,error               | 재설정 요청                                    | Card > Form                                            | Auth                   |
| `/about`                  | 서비스 소개                     | 공개                   | 정적 콘텐츠 블록                                                                            | success                             | CTA 이동                                       | Header > ContentCards                                  | -                      |
| `/contact`                | 문의 접수                       | 공개                   | 문의 폼(name,email,subject,message)                                                         | loading,success,error               | 문의 제출, 완료/실패 메시지                    | ContactFormCard                                        | Support                |
| `/help`                   | 도움말/FAQ 열람                 | 공개                   | FAQ 항목(category,q,a)                                                                      | success                             | 섹션 이동                                      | FAQSection                                             | -                      |
| `/terms`                  | 약관 조회                       | 공개                   | 약관 버전, 본문                                                                             | success                             | 섹션 이동                                      | TermsContent                                           | -                      |

## 3) 참고: 요청 예시인 `/posts/:id`에 대하여

현재 저장소 기준 `app/posts/[id]/page.tsx` 라우트는 존재하지 않습니다. 동일 형식으로 신규 페이지를 추가할 때는 아래 템플릿을 복사해 사용하면 됩니다.

```md
- 라우트: /posts/:id
- 목적/유저 스토리: 게시글 상세 확인 및 상호작용
- 접근권한: 공개(작성/삭제는 로그인 필요)
- 필요한 데이터: post(id,title,content,author,createdAt), comment(id,author,content), likeCount,isLiked
- 상태: loading/success/empty/error/401/403
- 액션: 좋아요, 댓글작성, 삭제(성공 토스트/실패 에러메시지)
- 컴포넌트 트리: Header > PostDetail > ActionBar > CommentList > CommentForm
- API 계약: Support(or Community) OpenAPI 링크
```

## 4) 이 문서만으로 충분한가?

결론: **페이지 추가/삭제/리팩토링 영향 파악에는 매우 유용하지만, 단독으로는 부족**합니다.

추천 보완 문서

1. **API Field Contract 문서**(엔드포인트별 request/response 필드 스키마, 에러코드)
2. **권한 매트릭스 문서**(역할 × 라우트 × 액션 허용 여부)
3. **상태 전이 문서**(로딩/빈값/오류/재시도 UX 규칙)
4. **컴포넌트 책임 문서**(페이지-섹션-공용 컴포넌트 경계)
5. **리팩토링 체크리스트**(라우팅/추적 이벤트/테스트/SEO/접근성)

운영 제안

- PR 템플릿에 "영향 라우트 업데이트" 체크박스를 추가해 이 문서 동기화를 강제.
- 새 페이지 생성 시 본 문서에 1줄 이상 먼저 작성(설계 선행).
