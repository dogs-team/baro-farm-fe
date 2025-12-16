'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ShoppingBag, Store } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ProfileRoleProps {
  userRole: 'BUYER' | 'SELLER'
}

export function ProfileRole({ userRole }: ProfileRoleProps) {
  const { toast } = useToast()
  const [isSellerDialogOpen, setIsSellerDialogOpen] = useState(false)
  const [sellerApplication, setSellerApplication] = useState({
    farmName: '',
    farmAddress: '',
    farmDescription: '',
    businessNumber: '',
  })

  const handleSellerApplication = async () => {
    if (!sellerApplication.farmName || !sellerApplication.farmAddress) {
      toast({
        title: '필수 항목 입력',
        description: '농장명과 주소를 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    try {
      // TODO: API 연동
      // await authService.requestSellerRole(sellerApplication)
      toast({
        title: '판매자 전환 신청 완료',
        description: '판매자 전환 신청이 완료되었습니다. 검토 후 승인됩니다.',
      })
      setIsSellerDialogOpen(false)
      setSellerApplication({
        farmName: '',
        farmAddress: '',
        farmDescription: '',
        businessNumber: '',
      })
    } catch (error) {
      toast({
        title: '신청 실패',
        description: '판매자 전환 신청 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
      <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">역할 관리</h2>
      <div className="space-y-6">
        {/* Buyer Role */}
        <div className="flex items-start gap-5 p-5 border border-gray-200 dark:border-gray-800 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100 dark:border-gray-700">
            <ShoppingBag className="h-6 w-6 text-gray-600" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">구매자</h3>
              {userRole === 'BUYER' && (
                <Badge variant="default" className="bg-[#22C55E] hover:bg-[#16A34A]">
                  현재 역할
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
              농산물을 구매하고 농장 체험을 예약할 수 있습니다.
            </p>
            <ul className="text-xs space-y-1.5 text-gray-500 dark:text-gray-400 font-normal">
              <li>• 상품 구매 및 주문 관리</li>
              <li>• 체험 예약</li>
              <li>• 리뷰 작성</li>
              <li>• 장바구니</li>
            </ul>
          </div>
        </div>

        {/* Seller Role */}
        <div className="flex items-start gap-5 p-5 border border-gray-200 dark:border-gray-800 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100 dark:border-gray-700">
            <Store className="h-6 w-6 text-gray-600" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">판매자 (농가)</h3>
              {userRole === 'SELLER' && (
                <Badge variant="default" className="bg-[#22C55E] hover:bg-[#16A34A]">
                  현재 역할
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
              농산물을 판매하고 농장 체험 프로그램을 운영할 수 있습니다.
            </p>
            <ul className="text-xs space-y-1.5 text-gray-500 dark:text-gray-400 font-normal mb-4">
              <li>• 상품 등록 및 판매</li>
              <li>• 체험 프로그램 등록</li>
              <li>• 주문 및 예약 관리</li>
              <li>• 농장 정보 관리</li>
              <li>• 매출 및 정산 관리</li>
            </ul>
            {userRole === 'BUYER' && (
              <Dialog open={isSellerDialogOpen} onOpenChange={setIsSellerDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold">
                    <Store className="h-4 w-4 mr-2" />
                    판매자로 전환 신청
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>판매자 전환 신청</DialogTitle>
                    <DialogDescription>
                      농장 정보를 입력하고 판매자 계정으로 전환하세요
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="farmName">농장명 *</Label>
                      <Input
                        id="farmName"
                        placeholder="햇살농장"
                        value={sellerApplication.farmName}
                        onChange={(e) =>
                          setSellerApplication({
                            ...sellerApplication,
                            farmName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="farmAddress">농장 주소 *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="farmAddress"
                          placeholder="경기도 양평군 양평읍 농장길 123"
                          value={sellerApplication.farmAddress}
                          onChange={(e) =>
                            setSellerApplication({
                              ...sellerApplication,
                              farmAddress: e.target.value,
                            })
                          }
                          required
                        />
                        <Button variant="outline" type="button">
                          주소 검색
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="farmDescription">농장 소개</Label>
                      <Textarea
                        id="farmDescription"
                        placeholder="농장에 대한 간단한 소개를 작성해주세요"
                        value={sellerApplication.farmDescription}
                        onChange={(e) =>
                          setSellerApplication({
                            ...sellerApplication,
                            farmDescription: e.target.value,
                          })
                        }
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessNumber">사업자 등록번호 (선택)</Label>
                      <Input
                        id="businessNumber"
                        placeholder="123-45-67890"
                        value={sellerApplication.businessNumber}
                        onChange={(e) =>
                          setSellerApplication({
                            ...sellerApplication,
                            businessNumber: e.target.value,
                          })
                        }
                      />
                      <p className="text-sm text-muted-foreground">
                        사업자 등록번호가 있으면 입력해주세요. 없어도 신청 가능합니다.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsSellerDialogOpen(false)}>
                      취소
                    </Button>
                    <Button onClick={handleSellerApplication}>신청하기</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            {userRole === 'SELLER' && (
              <div className="flex gap-2">
                <Button asChild className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold">
                  <Link href="/farmer/dashboard">판매자 대시보드로 이동</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 bg-gray-50 border border-gray-100 rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <h4 className="font-bold mb-2 text-sm text-gray-900 dark:text-white">안내사항</h4>
          <ul className="text-xs text-muted-foreground space-y-1.5 font-normal">
            <li>• 판매자 전환 신청 후 검토가 진행됩니다.</li>
            <li>• 승인까지 1-3 영업일이 소요될 수 있습니다.</li>
            <li>• 판매자로 전환하더라도 구매자 기능은 계속 사용할 수 있습니다.</li>
            <li>• 판매자 계정은 농장 정보 검증 후 활성화됩니다.</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}
