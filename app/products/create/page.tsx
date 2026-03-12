'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { useToast } from '@/hooks/use-toast'
import { categoryService } from '@/lib/api/services/category'
import { productService } from '@/lib/api/services/product'
import { sellerService } from '@/lib/api/services/seller'
import { userService } from '@/lib/api/services/user'
import type { CategoryListItem, ProductStatus } from '@/lib/api/types'

export default function ProductCreatePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [ready, setReady] = useState(false)
  const [allowed, setAllowed] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<CategoryListItem[]>([])
  const [stock, setStock] = useState('')
  const [status, setStatus] = useState<ProductStatus>('ON_SALE')
  const [images, setImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categoryLoadError, setCategoryLoadError] = useState<string | null>(null)

  const categoryOptions = (categories.some((category) => category.level > 0)
    ? categories.filter((category) => category.level > 0)
    : categories
  )
    .map((category) => ({
      ...category,
      label: `${'  '.repeat(Math.max(category.level - 1, 0))}${category.name}`,
    }))

  useEffect(() => {
    void (async () => {
      try {
        const currentUser = await userService.getCurrentUser()
        setAllowed(await sellerService.hasSellerAccess(currentUser.userId, currentUser.role))
      } catch {
        setAllowed(false)
      }

      try {
        const allCategories = await categoryService.getCategoryTree()
        setCategories(allCategories)
        setCategoryLoadError(null)

        const firstSelectableCategory =
          allCategories.find((category) => category.level > 0) || allCategories[0]

        if (firstSelectableCategory) {
          setCategoryId(firstSelectableCategory.id)
        }
      } catch {
        setCategories([])
        setCategoryLoadError('카테고리 목록을 불러오지 못했습니다.')
      } finally {
        setReady(true)
      }
    })()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allowed || !name.trim() || !categoryId.trim() || !price.trim() || !stock.trim()) return

    setIsSubmitting(true)
    try {
      await productService.createProduct({
        productName: name.trim(),
        description: description.trim() || undefined,
        categoryId,
        price: Number(price),
        inventoryOptions: [
          {
            quantity: Number(stock),
            unit: 1,
          },
        ],
        productStatus: status,
      }, images)
      toast({
        title: '등록 완료',
        description: '상품이 등록되었습니다.',
      })
      router.push('/productManage')
    } catch (error) {
      console.error('상품 등록 실패:', error)
      toast({
        title: '등록 실패',
        description: '상품 등록 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">상품 등록</h1>
        <p className="text-muted-foreground mb-8">판매자 상품 등록 화면입니다.</p>

        {!ready ? (
          <Card className="p-6">로딩 중...</Card>
        ) : !allowed ? (
          <Card className="p-6 space-y-3">
            <p className="font-semibold">접근 권한이 없습니다.</p>
            <p className="text-sm text-muted-foreground">SELLER 계정으로 로그인해주세요.</p>
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

              <div className="space-y-2">
                <Label htmlFor="images">상품 이미지</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImages(Array.from(e.target.files || []))}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>카테고리</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {categoryLoadError || '실제 카테고리 API에서 조회한 항목의 UUID를 전송합니다.'}
                  </p>
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
                      <SelectItem value="HIDDEN">HIDDEN</SelectItem>
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
                  onClick={() => router.push('/productManage')}
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
