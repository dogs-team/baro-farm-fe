'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { productService } from '@/lib/api/services/product'
import type { ProductCreateRequest, ProductUpdateRequest } from '@/lib/api/types'
import { useToast } from '@/hooks/use-toast'

export function useCreateProduct() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ data, images }: { data: ProductCreateRequest; images: File[] }) =>
      productService.createProduct(data, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast({
        title: '상품 등록 성공',
        description: '상품이 성공적으로 등록되었습니다.',
      })
      router.push('/farmer/products')
    },
    onError: (error: any) => {
      console.error('Create product failed:', error)
      toast({
        title: '상품 등록 실패',
        description: error.message || '다시 시도해주세요.',
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({
      id,
      data,
      images,
    }: {
      id: string
      data: ProductUpdateRequest
      images: File[] | null
    }) => productService.updateProduct(id, data, images),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', data.id] })
      toast({
        title: '상품 수정 성공',
        description: '상품 정보가 수정되었습니다.',
      })
      router.push('/farmer/products')
    },
    onError: (error: any) => {
      console.error('Update product failed:', error)
      toast({
        title: '상품 수정 실패',
        description: error.message || '다시 시도해주세요.',
        variant: 'destructive',
      })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast({
        title: '상품 삭제 성공',
        description: '상품이 삭제되었습니다.',
      })
    },
    onError: (error: any) => {
      console.error('Delete product failed:', error)
      toast({
        title: '상품 삭제 실패',
        description: error.message || '다시 시도해주세요.',
        variant: 'destructive',
      })
    },
  })
}
