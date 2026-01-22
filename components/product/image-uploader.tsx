'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

  // 미리보기 URL 정리
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

    if (selectedImages.length + files.length > maxImages) {
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

    setSelectedImages((prev) => [...prev, ...validFiles])
    setPreviews((prev) => [...prev, ...newPreviews])
    onImagesChange([...selectedImages, ...validFiles])

    // input 초기화 (같은 파일을 다시 선택할 수 있도록)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = (index: number) => {
    // 미리보기 URL 정리
    const previewToRemove = previews[index]
    if (previewToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(previewToRemove)
    }

    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
    const newImages = selectedImages.filter((_, i) => i !== index)
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
          >
            <ImageIcon className="h-4 w-4 mr-2" />
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

      {/* 기존 이미지 표시 (수정 시) */}
      {existingImages.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {existingImages.map((url, index) => (
            <div
              key={`existing-${index}`}
              className="relative aspect-square rounded-lg overflow-hidden border"
            >
              <img
                src={url}
                alt={`기존 이미지 ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                기존
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 새로 선택한 이미지 미리보기 */}
      {previews.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div
              key={`preview-${index}`}
              className="relative aspect-square rounded-lg overflow-hidden border"
            >
              <img
                src={preview}
                alt={`미리보기 ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs hover:bg-destructive/90"
                aria-label={`이미지 ${index + 1} 삭제`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 이미지 업로드 영역 (드래그 앤 드롭) */}
      {canAddMore && (
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
            accept={accept}
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </label>
      )}

      {!canAddMore && (
        <p className="text-sm text-muted-foreground text-center">
          최대 {maxImages}개의 이미지만 업로드할 수 있습니다.
        </p>
      )}
    </div>
  )
}
