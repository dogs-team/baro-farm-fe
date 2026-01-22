'use client'

import React, { useState, useEffect } from 'react'
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
import { ImageUploader } from './image-uploader'
import { useCreateProduct, useUpdateProduct } from '@/hooks/use-product-mutation'
import type {
  Product,
  ProductCategory,
  ProductStatus,
  ProductCreateRequest,
  ProductUpdateRequest,
  ImageUpdateMode,
} from '@/lib/api/types'

interface ProductFormProps {
  initialData?: Product
  mode: 'create' | 'edit'
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, mode }) => {
  const router = useRouter()
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()

  const [formData, setFormData] = useState<ProductCreateRequest>({
    productName: initialData?.productName || '',
    description: initialData?.description || '',
    productCategory: initialData?.productCategory || 'FRUIT',
    price: initialData?.price || 0,
    stockQuantity: initialData?.stockQuantity || 0,
    productStatus: initialData?.productStatus || 'ON_SALE',
  })

  // For Edit Mode
  const [imageUpdateMode, setImageUpdateMode] = useState<ImageUpdateMode>('KEEP')

  const [images, setImages] = useState<File[]>([])

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === 'create') {
      createMutation.mutate({
        data: formData,
        images: images,
      })
    } else if (mode === 'edit' && initialData) {
      const updateData: ProductUpdateRequest = {
        productName: formData.productName,
        description: formData.description,
        productCategory: formData.productCategory,
        price: formData.price,
        stockQuantity: formData.stockQuantity,
        productStatus: formData.productStatus,
        imageUpdateMode: imageUpdateMode,
      }

      updateMutation.mutate({
        id: initialData.id,
        data: updateData,
        images: imageUpdateMode === 'REPLACE' ? images : null,
      })
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">기본 정보</h3>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="productName">상품명</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">카테고리</Label>
                <Select
                  value={formData.productCategory}
                  onValueChange={(val) =>
                    setFormData({ ...formData, productCategory: val as ProductCategory })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FRUIT">과일</SelectItem>
                    <SelectItem value="VEGETABLE">채소</SelectItem>
                    <SelectItem value="GRAIN">쌀/잡곡</SelectItem>
                    <SelectItem value="NUT">게/견과류</SelectItem>
                    <SelectItem value="ROOT">구근류</SelectItem>
                    <SelectItem value="MUSHROOM">버섯류</SelectItem>
                    <SelectItem value="ETC">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">판매 상태</Label>
                <Select
                  value={formData.productStatus}
                  onValueChange={(val) =>
                    setFormData({ ...formData, productStatus: val as ProductStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ON_SALE">판매중</SelectItem>
                    <SelectItem value="DISCOUNTED">할인중</SelectItem>
                    <SelectItem value="SOLD_OUT">품절</SelectItem>
                    <SelectItem value="HIDDEN">숨김</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">상품 설명</Label>
              <Textarea
                id="description"
                className="min-h-[150px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Price & Stock */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">가격 및 재고</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">가격 (원)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stock">재고 수량</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, stockQuantity: Number(e.target.value) })
                }
                required
              />
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">상품 이미지</h3>

          {mode === 'edit' && (
            <div className="bg-muted p-4 rounded-md mb-4">
              <Label className="mb-2 block">이미지 수정 방식</Label>
              <Select
                value={imageUpdateMode}
                onValueChange={(val) => setImageUpdateMode(val as ImageUpdateMode)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KEEP">기존 이미지 유지 (변경 없음)</SelectItem>
                  <SelectItem value="REPLACE">새 이미지로 교체 (기존 이미지 삭제됨)</SelectItem>
                  <SelectItem value="CLEAR">이미지 모두 삭제</SelectItem>
                </SelectContent>
              </Select>

              {imageUpdateMode === 'REPLACE' && (
                <p className="text-xs text-muted-foreground mt-2">
                  * 새로운 이미지를 업로드하면 기존 이미지는 모두 삭제되고 대체됩니다.
                </p>
              )}
              {imageUpdateMode === 'CLEAR' && (
                <p className="text-xs text-destructive mt-2">
                  * 저장 시 기존 이미지가 모두 영구적으로 삭제됩니다.
                </p>
              )}
            </div>
          )}

          {(mode === 'create' || (mode === 'edit' && imageUpdateMode === 'REPLACE')) && (
            <ImageUploader
              maxImages={10}
              onImagesChange={setImages}
              existingImages={
                mode === 'edit' && imageUpdateMode === 'REPLACE' ? [] : initialData?.imageUrls || []
              }
            />
          )}

          {/* In KEEP mode, show existing images read-only */}
          {mode === 'edit' && imageUpdateMode === 'KEEP' && (
            <div className="opacity-70 pointer-events-none grayscale-[0.3]">
              <Label className="mb-2 block">현재 등록된 이미지</Label>
              <ImageUploader
                maxImages={0}
                onImagesChange={() => {}}
                existingImages={initialData?.imageUrls || []}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '저장 중...' : mode === 'create' ? '상품 등록' : '수정 사항 저장'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
