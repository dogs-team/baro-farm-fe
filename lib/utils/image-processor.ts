import imageCompression from 'browser-image-compression'

/**
 * 이미지 처리 옵션
 */
export interface ImageProcessOptions {
  /**
   * 최대 파일 크기 (MB)
   * @default 2 (WebP 형식이므로 실제로는 대부분 1MB 이하로 압축됨)
   */
  maxSizeMB?: number
  /**
   * 최대 너비 또는 높이 (px)
   * @default 1920 (대부분의 화면에서 충분한 해상도)
   */
  maxWidthOrHeight?: number
  /**
   * 이미지 품질 (0-1)
   * @default 0.85 (WebP 효율성을 고려한 균형잡힌 품질)
   */
  quality?: number
  /**
   * WebP 형식으로 변환할지 여부
   * @default true
   */
  useWebWorker?: boolean
  /**
   * WebP 형식으로 변환할지 여부
   * @default true
   */
  convertToWebP?: boolean
  /**
   * 초기 파일 크기 (압축 전)
   */
  initialFileSize?: number
}

/**
 * 이미지 처리 결과
 */
export interface ImageProcessResult {
  /**
   * 처리된 파일
   */
  file: File
  /**
   * 원본 파일 크기 (bytes)
   */
  originalSize: number
  /**
   * 처리된 파일 크기 (bytes)
   */
  processedSize: number
  /**
   * 압축률 (%)
   */
  compressionRatio: number
  /**
   * 파일 형식
   */
  format: string
}

/**
 * 이미지를 WebP 형식으로 변환
 * @param file - 원본 이미지 파일
 * @returns WebP 형식의 파일
 */
async function convertToWebPFile(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context를 가져올 수 없습니다.'))
          return
        }
        ctx.drawImage(img, 0, 0)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('WebP 변환 실패'))
              return
            }
            const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
              type: 'image/webp',
              lastModified: Date.now(),
            })
            resolve(webpFile)
          },
          'image/webp',
          0.9 // WebP 품질
        )
      }
      img.onerror = () => reject(new Error('이미지 로드 실패'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('파일 읽기 실패'))
    reader.readAsDataURL(file)
  })
}

/**
 * 이미지 파일을 압축하고 최적화
 * @param file - 원본 이미지 파일
 * @param options - 처리 옵션
 * @returns 처리된 이미지 파일 및 메타데이터
 */
export async function processImage(
  file: File,
  options: ImageProcessOptions = {}
): Promise<ImageProcessResult> {
  const {
    maxSizeMB = 2, // WebP 형식이므로 기본값을 2MB로 설정 (실제로는 대부분 1MB 이하)
    maxWidthOrHeight = 1920, // 대부분의 화면에서 충분한 해상도
    quality = 0.85, // WebP 효율성을 고려한 균형잡힌 품질
    useWebWorker = true,
    convertToWebP = true,
  } = options

  const originalSize = file.size
  const originalFormat = file.type

  try {
    // 1. 이미지 압축
    const compressionOptions = {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker,
      fileType: convertToWebP ? ('image/webp' as const) : undefined,
      initialQuality: quality,
    }

    let processedFile = await imageCompression(file, compressionOptions)

    // 2. WebP 변환이 요청되었고 아직 WebP가 아닌 경우
    if (convertToWebP && processedFile.type !== 'image/webp') {
      try {
        processedFile = await convertToWebPFile(processedFile)
      } catch (error) {
        console.warn('WebP 변환 실패, 원본 형식 유지:', error)
        // WebP 변환 실패 시 압축된 파일 사용
      }
    }

    // 3. 파일명 업데이트 (WebP인 경우)
    if (processedFile.type === 'image/webp' && !processedFile.name.endsWith('.webp')) {
      processedFile = new File([processedFile], processedFile.name.replace(/\.[^/.]+$/, '.webp'), {
        type: 'image/webp',
        lastModified: Date.now(),
      })
    }

    const processedSize = processedFile.size
    const compressionRatio = ((originalSize - processedSize) / originalSize) * 100

    return {
      file: processedFile,
      originalSize,
      processedSize,
      compressionRatio: Math.round(compressionRatio * 100) / 100,
      format: processedFile.type,
    }
  } catch (error) {
    console.error('이미지 처리 실패:', error)
    // 처리 실패 시 원본 파일 반환
    return {
      file,
      originalSize,
      processedSize: originalSize,
      compressionRatio: 0,
      format: originalFormat,
    }
  }
}

/**
 * 여러 이미지 파일을 일괄 처리
 * @param files - 원본 이미지 파일 배열
 * @param options - 처리 옵션
 * @returns 처리된 이미지 파일 및 메타데이터 배열
 */
export async function processImages(
  files: File[],
  options: ImageProcessOptions = {}
): Promise<ImageProcessResult[]> {
  const results = await Promise.all(files.map((file) => processImage(file, options)))
  return results
}

/**
 * 이미지 파일인지 확인
 * @param file - 확인할 파일
 * @returns 이미지 파일 여부
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

/**
 * 지원되는 이미지 형식인지 확인
 * @param file - 확인할 파일
 * @returns 지원 여부
 */
export function isSupportedImageFormat(file: File): boolean {
  const supportedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/svg+xml',
  ]
  return supportedTypes.includes(file.type.toLowerCase())
}

/**
 * 파일 크기를 사람이 읽기 쉬운 형식으로 변환
 * @param bytes - 바이트 크기
 * @returns 포맷된 크기 문자열
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
