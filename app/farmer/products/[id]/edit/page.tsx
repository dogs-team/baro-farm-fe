'use client'

import React, { use } from 'react'
import { ProductForm } from '@/components/product/product-form'
import { Header } from '@/components/layout/header'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productService } from '@/lib/api/services/product'
import { Skeleton } from '@/components/ui/skeleton'

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default function EditProductPage({ params }: EditProductPageProps) {
  // next.js 15+ params are async promises
  const { id } = use(params)

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id),
  })

  // To match initialData interface with optional fields
  // Product definition has mandatory fields that ProductCreateRequest doesn't strict match 1:1 on optionality but mostly compatible
  // We need to ensure we pass Product to ProductForm properly.

  return (
    <div className="min-h-screen bg-background pb-12">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-muted-foreground mb-8">
          <Link href="/farmer/products" className="hover:text-foreground">
            상품 관리
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground font-medium">상품 수정</span>
        </div>

        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">상품 수정</h1>
          <p className="text-muted-foreground mb-8">등록된 상품 정보를 수정합니다.</p>

          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : error ? (
            <div className="p-12 text-center border rounded-lg bg-destructive/10 text-destructive">
              <h2 className="text-lg font-bold mb-2">상품 정보를 불러올 수 없습니다.</h2>
              <p>{(error as Error).message}</p>
              <Link href="/farmer/products" className="underline mt-4 inline-block">
                목록으로 돌아가기
              </Link>
            </div>
          ) : product ? (
            <ProductForm mode="edit" initialData={product} />
          ) : (
            <div className="p-12 text-center border rounded-lg">
              <p>상품을 찾을 수 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
