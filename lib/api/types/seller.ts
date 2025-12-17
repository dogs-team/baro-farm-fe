// 판매자 전환 시 요청 (사업자 정보)
export interface SellerApplyRequestDto {
  storeName: string // 상점 이름
  business_reg_no: string // 사업자 등록 번호
  business_owner_name: string // 사업자 대표자명
  settlement_bank: string // 정산 은행
  settlement_account: string // 정산 계좌번호
}

// 정산 항목 (SETTLEMENT_ITEM 기반 - 주문 상품 단위 정산)
export interface SettlementItem {
  settlement_item_id: string // 정산 항목 고유 ID (UUID)
  order_id: string // 주문 ID (UUID)
  order_item_id: string // 주문 상품 ID (UUID)
  seller_id: string // 판매자 ID (UUID)
  product_id: string // 상품 ID (UUID)
  amount: number // 상품 단가 (Long)
  quantity: number // 주문 수량 (Integer)
  item_price: number // 상품 총액 (amount × quantity) (Long)
  commission_amount: number // 수수료 금액 (Long)
  settlement_amount: number // 정산 금액 (item_price - commission_amount) (Long)
  order_date: string // 주문 일시 (Timestamp)
  canceled_at?: string // 주문 취소 일시 (취소 시에만 값 존재) (Timestamp)
  status: SettlementItemStatus // 정산 상태
  settlement_month: string // 정산 대상 월 (Date)
}

// 정산 항목 상태 (SETTLEMENT_ITEM.status)
export type SettlementItemStatus = 'NORMAL' | 'CANCELED'

// 정산 명세서 (SETTLEMENT_STATEMENT 기반 - 판매자별 월 단위 요약)
export interface SettlementStatement {
  statement_id: string // 정산 명세서 고유 ID (UUID)
  seller_id: string // 판매자 ID (UUID)
  period_start: string // 정산 시작일 (전월 1일) (Date)
  period_end: string // 정산 종료일 (전월 말일) (Date)
  total_sales: number // 총 매출 합계 (Long)
  total_commission: number // 총 수수료 합계 (Long)
  payout_amount: number // 최종 지급 금액 (total_sales - total_commission) (Long)
  status: SettlementStatementStatus // 정산 상태
  confirmed_at?: string // 정산 확정 일시 (Timestamp)
  paid_at?: string // 지급 완료 일시 (Timestamp)
}

// 정산 명세서 상태 (SETTLEMENT_STATEMENT.status)
export type SettlementStatementStatus = 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED'

// 내 정산 정보 응답 (SETTLEMENT_STATEMENT 기반)
export interface MySettlementResponse {
  statementId: string // 정산 명세서 고유 ID (UUID)
  settlementMonth: string // 정산 대상 월 (예: "2025-11")
  totalSales: number // 총 매출 합계
  totalCommission: number // 총 수수료 합계
  payoutAmount: number // 최종 지급 금액 (total_sales - total_commission)
}

// 정산 월 정보 (Java YearMonth 타입)
export interface SettlementMonth {
  year: number // 연도
  month: string // 월 이름 ("JANUARY", "FEBRUARY", etc.)
  monthValue: number // 월 숫자 (1-12)
  leapYear: boolean // 윤년 여부
}

// 판매자 정보 조회 응답 데이터
export interface SellerInfoData {
  storeName: string // 상점 이름
  businessRegNo: string // 사업자 등록 번호
  businessOwnerName: string // 사업자 대표자명
  status: SellerStatus // 판매자 상태
}

// 판매자 상태
export type SellerStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'SUSPENDED'
