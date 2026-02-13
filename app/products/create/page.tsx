'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createDevSellerProduct,
  getDevDummyUser,
  getDevSellerId,
  isApprovedSeller,
} from '@/lib/dev-seller'

type ProductStatus = 'ON_SALE' | 'SOLD_OUT' | 'STOPPED'

export default function ProductCreatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = getDevDummyUser()
  const sellerId = useMemo(
    () => searchParams.get('sellerId') || getDevSellerId(user) || '',
    [searchParams, user]
  )
  const allowed = isApprovedSeller(user)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('과일')
  const [stock, setStock] = useState('')
  const [status, setStatus] = useState<ProductStatus>('ON_SALE')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!allowed || !sellerId || !name.trim() || !price.trim() || !stock.trim()) return

    setIsSubmitting(true)
    try {
      createDevSellerProduct(sellerId, {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        category,
        stock: Number(stock),
        status,
      })
      router.push(`/productManage?sellerId=${encodeURIComponent(sellerId)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">상품 등록</h1>
        <p className="text-muted-foreground mb-8">더미 데이터 기반 등록 화면 (API 미연동)</p>

        {!allowed ? (
          <Card className="p-6 space-y-3">
            <p className="font-semibold">접근 권한이 없습니다.</p>
            <p className="text-sm text-muted-foreground">승인된 SELLER 계정으로 로그인해주세요.</p>
            <Button onClick={() => router.push('/login')}>로그인으로 이동</Button>
          </Card>
        ) : (
          <Card className="p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">상품명</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">가격</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">재고수량</Label>
                  <Input
                    id="stock"
                    type="number"
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>카테고리</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="과일">과일</SelectItem>
                      <SelectItem value="채소">채소</SelectItem>
                      <SelectItem value="곡물">곡물</SelectItem>
                      <SelectItem value="기타">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>판매 상태</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as ProductStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ON_SALE">ON_SALE</SelectItem>
                      <SelectItem value="SOLD_OUT">SOLD_OUT</SelectItem>
                      <SelectItem value="STOPPED">STOPPED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? '등록 중...' : '등록'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    router.push(`/productManage?sellerId=${encodeURIComponent(sellerId)}`)
                  }
                >
                  취소
                </Button>
              </div>
            </form>
          </Card>
        )}
      </main>
    </div>
  )
}
