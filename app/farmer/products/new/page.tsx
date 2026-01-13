'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
import { Sprout, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Settings, LogOut } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { FarmerNav } from '../../components/farmer-nav'
import { productService } from '@/lib/api/services/product'
import { authService } from '@/lib/api/services/auth'
import { getUserRole } from '@/lib/api/client'
import { useToast } from '@/hooks/use-toast'
import { uploadService } from '@/lib/api/services/upload'
import type { ProductCategory, ProductStatus } from '@/lib/api/types'
import { ImageIcon, X } from 'lucide-react'

const CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: 'FRUIT', label: '과일' },
  { value: 'VEGETABLE', label: '채소' },
  { value: 'GRAIN', label: '곡물' },
  { value: 'NUT', label: '견과' },
  { value: 'ROOT', label: '뿌리' },
  { value: 'MUSHROOM', label: '버섯' },
  { value: 'ETC', label: '기타' },
]

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'ON_SALE', label: '판매중' },
  { value: 'DISCOUNTED', label: '할인중' },
  { value: 'SOLD_OUT', label: '품절' },
  { value: 'HIDDEN', label: '숨김' },
]

export default function NewProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    productCategory: '' as ProductCategory | '',
    price: '',
    stockQuantity: '',
    productStatus: 'ON_SALE' as ProductStatus,
  })
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)

  // 마운트 확인 및 userRole 확인
  useEffect(() => {
    setMounted(true)
  }, [])

  // userRole이 없으면 auth/me를 호출해서 가져오기
  useEffect(() => {
    const ensureUserRole = async () => {
      if (!mounted) return

      // localStorage에 role이 없으면 auth/me 호출
      const currentRole = getUserRole()
      if (!currentRole) {
        try {
          await authService.getCurrentUser()
          // getCurrentUser 내부에서 setUserRole이 호출됨
        } catch (error) {
          console.error('사용자 정보 조회 실패:', error)
          // 에러가 발생해도 계속 진행 (API 호출 시 헤더가 없으면 서버에서 처리)
        }
      }
    }

    ensureUserRole()
  }, [mounted])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 유효성 검사
    if (!formData.productName.trim()) {
      toast({
        title: '입력 오류',
        description: '상품명을 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    if (!formData.productCategory) {
      toast({
        title: '입력 오류',
        description: '카테고리를 선택해주세요.',
        variant: 'destructive',
      })
      return
    }

    const price = Number(formData.price)
    if (isNaN(price) || price <= 0) {
      toast({
        title: '입력 오류',
        description: '올바른 가격을 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    const stockQuantity = Number(formData.stockQuantity)
    if (isNaN(stockQuantity) || stockQuantity < 0) {
      toast({
        title: '입력 오류',
        description: '올바른 재고 수량을 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      // 이미지 업로드 (있는 경우) - uploadService가 자동으로 압축 처리
      let uploadedImageUrls: string[] = []
      if (images.length > 0) {
        setIsUploadingImages(true)
        try {
          const uploadResults = await uploadService.uploadMultipleFiles(images, 'product')
          uploadedImageUrls = uploadResults.files.map((f) => f.url)
          setImageUrls(uploadedImageUrls)
        } catch (error) {
          console.error('이미지 업로드 실패:', error)
          toast({
            title: '이미지 업로드 실패',
            description: '이미지 업로드 중 오류가 발생했습니다. 다시 시도해주세요.',
            variant: 'destructive',
          })
          setIsUploadingImages(false)
          setIsSubmitting(false)
          return
        } finally {
          setIsUploadingImages(false)
        }
      }

      await productService.createProduct({
        productName: formData.productName.trim(),
        description: formData.description.trim() || undefined,
        productCategory: formData.productCategory,
        price,
        stockQuantity,
        productStatus: formData.productStatus,
        imageUrls: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
      })

      toast({
        title: '상품 등록 완료',
        description: '새로운 상품이 등록되었습니다.',
      })

      // 상품 목록 페이지로 이동
      router.push('/farmer/products')
    } catch (error: unknown) {
      console.error('상품 등록 실패:', error)
      const errorMessage =
        error instanceof Error ? error.message : '상품 등록 중 오류가 발생했습니다.'
      toast({
        title: '상품 등록 실패',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Sprout className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">바로팜</span>
            </Link>
            <Badge variant="secondary">농가</Badge>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">고객 페이지</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarFallback>햇</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>햇살농장</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/farmer/dashboard">대시보드</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/farmer/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    설정
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="h-4 w-4 mr-2" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <FarmerNav />

        {/* Page Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/farmer/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              상품 목록으로
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">새 상품 등록</h1>
          <p className="text-muted-foreground">판매할 상품의 정보를 입력해주세요</p>
        </div>

        {/* Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 상품명 */}
            <div className="space-y-2">
              <Label htmlFor="productName">
                상품명 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="productName"
                placeholder="예: 유기농 사과 5kg"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                required
              />
            </div>

            {/* 설명 */}
            <div className="space-y-2">
              <Label htmlFor="description">상품 설명</Label>
              <Textarea
                id="description"
                placeholder="상품에 대한 상세 설명을 입력해주세요"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            {/* 카테고리 */}
            <div className="space-y-2">
              <Label htmlFor="category">
                카테고리 <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.productCategory}
                onValueChange={(value) =>
                  setFormData({ ...formData, productCategory: value as ProductCategory })
                }
                required
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="카테고리를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 가격 */}
            <div className="space-y-2">
              <Label htmlFor="price">
                가격 (원) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="예: 25000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                min="0"
                step="1"
                required
              />
            </div>

            {/* 재고 수량 */}
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">
                재고 수량 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="stockQuantity"
                type="number"
                placeholder="예: 100"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                min="0"
                step="1"
                required
              />
            </div>

            {/* 판매 상태 */}
            <div className="space-y-2">
              <Label htmlFor="status">판매 상태</Label>
              <Select
                value={formData.productStatus}
                onValueChange={(value) =>
                  setFormData({ ...formData, productStatus: value as ProductStatus })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 이미지 업로드 */}
            <div className="space-y-2">
              <Label>상품 이미지 (선택사항, 최대 10개)</Label>
              <div className="space-y-4">
                {/* 이미지 미리보기 */}
                {(images.length > 0 || imageUrls.length > 0) && (
                  <div className="grid grid-cols-4 gap-4">
                    {imageUrls.map((url, index) => (
                      <div
                        key={`url-${index}`}
                        className="relative aspect-square rounded-lg overflow-hidden border"
                      >
                        <img
                          src={url}
                          alt={`상품 이미지 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {images.map((image, index) => (
                      <div
                        key={`file-${index}`}
                        className="relative aspect-square rounded-lg overflow-hidden border"
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`미리보기 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImages((prev) => prev.filter((_, i) => i !== index))
                          }}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs hover:bg-destructive/90"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 이미지 업로드 버튼 */}
                {images.length + imageUrls.length < 10 && (
                  <label className="block">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-1">
                        이미지를 클릭하거나 드래그하여 업로드
                      </p>
                      <p className="text-xs text-muted-foreground">
                        이미지는 자동으로 압축되어 WebP 형식으로 변환됩니다
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        if (files.length + images.length + imageUrls.length > 10) {
                          toast({
                            title: '이미지 개수 초과',
                            description: '최대 10개의 이미지만 업로드할 수 있습니다.',
                            variant: 'destructive',
                          })
                          return
                        }
                        setImages((prev) => [...prev, ...files])
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" asChild>
                <Link href="/farmer/products">취소</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting || isUploadingImages}>
                <Save className="h-4 w-4 mr-2" />
                {isUploadingImages
                  ? '이미지 업로드 중...'
                  : isSubmitting
                    ? '등록 중...'
                    : '상품 등록'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
