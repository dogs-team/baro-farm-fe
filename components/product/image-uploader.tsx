'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Image as ImageIcon, Upload } from 'lucide-react'
import Image from 'next/image'
import { Label } from '@/components/ui/label'

interface ImageUploaderProps {
  maxImages?: number
  onImagesChange: (images: File[]) => void
  existingImages?: string[] // 기존 이미지 URL (수정 시)
  maxFileSize?: number // 최대 파일 크기 (bytes, 기본값: 10MB)
  accept?: string // 허용할 파일 형식 (기본값: image/*)
}

export function ImageUploader({
  maxImages = 10,
  onImagesChange,
  existingImages = [],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  accept = 'image/*',
}: ImageUploaderProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview)
        }
      })
    }
  }, [previews])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (selectedImages.length + existingImages.length + files.length > maxImages) {
      alert(`최대 ${maxImages}개까지 업로드할 수 있습니다.`)
      return
    }

    // 파일 유효성 검사
    const validFiles: File[] = []
    const newPreviews: string[] = []

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name}은(는) 이미지 파일이 아닙니다.`)
        return
      }
      if (file.size > maxFileSize) {
        const sizeInMB = (maxFileSize / (1024 * 1024)).toFixed(0)
        alert(`${file.name}은(는) ${sizeInMB}MB를 초과합니다.`)
        return
      }
      validFiles.push(file)
      newPreviews.push(URL.createObjectURL(file))
    })

    if (validFiles.length === 0) {
      return
    }

    const newImages = [...selectedImages, ...validFiles]
    setSelectedImages(newImages)
    setPreviews((prev) => [...prev, ...newPreviews])
    onImagesChange(newImages)

    // Reset input value to allow selecting same file again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveNewImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    setSelectedImages(newImages)

    // Revoke URL being removed
    const previewToRemove = previews[index]
    if (previewToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(previewToRemove)
    }
    setPreviews((prev) => prev.filter((_, i) => i !== index))

    onImagesChange(newImages)
  }

  const totalImages = selectedImages.length + existingImages.length
  const canAddMore = totalImages < maxImages

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>
          이미지 ({totalImages} / {maxImages})
        </Label>
        {canAddMore && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            이미지 추가
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* 기존 이미지 표시 (수정 시) - Read ONLY */}
        {existingImages.map((url, index) => (
          <div
            key={`existing-${index}`}
            className="relative aspect-square rounded-lg overflow-hidden border"
          >
            <Image
              src={url}
              alt={`기존 이미지 ${index + 1}`}
              fill
              className="object-cover opacity-80"
              sizes="(max-width: 768px) 50vw, 20vw"
            />
            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              기존
            </div>
          </div>
        ))}

        {/* 새로 선택한 이미지 미리보기 */}
        {previews.map((preview, index) => (
          <div
            key={`new-${index}`}
            className="relative aspect-square rounded-lg overflow-hidden border bg-background"
          >
            <Image src={preview} alt={`미리보기 ${index + 1}`} fill className="object-cover" />
            <button
              type="button"
              onClick={() => handleRemoveNewImage(index)}
              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-90 hover:opacity-100 transition-opacity"
              aria-label={`이미지 ${index + 1} 삭제`}
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
              신규
            </div>
          </div>
        ))}

        {/* Placeholder if empty and can add more */}
        {totalImages === 0 && canAddMore && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-lg border border-dashed flex items-center justify-center text-muted-foreground bg-muted/30 cursor-pointer hover:border-primary transition-colors"
          >
            <div className="text-center">
              <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <span className="text-xs">이미지 없음</span>
            </div>
          </div>
        )}
      </div>

      {/* 이미지 업로드 영역 (드래그 앤 드롭 스타일 placeholders) */}
      {canAddMore && totalImages === 0 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors mt-2"
        >
          <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-1">
            이미지를 클릭하거나 드래그하여 업로드
          </p>
          <p className="text-xs text-muted-foreground">
            최대 {maxFileSize / (1024 * 1024)}MB까지 업로드 가능합니다
          </p>
        </div>
      )}
    </div>
  )
}
