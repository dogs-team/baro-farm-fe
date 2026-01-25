# 상품 이미지 업로드 기능 가이드

> 커밋 372f2f16에서 추가된 상품 이미지 업로드 기능에 대한 프론트엔드 개발 가이드

## 📋 목차

1. [변경 사항 개요](#변경-사항-개요)
2. [API 변경 사항](#api-변경-사항)
3. [이미지 업로드 방식](#이미지-업로드-방식)
4. [프롬프트 작성 가이드](#프롬프트-작성-가이드)

---

## 변경 사항 개요

### 주요 변경점

1. **상품 생성/수정 API가 multipart/form-data 지원**
   - 기존: JSON으로 `imageUrls: string[]` 전송
   - 변경: multipart/form-data로 이미지 파일 직접 업로드

2. **ProductImageService 신규 생성**
   - 이미지 업로드, 수정, 삭제 로직 분리
   - S3에 이미지 저장 및 관리

3. **이미지 업데이트 모드 추가**
   - `KEEP`: 기존 이미지 유지
   - `REPLACE`: 기존 이미지 삭제 후 새 이미지로 교체
   - `CLEAR`: 모든 이미지 삭제

4. **Request DTO 변경**
   - `ProductCreateRequest`: `imageUrls` 필드 제거
   - `ProductUpdateRequest`: `imageUrls` 필드 제거, `imageUpdateMode` 필드 추가

---

## API 변경 사항

### 1. 상품 생성 API

#### 변경 전

```
POST /api/v1/products
Content-Type: application/json

{
  "productName": "상품명",
  "description": "설명",
  "categoryId": "uuid",
  "price": 10000,
  "stockQuantity": 100,
  "productStatus": "ACTIVE",
  "imageUrls": ["https://...", "https://..."]
}
```

#### 변경 후

```
POST /api/v1/products
Content-Type: multipart/form-data

Headers:
- X-User-Id: UUID (required)
- X-User-Role: "SELLER" | "ADMIN" (required)

Form Data:
- data: JSON string
  {
    "productName": "상품명",
    "description": "설명",
    "categoryId": "uuid",
    "price": 10000,
    "stockQuantity": 100,
    "productStatus": "ACTIVE"
  }
- images: File[] (optional, 0개 이상)
```

**TypeScript 예시:**

```typescript
const formData = new FormData()

// JSON 데이터를 문자열로 변환하여 추가
formData.append(
  'data',
  JSON.stringify({
    productName: '상품명',
    description: '설명',
    categoryId: 'uuid',
    price: 10000,
    stockQuantity: 100,
    productStatus: 'ACTIVE',
  })
)

// 이미지 파일 추가 (0개 이상)
if (imageFiles && imageFiles.length > 0) {
  imageFiles.forEach((file) => {
    formData.append('images', file)
  })
}

const response = await fetch('http://localhost:8082/api/v1/products', {
  method: 'POST',
  headers: {
    'X-User-Id': userId,
    'X-User-Role': 'SELLER',
    // Content-Type은 자동으로 multipart/form-data로 설정됨 (명시하지 않음)
  },
  body: formData,
})
```

---

### 2. 상품 수정 API

#### 변경 전

```
PATCH /api/v1/products/{id}
Content-Type: application/json

{
  "productName": "상품명",
  "description": "설명",
  "categoryId": "uuid",
  "price": 10000,
  "stockQuantity": 100,
  "productStatus": "ACTIVE",
  "imageUrls": ["https://...", "https://..."]
}
```

#### 변경 후

```
PATCH /api/v1/products/{id}
Content-Type: multipart/form-data

Headers:
- X-User-Id: UUID (required)
- X-User-Role: "SELLER" | "ADMIN" (required)

Form Data:
- data: JSON string
  {
    "productName": "상품명",
    "description": "설명",
    "categoryId": "uuid",
    "price": 10000,
    "stockQuantity": 100,
    "productStatus": "ACTIVE",
    "imageUpdateMode": "KEEP" | "REPLACE" | "CLEAR"
  }
- images: File[] (optional, imageUpdateMode가 REPLACE일 때만 필요)
```

**imageUpdateMode 설명:**

- `KEEP`: 기존 이미지 유지 (images 필드 무시)
- `REPLACE`: 기존 이미지 삭제 후 새 이미지로 교체 (images 필드 필요)
- `CLEAR`: 모든 이미지 삭제 (images 필드 무시)

**TypeScript 예시:**

```typescript
const formData = new FormData()

formData.append(
  'data',
  JSON.stringify({
    productName: '상품명',
    description: '설명',
    categoryId: 'uuid',
    price: 10000,
    stockQuantity: 100,
    productStatus: 'ACTIVE',
    imageUpdateMode: 'REPLACE', // 또는 'KEEP', 'CLEAR'
  })
)

// imageUpdateMode가 REPLACE일 때만 이미지 파일 추가
if (imageUpdateMode === 'REPLACE' && imageFiles && imageFiles.length > 0) {
  imageFiles.forEach((file) => {
    formData.append('images', file)
  })
}

const response = await fetch(`http://localhost:8082/api/v1/products/${productId}`, {
  method: 'PATCH',
  headers: {
    'X-User-Id': userId,
    'X-User-Role': 'SELLER',
  },
  body: formData,
})
```

---

## 이미지 업로드 방식

### 이미지 처리 규칙

1. **이미지 형식**
   - 업로드된 이미지는 자동으로 WebP 형식으로 변환되어 S3에 저장됩니다.
   - 원본 파일 형식은 제한 없음 (JPEG, PNG 등 모두 가능)

2. **이미지 저장 위치**
   - S3 버킷의 `product/` 경로에 저장됩니다.
   - 각 이미지는 고유한 키와 URL을 가집니다.

3. **이미지 정렬**
   - 업로드된 순서대로 `sortOrder`가 자동 할당됩니다 (0부터 시작).
   - 상품 조회 시 `imageUrls` 배열에 순서대로 반환됩니다.

4. **기존 이미지 삭제**
   - `REPLACE` 모드 사용 시 기존 이미지는 자동으로 S3에서 삭제됩니다.
   - `CLEAR` 모드 사용 시 모든 이미지가 S3에서 삭제됩니다.

---

## 프롬프트 작성 가이드

### 생성형 AI에게 전달할 프롬프트 예시

```
당신은 React/TypeScript 프론트엔드 개발자입니다.
상품 생성/수정 폼에 이미지 업로드 기능을 추가해주세요.

## 프로젝트 정보
- 프레임워크: React 18 + TypeScript
- 상태 관리: React Query
- 스타일링: Tailwind CSS
- HTTP 클라이언트: axios 또는 fetch

## 구현할 기능
1. 이미지 파일 선택 (드래그 앤 드롭 또는 파일 선택)
2. 이미지 미리보기 (썸네일)
3. 이미지 순서 변경 (드래그 앤 드롭)
4. 이미지 삭제
5. multipart/form-data로 API 호출
6. 이미지 업로드 진행률 표시 (선택사항)

## API 엔드포인트

### 상품 생성 (이미지 포함)
POST /api/v1/products
Content-Type: multipart/form-data

Headers:
- X-User-Id: UUID (required)
- X-User-Role: "SELLER" | "ADMIN" (required)

Form Data:
- data: JSON string
  {
    "productName": string,
    "description": string,
    "categoryId": UUID,
    "price": number,
    "stockQuantity": number,
    "productStatus": "ACTIVE" | "INACTIVE" | "SOLD_OUT" | "DELETED"
  }
- images: File[] (optional, 0개 이상)

### 상품 수정 (이미지 포함)
PATCH /api/v1/products/{id}
Content-Type: multipart/form-data

Headers:
- X-User-Id: UUID (required)
- X-User-Role: "SELLER" | "ADMIN" (required)

Form Data:
- data: JSON string
  {
    "productName": string,
    "description": string,
    "categoryId": UUID,
    "price": number,
    "stockQuantity": number,
    "productStatus": "ACTIVE" | "INACTIVE" | "SOLD_OUT" | "DELETED",
    "imageUpdateMode": "KEEP" | "REPLACE" | "CLEAR"
  }
- images: File[] (optional, imageUpdateMode가 "REPLACE"일 때만 필요)

## 요구사항
1. TypeScript 타입 정의 포함
2. FormData를 사용한 multipart/form-data 전송
3. 이미지 파일 유효성 검사 (크기, 형식)
4. 이미지 미리보기 기능
5. 이미지 순서 변경 기능 (드래그 앤 드롭 또는 위/아래 버튼)
6. 이미지 삭제 기능
7. 로딩 상태 및 에러 처리
8. 반응형 디자인
9. 접근성 고려
10. 이미지 업로드 최대 개수 제한 (예: 10개)

## 컴포넌트 구조
- ProductForm.tsx: 메인 상품 생성/수정 폼
- ImageUploader.tsx: 이미지 업로드 컴포넌트
- ImagePreview.tsx: 이미지 미리보기 컴포넌트
- ImageThumbnail.tsx: 개별 이미지 썸네일 컴포넌트
- ImageUploadButton.tsx: 이미지 선택 버튼
```

---

### 상세 구현 예시

#### 1. FormData 생성 및 전송

```typescript
// utils/productApi.ts
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8082/api/v1'

export interface ProductCreateData {
  productName: string
  description: string
  categoryId: string
  price: number
  stockQuantity: number
  productStatus: 'ACTIVE' | 'INACTIVE' | 'SOLD_OUT' | 'DELETED'
}

export interface ProductUpdateData extends ProductCreateData {
  imageUpdateMode: 'KEEP' | 'REPLACE' | 'CLEAR'
}

export const createProduct = async (
  data: ProductCreateData,
  images: File[],
  userId: string,
  userRole: string
) => {
  const formData = new FormData()

  // JSON 데이터 추가
  formData.append('data', JSON.stringify(data))

  // 이미지 파일 추가
  if (images && images.length > 0) {
    images.forEach((file) => {
      formData.append('images', file)
    })
  }

  const response = await axios.post(`${API_BASE_URL}/products`, formData, {
    headers: {
      'X-User-Id': userId,
      'X-User-Role': userRole,
      // Content-Type은 자동으로 multipart/form-data로 설정됨
    },
  })

  return response.data
}

export const updateProduct = async (
  productId: string,
  data: ProductUpdateData,
  images: File[] | null,
  userId: string,
  userRole: string
) => {
  const formData = new FormData()

  // JSON 데이터 추가
  formData.append('data', JSON.stringify(data))

  // imageUpdateMode가 REPLACE일 때만 이미지 추가
  if (data.imageUpdateMode === 'REPLACE' && images && images.length > 0) {
    images.forEach((file) => {
      formData.append('images', file)
    })
  }

  const response = await axios.patch(`${API_BASE_URL}/products/${productId}`, formData, {
    headers: {
      'X-User-Id': userId,
      'X-User-Role': userRole,
    },
  })

  return response.data
}
```

#### 2. 이미지 업로드 컴포넌트 예시

```typescript
// components/ImageUploader.tsx
import React, { useState, useRef } from 'react';

interface ImageUploaderProps {
  maxImages?: number;
  onImagesChange: (images: File[]) => void;
  existingImages?: string[]; // 기존 이미지 URL (수정 시)
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  maxImages = 10,
  onImagesChange,
  existingImages = [],
}) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (selectedImages.length + files.length > maxImages) {
      alert(`최대 ${maxImages}개까지 업로드할 수 있습니다.`);
      return;
    }

    // 파일 유효성 검사
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name}은(는) 이미지 파일이 아닙니다.`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name}은(는) 10MB를 초과합니다.`);
        return false;
      }
      return true;
    });

    setSelectedImages((prev) => [...prev, ...validFiles]);

    // 미리보기 생성
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    onImagesChange([...selectedImages, ...validFiles]);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    onImagesChange(selectedImages.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          이미지 선택
        </button>
        <span className="text-sm text-gray-500">
          {selectedImages.length} / {maxImages}
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

      {/* 기존 이미지 표시 (수정 시) */}
      {existingImages.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {existingImages.map((url, index) => (
            <div key={`existing-${index}`} className="relative">
              <img
                src={url}
                alt={`기존 이미지 ${index + 1}`}
                className="w-full h-32 object-cover rounded"
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
            <div key={index} className="relative">
              <img
                src={preview}
                alt={`미리보기 ${index + 1}`}
                className="w-full h-32 object-cover rounded"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

#### 3. 상품 생성 폼 예시

```typescript
// components/ProductForm.tsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ImageUploader } from './ImageUploader';
import { createProduct, ProductCreateData } from '../utils/productApi';

export const ProductForm: React.FC = () => {
  const [formData, setFormData] = useState<ProductCreateData>({
    productName: '',
    description: '',
    categoryId: '',
    price: 0,
    stockQuantity: 0,
    productStatus: 'ACTIVE',
  });
  const [images, setImages] = useState<File[]>([]);

  const userId = localStorage.getItem('userId') || '';
  const userRole = localStorage.getItem('userRole') || 'SELLER';

  const mutation = useMutation({
    mutationFn: () => createProduct(formData, images, userId, userRole),
    onSuccess: () => {
      alert('상품이 생성되었습니다.');
      // 폼 초기화 또는 페이지 이동
    },
    onError: (error) => {
      alert('상품 생성에 실패했습니다.');
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label>상품명</label>
        <input
          type="text"
          value={formData.productName}
          onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
          required
        />
      </div>

      <div>
        <label>설명</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div>
        <label>가격</label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
          required
        />
      </div>

      <div>
        <label>재고</label>
        <input
          type="number"
          value={formData.stockQuantity}
          onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
          required
        />
      </div>

      <div>
        <label>이미지</label>
        <ImageUploader
          maxImages={10}
          onImagesChange={setImages}
        />
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {mutation.isPending ? '생성 중...' : '상품 생성'}
      </button>
    </form>
  );
};
```

#### 4. 상품 수정 폼 예시

```typescript
// components/ProductEditForm.tsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ImageUploader } from './ImageUploader';
import { updateProduct, ProductUpdateData } from '../utils/productApi';

interface ProductEditFormProps {
  productId: string;
  initialData: ProductUpdateData;
  existingImages: string[];
}

export const ProductEditForm: React.FC<ProductEditFormProps> = ({
  productId,
  initialData,
  existingImages,
}) => {
  const [formData, setFormData] = useState<ProductUpdateData>(initialData);
  const [images, setImages] = useState<File[]>([]);
  const [imageUpdateMode, setImageUpdateMode] = useState<'KEEP' | 'REPLACE' | 'CLEAR'>('KEEP');

  const userId = localStorage.getItem('userId') || '';
  const userRole = localStorage.getItem('userRole') || 'SELLER';

  const mutation = useMutation({
    mutationFn: () => updateProduct(
      productId,
      { ...formData, imageUpdateMode },
      imageUpdateMode === 'REPLACE' ? images : null,
      userId,
      userRole
    ),
    onSuccess: () => {
      alert('상품이 수정되었습니다.');
    },
    onError: (error) => {
      alert('상품 수정에 실패했습니다.');
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 기존 폼 필드들... */}

      <div>
        <label>이미지 변경 방식</label>
        <select
          value={imageUpdateMode}
          onChange={(e) => setImageUpdateMode(e.target.value as 'KEEP' | 'REPLACE' | 'CLEAR')}
        >
          <option value="KEEP">기존 이미지 유지</option>
          <option value="REPLACE">이미지 교체</option>
          <option value="CLEAR">모든 이미지 삭제</option>
        </select>
      </div>

      {imageUpdateMode === 'REPLACE' && (
        <div>
          <label>새 이미지</label>
          <ImageUploader
            maxImages={10}
            onImagesChange={setImages}
            existingImages={existingImages}
          />
        </div>
      )}

      {imageUpdateMode === 'CLEAR' && (
        <div className="text-yellow-600">
          ⚠️ 모든 이미지가 삭제됩니다.
        </div>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {mutation.isPending ? '수정 중...' : '상품 수정'}
      </button>
    </form>
  );
};
```

---

## 주의사항

1. **Content-Type 헤더**
   - multipart/form-data를 사용할 때는 `Content-Type` 헤더를 명시적으로 설정하지 않습니다.
   - 브라우저가 자동으로 `multipart/form-data; boundary=...` 형식으로 설정합니다.

2. **이미지 파일 크기 제한**
   - 프론트엔드에서 파일 크기를 검증하는 것이 좋습니다.
   - 권장: 10MB 이하

3. **이미지 개수 제한**
   - 프론트엔드에서 최대 개수를 제한하는 것이 좋습니다.
   - 권장: 10개 이하

4. **이미지 업데이트 모드**
   - 수정 시 `imageUpdateMode`를 반드시 설정해야 합니다.
   - `REPLACE` 모드일 때만 `images` 필드에 파일을 포함합니다.

5. **에러 처리**
   - 이미지 업로드 실패 시 적절한 에러 메시지를 표시해야 합니다.
   - 네트워크 오류, 파일 형식 오류 등을 구분하여 처리합니다.

---

## 참고

- 기존 `FRONTEND_DEVELOPMENT_GUIDE.md`의 상품 생성/수정 API 섹션도 이 가이드를 참고하여 업데이트하세요.
- Swagger UI에서 실제 API 스펙을 확인할 수 있습니다: `http://localhost:8082/swagger-ui.html`
