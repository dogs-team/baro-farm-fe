import { experienceApi } from '../client'
import { s3UploadService } from './s3-upload'

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
    const formData = new FormData()
    formData.append('file', file)
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
    const formData = new FormData()
    files.forEach((file) => {
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
