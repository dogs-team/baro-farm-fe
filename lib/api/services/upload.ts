import { experienceApi } from '../client'
import { s3UploadService } from './s3-upload'
import { processImage, isImageFile } from '@/lib/utils/image-processor'

export interface UploadResponse {
  success: boolean
  fileName: string
  url: string
  size: number
  type: string
}

export interface MultipleUploadResponse {
  success: boolean
  files: Array<{
    fileName: string
    url: string
    size: number
    type: string
  }>
  count: number
}

/**
 * 업로드 서비스
 *
 * 기본적으로 Presigned URL 방식을 사용합니다 (프론트엔드 → S3 직접 업로드).
 * 백엔드 프록시 방식이 필요한 경우 useBackendProxy 옵션을 사용하세요.
 */
export const uploadService = {
  /**
   * 단일 파일 업로드 (Presigned URL 방식 - 기본)
   * @param file - 업로드할 파일
   * @param type - 파일 타입 (experience, farm, product, profile 등)
   * @param useBackendProxy - 백엔드 프록시 방식 사용 여부 (기본: false)
   * @returns 업로드된 파일 정보
   */
  async uploadFile(
    file: File,
    type?: string,
    useBackendProxy: boolean = false
  ): Promise<UploadResponse> {
    // Presigned URL 방식 (기본)
    if (!useBackendProxy) {
      const result = await s3UploadService.uploadFile(file, type)
      return {
        success: result.success,
        fileName: result.fileName,
        url: result.url,
        size: result.size,
        type: result.type,
      }
    }

    // 백엔드 프록시 방식 (레거시 지원)
    // 이미지 파일인 경우 전처리
    let processedFile = file
    if (isImageFile(file)) {
      try {
        const result = await processImage(file, {
          maxSizeMB: 2, // WebP 형식이므로 2MB로 설정해도 실제로는 대부분 1MB 이하
          maxWidthOrHeight: 1920, // 1920px는 대부분의 화면에서 충분한 해상도
          quality: 0.85, // 0.8보다 높은 품질로 설정 (WebP 효율성 고려)
          convertToWebP: true,
          useWebWorker: true,
        })
        processedFile = result.file
      } catch (error) {
        console.warn('이미지 처리 실패, 원본 파일 사용:', error)
        // 처리 실패 시 원본 파일 사용
      }
    }

    const formData = new FormData()
    formData.append('file', processedFile)
    if (type) {
      formData.append('type', type)
    }

    const response = await experienceApi.post<UploadResponse>('/api/v1/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response
  },

  /**
   * 여러 파일 업로드 (Presigned URL 방식 - 기본)
   * @param files - 업로드할 파일 배열
   * @param type - 파일 타입
   * @param useBackendProxy - 백엔드 프록시 방식 사용 여부 (기본: false)
   * @returns 업로드된 파일 정보 배열
   */
  async uploadMultipleFiles(
    files: File[],
    type?: string,
    useBackendProxy: boolean = false
  ): Promise<MultipleUploadResponse> {
    // Presigned URL 방식 (기본)
    if (!useBackendProxy) {
      const result = await s3UploadService.uploadMultipleFiles(files, type)
      return {
        success: result.success,
        files: result.files.map((f) => ({
          fileName: f.fileName,
          url: f.url,
          size: f.size,
          type: f.type,
        })),
        count: result.count,
      }
    }

    // 백엔드 프록시 방식 (레거시 지원)
    // 이미지 파일들 전처리
    const processedFiles = await Promise.all(
      files.map(async (file) => {
        if (isImageFile(file)) {
          try {
            const result = await processImage(file, {
              maxSizeMB: 2, // WebP 형식이므로 2MB로 설정해도 실제로는 대부분 1MB 이하
              maxWidthOrHeight: 1920, // 1920px는 대부분의 화면에서 충분한 해상도
              quality: 0.85, // 0.8보다 높은 품질로 설정 (WebP 효율성 고려)
              convertToWebP: true,
              useWebWorker: true,
            })
            return result.file
          } catch (error) {
            console.warn('이미지 처리 실패, 원본 파일 사용:', error)
            return file
          }
        }
        return file
      })
    )

    const formData = new FormData()
    processedFiles.forEach((file) => {
      formData.append('files', file)
    })
    if (type) {
      formData.append('type', type)
    }

    const response = await experienceApi.post<MultipleUploadResponse>(
      '/api/v1/files/upload/multiple',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    return response
  },

  /**
   * 체험 이미지 업로드
   * @param file - 업로드할 파일
   * @returns 업로드된 파일 정보
   */
  async uploadExperienceImage(file: File): Promise<UploadResponse> {
    return this.uploadFile(file, 'experience')
  },

  /**
   * 농장 이미지 업로드
   * @param file - 업로드할 파일
   * @returns 업로드된 파일 정보
   */
  async uploadFarmImage(file: File): Promise<UploadResponse> {
    return this.uploadFile(file, 'farm')
  },

  /**
   * 상품 이미지 업로드
   * @param files - 업로드할 파일 배열
   * @returns 업로드된 파일 정보 배열
   */
  async uploadProductImages(files: File[]): Promise<MultipleUploadResponse> {
    return this.uploadMultipleFiles(files, 'product')
  },

  /**
   * 프로필 이미지 업로드
   * @param file - 업로드할 파일
   * @returns 업로드된 파일 정보
   */
  async uploadProfileImage(file: File): Promise<UploadResponse> {
    return this.uploadFile(file, 'profile')
  },

  /**
   * 파일 삭제
   * @param fileUrl - 삭제할 파일 URL
   */
  async deleteFile(fileUrl: string): Promise<void> {
    await experienceApi.delete('/api/v1/files', {
      params: { url: fileUrl },
    })
  },
}
