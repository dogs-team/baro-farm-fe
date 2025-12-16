'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Star } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { reviewService } from '@/lib/api/services/review'
import { uploadService } from '@/lib/api/services/upload'

interface ReviewFormProps {
  productId?: string | number
  experienceId?: string | number
  orderItemId?: string // 주문 항목 ID (리뷰 작성에 필요)
  onSubmit?: (review: { rating: number; content: string; images?: File[] }) => void
  onCancel?: () => void
}

export function ReviewForm({
  productId,
  experienceId,
  orderItemId,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const { toast } = useToast()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [content, setContent] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast({
        title: '평점을 선택해주세요',
        description: '1점 이상의 평점을 선택해주세요.',
        variant: 'destructive',
      })
      return
    }

    if (!content.trim()) {
      toast({
        title: '리뷰 내용을 입력해주세요',
        description: '리뷰 내용을 작성해주세요.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      // 이미지 업로드 (있는 경우)
      let imageUrls: string[] = []
      if (images.length > 0) {
        const uploadPromises = images.map((image) => uploadService.uploadFile(image, 'review'))
        const uploadResults = await Promise.all(uploadPromises)
        imageUrls = uploadResults.map((result) => result.url)
      }

      // orderItemId가 없으면 에러
      if (!orderItemId) {
        throw new Error(
          '주문 정보를 찾을 수 없습니다. 구매한 상품에 대해서만 리뷰를 작성할 수 있습니다.'
        )
      }

      // 상품 리뷰 등록
      if (productId && orderItemId) {
        await reviewService.createProductReview(String(productId), {
          orderItemId,
          rating,
          content: content.trim(),
          reviewVisibility: 'PUBLIC', // 기본값: 공개
        })
      } else {
        // TODO: 체험 리뷰 등록 (experienceId가 있는 경우)
        throw new Error('체험 리뷰는 아직 지원되지 않습니다.')
      }

      onSubmit?.({
        rating,
        content: content.trim(),
        images,
      })

      toast({
        title: '리뷰가 등록되었습니다',
        description: '소중한 후기 감사합니다.',
      })

      // Reset form
      setRating(0)
      setContent('')
      setImages([])
      onCancel?.()
    } catch (error: any) {
      console.error('리뷰 등록 실패:', error)
      toast({
        title: '리뷰 등록 실패',
        description: error.message || '리뷰 등록 중 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 5) {
      toast({
        title: '이미지 개수 초과',
        description: '최대 5개의 이미지만 업로드할 수 있습니다.',
        variant: 'destructive',
      })
      return
    }
    setImages((prev) => [...prev, ...files])
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">리뷰 작성</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <Label>평점</Label>
          <div className="flex items-center gap-2 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'fill-primary text-primary'
                      : 'fill-muted text-muted-foreground'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && <span className="ml-2 text-sm text-muted-foreground">{rating}점</span>}
          </div>
        </div>

        {/* Content */}
        <div>
          <Label htmlFor="content">리뷰 내용</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="상품에 대한 솔직한 후기를 작성해주세요..."
            className="mt-2 min-h-[120px]"
            maxLength={1000}
          />
          <div className="text-right text-sm text-muted-foreground mt-1">{content.length}/1000</div>
        </div>

        {/* Images */}
        <div>
          <Label>사진 첨부 (선택사항, 최대 5개)</Label>
          <div className="mt-2 space-y-2">
            <div className="flex gap-2 flex-wrap">
              {images.map((image, index) => (
                <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs hover:bg-destructive/90"
                  >
                    ×
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <span className="text-2xl text-muted-foreground">+</span>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '등록 중...' : '리뷰 등록'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
