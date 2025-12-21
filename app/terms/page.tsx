'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
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

        <div className="mb-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">이용약관</h1>
          <p className="text-sm text-muted-foreground">최종 수정일: 2025년 1월 1일</p>
        </div>

        <Card className="p-6 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">제1조 (목적)</h2>
            <p className="text-muted-foreground leading-relaxed">
              이 약관은 바로팜(이하 "회사")이 운영하는 바로팜 플랫폼(이하 "서비스")의 이용과
              관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제2조 (정의)</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>1. "서비스"란 회사가 제공하는 농산물 직거래 플랫폼을 의미합니다.</p>
              <p>2. "이용자"란 이 약관에 따라 서비스를 이용하는 회원 및 비회원을 의미합니다.</p>
              <p>3. "회원"이란 회사에 개인정보를 제공하여 회원등록을 한 자를 의미합니다.</p>
              <p>4. "농가"란 회사가 제공하는 서비스를 통해 농산물을 판매하는 회원을 의미합니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제3조 (약관의 게시와 개정)</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                1. 회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
              </p>
              <p>
                2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수
                있습니다.
              </p>
              <p>
                3. 회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께
                서비스의 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제4조 (회원가입)</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                1. 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는
                의사표시를 함으로서 회원가입을 신청합니다.
              </p>
              <p>
                2. 회사는 제1항과 같이 회원가입을 신청한 이용자 중 다음 각 호에 해당하지 않는 한
                회원으로 등록합니다.
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                <li>
                  기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제5조 (서비스의 제공 및 변경)</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>1. 회사는 다음과 같은 서비스를 제공합니다:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>농산물 판매 및 구매 중개 서비스</li>
                <li>농장 체험 프로그램 예약 서비스</li>
                <li>기타 회사가 추가 개발하거나 제휴계약 등을 통해 제공하는 일체의 서비스</li>
              </ul>
              <p>2. 회사는 서비스의 내용을 변경할 수 있으며, 변경 시에는 사전에 공지합니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제6조 (수수료)</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>1. 회사는 농가에게 판매 금액의 일정 비율을 수수료로 부과할 수 있습니다.</p>
              <p>2. 수수료율 및 정산 주기는 별도로 공지합니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제7조 (회원의 의무)</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>1. 회원은 다음 행위를 하여서는 안 됩니다:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>신청 또는 변경 시 허위내용의 등록</li>
                <li>타인의 정보 도용</li>
                <li>회사가 게시한 정보의 변경</li>
                <li>회사가 정한 정보 이외의 정보 등의 송신 또는 게시</li>
                <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제8조 (개인정보보호)</h2>
            <p className="text-muted-foreground leading-relaxed">
              회사는 이용자의 개인정보 수집 및 이용에 대해서는 관련 법령 및 회사의
              개인정보처리방침에 따르고, 서비스 제공을 위해 수집한 이용자의 개인정보는 해당 서비스의
              제공이 종료된 후 지체없이 파기합니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">제9조 (면책조항)</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는
                경우에는 서비스 제공에 관한 책임이 면제됩니다.
              </p>
              <p>
                2. 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.
              </p>
              <p>
                3. 회사는 회원이 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지
                않으며, 그 밖의 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.
              </p>
            </div>
          </section>
        </Card>

        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href="/">홈으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
