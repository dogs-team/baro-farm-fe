import { experienceApi } from '../client'

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

export const uploadService = {
  /**
   * 단일 파일 업로드 (백엔드 API 사용)
   * @param file - 업로드할 파일
   * @param type - 파일 타입 (experience, farm, product, profile 등)
   * @returns 업로드된 파일 정보
   */
  async uploadFile(file: File, type?: string): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    if (type) {
      formData.append('type', type)
    }

    // 백엔드 API로 전송 (Support Service)
    const response = await experienceApi.post<UploadResponse>('/api/v1/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response
  },

  /**
   * 여러 파일 업로드 (백엔드 API 사용)
   * @param files - 업로드할 파일 배열
   * @param type - 파일 타입
   * @returns 업로드된 파일 정보 배열
   */
  async uploadMultipleFiles(files: File[], type?: string): Promise<MultipleUploadResponse> {
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
