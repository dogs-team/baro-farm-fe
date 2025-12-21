'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const faqs = [
  {
    category: '주문/결제',
    questions: [
      {
        question: '주문은 어떻게 하나요?',
        answer:
          '원하는 상품을 장바구니에 담고 결제 페이지에서 주문 정보를 확인한 후 결제를 진행하시면 됩니다.',
      },
      {
        question: '결제 방법은 무엇이 있나요?',
        answer: '신용카드, 계좌이체, 예치금 등 다양한 결제 방법을 지원합니다.',
      },
      {
        question: '주문을 취소할 수 있나요?',
        answer:
          '배송 준비 전까지는 주문 취소가 가능합니다. 마이페이지의 주문 내역에서 취소할 수 있습니다.',
      },
    ],
  },
  {
    category: '배송',
    questions: [
      {
        question: '배송 기간은 얼마나 걸리나요?',
        answer: '농장에서 직접 배송하므로 지역에 따라 1-3일 정도 소요됩니다.',
      },
      {
        question: '배송비는 얼마인가요?',
        answer:
          '주문 금액에 따라 배송비가 달라집니다. 자세한 내용은 상품 페이지에서 확인하실 수 있습니다.',
      },
      {
        question: '배송 추적은 어떻게 하나요?',
        answer: '마이페이지의 주문 내역에서 배송 상태를 확인하실 수 있습니다.',
      },
    ],
  },
  {
    category: '반품/교환',
    questions: [
      {
        question: '반품은 어떻게 하나요?',
        answer:
          '상품 수령 후 7일 이내에 반품 신청이 가능합니다. 마이페이지에서 반품 신청을 진행해주세요.',
      },
      {
        question: '교환이 가능한가요?',
        answer: '상품에 하자가 있는 경우 교환이 가능합니다. 고객센터로 문의해주세요.',
      },
    ],
  },
  {
    category: '농가 관련',
    questions: [
      {
        question: '농가로 등록하려면 어떻게 해야 하나요?',
        answer: '홈페이지 하단의 "농가 등록" 메뉴를 통해 신청하실 수 있습니다.',
      },
      {
        question: '농가 수수료는 얼마인가요?',
        answer:
          '판매 금액의 5% 수수료가 부과됩니다. 자세한 내용은 농가 이용 가이드를 참고해주세요.',
      },
    ],
  },
]

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  let questionIndex = 0

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
          <HelpCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">자주 묻는 질문</h1>
          <p className="text-lg text-muted-foreground">
            바로팜 이용에 대한 궁금증을 해결해드립니다
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((category) => (
            <Card key={category.category} className="p-6">
              <h2 className="text-2xl font-semibold mb-4">{category.category}</h2>
              <div className="space-y-3">
                {category.questions.map((faq) => {
                  const currentIndex = questionIndex++
                  const isOpen = openIndex === currentIndex
                  return (
                    <div key={faq.question} className="border-b last:border-0 pb-3 last:pb-0">
                      <button
                        onClick={() => toggleQuestion(currentIndex)}
                        className="w-full flex items-center justify-between text-left py-2 hover:text-primary transition-colors"
                      >
                        <span className="font-medium">{faq.question}</span>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="mt-2 text-sm text-muted-foreground pl-2">{faq.answer}</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-6 bg-primary/5">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">더 궁금한 점이 있으신가요?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              자주 묻는 질문에서 답을 찾지 못하셨다면 문의하기를 이용해주세요.
            </p>
            <Button asChild>
              <Link href="/contact">문의하기</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
