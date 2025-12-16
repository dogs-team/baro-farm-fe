'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  MapPin,
  Settings,
  LogOut,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAddressStore } from '@/lib/address-store'
import { AddressDialog } from '@/components/address/address-dialog'
import type { ProfileState, ProfileActions } from '../types'

interface ProfileSettingsProps {
  state: ProfileState
  actions: ProfileActions
}

export function ProfileSettings({ state, actions }: ProfileSettingsProps) {
  const { toast } = useToast()
  const { addresses, addAddress, updateAddress, deleteAddress } = useAddressStore()

  const handleSaveAddress = (addressData: Omit<import('@/lib/api/types').Address, 'id'>) => {
    if (state.editingAddressId) {
      updateAddress(state.editingAddressId, addressData)
      toast({
        title: '배송지가 수정되었습니다',
      })
    } else {
      addAddress(addressData)
      toast({
        title: '배송지가 추가되었습니다',
      })
    }
    actions.setEditingAddressId(null)
    actions.setIsAddressDialogOpen(false)
  }

  const handleEditAddress = (id: number) => {
    actions.setEditingAddressId(id)
    actions.setIsAddressDialogOpen(true)
  }

  const handleDeleteAddress = (id: number) => {
    deleteAddress(id)
    toast({
      title: '배송지가 삭제되었습니다',
    })
  }

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">프로필 정보</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              defaultValue={state.user.name || state.user.email?.split('@')[0] || ''}
              className="mt-1"
              disabled
            />
            <p className="text-xs text-muted-foreground mt-1">
              이름은 이메일에서 자동으로 추출됩니다.
            </p>
          </div>
          <div>
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              defaultValue={state.user.email}
              className="mt-1"
              disabled
            />
            <p className="text-xs text-muted-foreground mt-1">이메일은 변경할 수 없습니다.</p>
          </div>
          {state.user.phone && (
            <div>
              <Label htmlFor="phone">전화번호</Label>
              <Input id="phone" defaultValue={state.user.phone} className="mt-1" disabled />
            </div>
          )}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              프로필 정보 수정 기능은 추후 추가 예정입니다.
            </p>
          </div>
        </div>
      </Card>

      {/* Delivery Addresses */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">배송지 관리</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              actions.setEditingAddressId(addresses.length > 0 ? addresses[0].id : null)
              actions.setIsAddressDialogOpen(true)
            }}
          >
            <MapPin className="h-4 w-4 mr-2" />
            {addresses.length > 0 ? '배송지 수정' : '배송지 등록'}
          </Button>
        </div>
        <div className="space-y-4">
          {addresses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              등록된 배송지가 없습니다
              <br />
              <span className="text-xs">
                배송지는 1개만 등록 가능하며 기본 배송지로 설정됩니다.
              </span>
            </div>
          ) : (
            addresses.map((address) => (
              <div
                key={address.id}
                className="p-4 border rounded-lg flex items-start justify-between hover:bg-muted/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{address.name}</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      기본 배송지
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>{address.phone}</div>
                    <div>
                      [{address.zipCode}] {address.address} {address.detailAddress}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditAddress(address.id)}
                  >
                    수정
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteAddress(address.id)}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Payment Methods - 숨김 처리 */}
      {/* <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">결제 수단</h2>
          <Button variant="outline" size="sm">
            <CreditCard className="h-4 w-4 mr-2" />
            결제 수단 추가
          </Button>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          등록된 결제 수단이 없습니다
        </div>
      </Card> */}

      {/* Account Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">계정 관리</h2>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            비밀번호 변경
          </Button>
          <Button
            variant="destructive"
            className="w-full justify-start"
            onClick={() => {
              // TODO: 로그아웃 로직을 ProfileContainer로 이동
              console.log('로그아웃 버튼 클릭됨')
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            로그아웃
          </Button>
        </div>
      </Card>

      {/* 배송지 추가/수정 다이얼로그 */}
      <AddressDialog
        open={state.isAddressDialogOpen}
        onOpenChange={actions.setIsAddressDialogOpen}
        address={
          state.editingAddressId ? addresses.find((addr) => addr.id === state.editingAddressId) || null : null
        }
        onSave={handleSaveAddress}
      />
    </div>
  )
}