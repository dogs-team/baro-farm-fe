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
        const newAddress: Address = {
          ...address,
          id: nextAddressId++,
        }

        // 기본 배송지로 설정하는 경우, 다른 기본 배송지 해제
        if (newAddress.isDefault) {
          const updatedAddresses = addresses.map((addr) => ({
            ...addr,
            isDefault: false,
          }))
          set({
            addresses: [...updatedAddresses, newAddress],
            selectedAddressId: newAddress.id,
          })
        } else {
          set({
            addresses: [...addresses, newAddress],
          })
        }
      },

      updateAddress: (id, updates) => {
        const addresses = get().addresses
        const updatedAddresses = addresses.map((addr) => {
          if (addr.id === id) {
            const updated = { ...addr, ...updates }
            // 기본 배송지로 설정하는 경우, 다른 기본 배송지 해제
            if (updates.isDefault) {
              return updated
            }
            return updated
          }
          // 다른 주소의 기본 배송지 해제
          if (updates.isDefault) {
            return { ...addr, isDefault: false }
          }
          return addr
        })

        set({ addresses: updatedAddresses })
      },

      deleteAddress: (id) => {
        const addresses = get().addresses
        const filtered = addresses.filter((addr) => addr.id !== id)
        const deletedAddress = addresses.find((addr) => addr.id === id)

        // 삭제된 주소가 선택된 주소였거나 기본 주소였던 경우
        if (deletedAddress?.isDefault || get().selectedAddressId === id) {
          const newDefault = filtered.find((addr) => addr.isDefault) || filtered[0] || null
          set({
            addresses: filtered,
            selectedAddressId: newDefault?.id || null,
          })
        } else {
          set({ addresses: filtered })
        }
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
