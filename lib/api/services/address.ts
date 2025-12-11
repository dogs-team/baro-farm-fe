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
  async getAddresses(): Promise<Address[]> {
    return buyerApi.get<Address[]>('/api/addresses')
  },

  async getAddress(id: number): Promise<Address> {
    return buyerApi.get<Address>(`/api/addresses/${id}`)
  },

  async createAddress(data: CreateAddressRequest): Promise<Address> {
    return buyerApi.post<Address>('/api/addresses', data)
  },

  async updateAddress(id: number, data: UpdateAddressRequest): Promise<Address> {
    return buyerApi.patch<Address>(`/api/addresses/${id}`, data)
  },

  async deleteAddress(id: number): Promise<void> {
    return buyerApi.delete(`/api/addresses/${id}`)
  },

  async setDefaultAddress(id: number): Promise<Address> {
    return buyerApi.patch<Address>(`/api/addresses/${id}/default`, {})
  },
}
