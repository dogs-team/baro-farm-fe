import { buyerApi } from '../client'
import type { Address } from '../types'

export interface CreateAddressRequest {
  name: string
  phone: string
  zipCode: string
  address: string
  detailAddress: string
  isDefault?: boolean
}

export interface UpdateAddressRequest {
  name?: string
  phone?: string
  zipCode?: string
  address?: string
  detailAddress?: string
  isDefault?: boolean
}

export const addressService = {
  // 주소 목록 조회 (Buyer Service - Product와 동일한 패턴 적용)
  async getAddresses(): Promise<Address[]> {
    return buyerApi.get<Address[]>('/api/addresses')
  },

  // 주소 상세 조회
  async getAddress(id: number): Promise<Address> {
    return buyerApi.get<Address>(`/api/addresses/${id}`)
  },

  // 주소 생성
  async createAddress(data: CreateAddressRequest): Promise<Address> {
    return buyerApi.post<Address>('/api/addresses', data)
  },

  // 주소 수정
  async updateAddress(id: number, data: UpdateAddressRequest): Promise<Address> {
    return buyerApi.patch<Address>(`/api/addresses/${id}`, data)
  },

  // 주소 삭제
  async deleteAddress(id: number): Promise<void> {
    return buyerApi.delete(`/api/addresses/${id}`)
  },

  // 기본 주소 설정
  async setDefaultAddress(id: number): Promise<Address> {
    return buyerApi.patch<Address>(`/api/addresses/${id}/default`, {})
  },
}
