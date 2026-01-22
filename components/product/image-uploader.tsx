'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Image as ImageIcon, Upload } from 'lucide-react'
import Image from 'next/image'

interface ImageUploaderProps {
  maxImages?: number
  onImagesChange: (images: File[]) => void
  existingImages?: string[] // 기존 이미지 URL (수정 시)
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  maxImages = 10,
  onImagesChange,
  existingImages = [],
}) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previews])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (selectedImages.length + files.length > maxImages) {
      alert(`최대 ${maxImages}개까지 업로드할 수 있습니다.`)
      return
    }

    // 파일 유효성 검사
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name}은(는) 이미지 파일이 아닙니다.`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name}은(는) 10MB를 초과합니다.`)
        return false
      }
      return true
    })

    const newImages = [...selectedImages, ...validFiles]
    setSelectedImages(newImages)
    onImagesChange(newImages)

    // 미리보기 생성
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file))
    setPreviews((prev) => [...prev, ...newPreviews])

    // Reset input value to allow selecting same file again if needed (though typically not needed with multiple)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveNewImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    setSelectedImages(newImages)

    // Revoke URL being removed
    URL.revokeObjectURL(previews[index])
    setPreviews((prev) => prev.filter((_, i) => i !== index))

    onImagesChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          이미지 선택
        </Button>
        <span className="text-sm text-muted-foreground">
          {selectedImages.length + existingImages.length} / {maxImages}
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
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
            {/* Note: Existing images cannot be individually removed in REPLACE/KEEP mode typically unless using specialized logic. 
                The guide suggests REPLACE clears ALL old images. So individual removal is not implemented here for existing images 
                unless we implement a complex 'partial update' logic not covered by 'imageUpdateMode'. 
            */}
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
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
              신규
            </div>
          </div>
        ))}

        {/* Placeholder if empty */}
        {existingImages.length === 0 && previews.length === 0 && (
          <div className="aspect-square rounded-lg border border-dashed flex items-center justify-center text-muted-foreground bg-muted/30">
            <div className="text-center">
              <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <span className="text-xs">이미지 없음</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
