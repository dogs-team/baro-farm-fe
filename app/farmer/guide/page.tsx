'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, BookOpen, CheckCircle2, FileText, HelpCircle, Mail } from 'lucide-react'
import Link from 'next/link'

export default function FarmerGuidePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">홈으로</span>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">농가 이용 가이드</h1>
          <p className="text-lg text-muted-foreground">
            바로팜에서 농가로 등록하고 상품을 판매하는 방법을 안내합니다
          </p>
        </div>

        <div className="space-y-6">
          {/* 등록 절차 */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">농가 등록 절차</h2>
            </div>
            <ol className="space-y-4 list-decimal list-inside">
              <li className="pl-2">
                <strong>회원가입</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  일반 회원가입을 먼저 진행해주세요. 농가 전환은 마이페이지에서 가능합니다.
                </p>
              </li>
              <li className="pl-2">
                <strong>농가 정보 입력</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  농장 이름, 주소, 사업자 등록번호 등 필요한 정보를 입력해주세요.
                </p>
              </li>
              <li className="pl-2">
                <strong>정산 정보 등록</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  판매 대금을 받을 계좌 정보를 등록해주세요.
                </p>
              </li>
              <li className="pl-2">
                <strong>상품 등록</strong>
                <p className="text-sm text-muted-foreground mt-1">
                  판매할 농산물의 정보와 사진을 등록해주세요.
                </p>
              </li>
            </ol>
          </Card>

          {/* 주요 기능 */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">주요 기능</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  상품 관리
                </h3>
                <p className="text-sm text-muted-foreground">
                  상품 등록, 수정, 삭제 및 재고 관리가 가능합니다.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  주문 관리
                </h3>
                <p className="text-sm text-muted-foreground">
                  주문 내역 확인 및 배송 상태 업데이트가 가능합니다.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  체험 관리
                </h3>
                <p className="text-sm text-muted-foreground">
                  농장 체험 프로그램을 등록하고 예약을 관리할 수 있습니다.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  정산 관리
                </h3>
                <p className="text-sm text-muted-foreground">
                  매출 현황 및 정산 내역을 확인할 수 있습니다.
                </p>
              </div>
            </div>
          </Card>

          {/* 수수료 안내 */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <HelpCircle className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">수수료 안내</h2>
            </div>
            <div className="space-y-3">
              <p className="text-muted-foreground">
                바로팜은 농가와 소비자를 직접 연결하는 플랫폼으로, 최소한의 수수료만 부과합니다.
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>판매 수수료: 판매 금액의 5%</li>
                <li>결제 수수료: 별도 부과 없음</li>
                <li>정산 주기: 매월 말일 정산</li>
              </ul>
            </div>
          </Card>

          {/* 문의하기 */}
          <Card className="p-6 bg-primary/5">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">문의하기</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              농가 등록이나 운영에 대해 궁금한 점이 있으시면 언제든지 문의해주세요.
            </p>
            <Button asChild>
              <Link href="/contact">문의하기</Link>
            </Button>
          </Card>

          {/* 등록하기 버튼 */}
          <div className="flex justify-center pt-6">
            <Button size="lg" asChild>
              <Link href="/farmer/signup">농가 등록하기</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
