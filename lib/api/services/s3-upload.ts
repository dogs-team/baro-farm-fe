import { experienceApi } from '../client'

/**
 * Presigned URL 방식 S3 업로드
 *
 * 프론트엔드에서는 AWS SDK를 직접 사용하지 않고,
 * 백엔드에서 받은 Presigned URL로 fetch를 통해 직접 업로드합니다.
 */

export interface PresignedUrlResponse {
  presignedUrl: string
  fileKey: string
  url: string // 최종 접근 URL
  expiresIn: number // 만료 시간 (초)
}

export interface PresignedUrlRequest {
  fileName: string
  contentType: string
  type?: string // 'experience' | 'farm' | 'product' | 'profile' | 'review'
}

export interface S3UploadResponse {
  success: boolean
  fileName: string
  url: string
  size: number
  type: string
  fileKey: string
}

/**
 * Presigned URL 방식 S3 업로드 서비스
 *
 * 아키텍처:
 * 1. 백엔드에서 Presigned URL 요청 (파일명, 타입 등)
 * 2. 백엔드가 Presigned URL 반환
 * 3. 프론트엔드에서 S3로 직접 업로드
 * 4. (선택) 업로드 완료 후 백엔드에 메타데이터 저장
 */
export const s3UploadService = {
  /**
   * Presigned URL 요청 (백엔드 API)
   * @param request - 파일 정보
   * @returns Presigned URL 및 파일 정보
   */
  async getPresignedUrl(request: PresignedUrlRequest): Promise<PresignedUrlResponse> {
    const response = await experienceApi.post<PresignedUrlResponse>(
      '/api/v1/files/presigned-url',
      request
    )
    return response
  },

  /**
   * S3에 파일 직접 업로드 (Presigned URL 사용)
   * @param file - 업로드할 파일
   * @param presignedUrl - Presigned URL
   * @param contentType - 파일 MIME 타입
   * @returns 업로드 성공 여부
   */
  async uploadToS3(file: File, presignedUrl: string, contentType: string): Promise<void> {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: file,
    })

    if (!response.ok) {
      throw new Error(`S3 업로드 실패: ${response.status} ${response.statusText}`)
    }
  },

  /**
   * 단일 파일 업로드 (Presigned URL 방식)
   * @param file - 업로드할 파일
   * @param type - 파일 타입 (experience, farm, product, profile 등)
   * @returns 업로드된 파일 정보
   */
  async uploadFile(file: File, type?: string): Promise<S3UploadResponse> {
    // 1. Presigned URL 요청
    const presignedResponse = await this.getPresignedUrl({
      fileName: file.name,
      contentType: file.type,
      type,
    })

    // 2. S3에 직접 업로드
    await this.uploadToS3(file, presignedResponse.presignedUrl, file.type)

    // 3. 응답 반환
    return {
      success: true,
      fileName: file.name,
      url: presignedResponse.url,
      size: file.size,
      type: file.type,
      fileKey: presignedResponse.fileKey,
    }
  },

  /**
   * 여러 파일 업로드 (Presigned URL 방식)
   * @param files - 업로드할 파일 배열
   * @param type - 파일 타입
   * @returns 업로드된 파일 정보 배열
   */
  async uploadMultipleFiles(
    files: File[],
    type?: string
  ): Promise<{
    success: boolean
    files: Array<{
      fileName: string
      url: string
      size: number
      type: string
      fileKey: string
    }>
    count: number
  }> {
    const uploadPromises = files.map((file) => this.uploadFile(file, type))

    const results = await Promise.all(uploadPromises)

    return {
      success: true,
      files: results.map((result) => ({
        fileName: result.fileName,
        url: result.url,
        size: result.size,
        type: result.type,
        fileKey: result.fileKey,
      })),
      count: results.length,
    }
  },

  /**
   * 체험 이미지 업로드
   */
  async uploadExperienceImage(file: File): Promise<S3UploadResponse> {
    return this.uploadFile(file, 'experience')
  },

  /**
   * 농장 이미지 업로드
   */
  async uploadFarmImage(file: File): Promise<S3UploadResponse> {
    return this.uploadFile(file, 'farm')
  },

  /**
   * 상품 이미지 업로드
   */
  async uploadProductImages(files: File[]): Promise<{
    success: boolean
    files: Array<{
      fileName: string
      url: string
      size: number
      type: string
      fileKey: string
    }>
    count: number
  }> {
    return this.uploadMultipleFiles(files, 'product')
  },

  /**
   * 프로필 이미지 업로드
   */
  async uploadProfileImage(file: File): Promise<S3UploadResponse> {
    return this.uploadFile(file, 'profile')
  },
}
