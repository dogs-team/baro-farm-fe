'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Address } from '@/lib/api/types'

interface AddressStore {
  addresses: Address[]
  selectedAddressId: number | null
  addAddress: (address: Omit<Address, 'id'>) => void
  updateAddress: (id: number, address: Partial<Address>) => void
  deleteAddress: (id: number) => void
  setDefaultAddress: (id: number) => void
  selectAddress: (id: number | null) => void
  getDefaultAddress: () => Address | null
  getSelectedAddress: () => Address | null
}

let nextAddressId = 1

export const useAddressStore = create<AddressStore>()(
  persist(
    (set, get) => ({
      addresses: [],
      selectedAddressId: null,

      addAddress: (address) => {
        const addresses = get().addresses

        // 배송지는 1개만 등록 가능 - 기존 주소가 있으면 업데이트, 없으면 추가
        if (addresses.length > 0) {
          // 기존 주소를 업데이트 (항상 기본 배송지로 설정)
          const existingAddress = addresses[0]
          const updatedAddress: Address = {
            ...address,
            id: existingAddress.id,
            isDefault: true, // 항상 기본 배송지로 설정
          }
          set({
            addresses: [updatedAddress],
            selectedAddressId: updatedAddress.id,
          })
        } else {
          // 첫 번째 주소 추가 (항상 기본 배송지로 설정)
          const newAddress: Address = {
            ...address,
            id: nextAddressId++,
            isDefault: true, // 항상 기본 배송지로 설정
          }
          set({
            addresses: [newAddress],
            selectedAddressId: newAddress.id,
          })
        }
      },

      updateAddress: (id, updates) => {
        const addresses = get().addresses
        const updatedAddresses = addresses.map((addr) => {
          if (addr.id === id) {
            // 업데이트 시 항상 기본 배송지로 유지
            return { ...addr, ...updates, isDefault: true }
          }
          return addr
        })

        set({ addresses: updatedAddresses })
      },

      deleteAddress: (id) => {
        const addresses = get().addresses
        const filtered = addresses.filter((addr) => addr.id !== id)

        set({
          addresses: filtered,
          selectedAddressId: filtered.length > 0 ? filtered[0].id : null,
        })
      },

      setDefaultAddress: (id) => {
        const addresses = get().addresses
        const updatedAddresses = addresses.map((addr) => ({
          ...addr,
          isDefault: addr.id === id,
        }))
        set({
          addresses: updatedAddresses,
          selectedAddressId: id,
        })
      },

      selectAddress: (id) => {
        set({ selectedAddressId: id })
      },

      getDefaultAddress: () => {
        const addresses = get().addresses
        return addresses.find((addr) => addr.isDefault) || addresses[0] || null
      },

      getSelectedAddress: () => {
        const addresses = get().addresses
        const selectedId = get().selectedAddressId
        if (selectedId) {
          return addresses.find((addr) => addr.id === selectedId) || null
        }
        return get().getDefaultAddress()
      },
    }),
    {
      name: 'barofarm-addresses',
    }
  )
)
