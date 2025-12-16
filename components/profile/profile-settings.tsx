'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Settings, LogOut, MapPin } from 'lucide-react'
import { useAddressStore } from '@/lib/address-store'
import { AddressDialog } from '@/components/address/address-dialog'
import { useToast } from '@/hooks/use-toast'

interface User {
  name: string
  email: string
  phone: string
}

interface ProfileSettingsProps {
  user: User
  onLogout: () => void
}

export function ProfileSettings({ user, onLogout }: ProfileSettingsProps) {
  const { toast } = useToast()
  const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } =
    useAddressStore()
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null)

  const handleSaveAddress = (addressData: Omit<import('@/lib/api/types').Address, 'id'>) => {
    if (editingAddressId) {
      updateAddress(editingAddressId, addressData)
      toast({
        title: '배송지가 수정되었습니다',
      })
    } else {
      addAddress(addressData)
      toast({
        title: '배송지가 추가되었습니다',
      })
    }
    setEditingAddressId(null)
    setIsAddressDialogOpen(false)
  }

  const handleEditAddress = (id: number) => {
    setEditingAddressId(id)
    setIsAddressDialogOpen(true)
  }

  const handleDeleteAddress = (id: number) => {
    deleteAddress(id)
    toast({
      title: '배송지가 삭제되었습니다',
    })
  }

  const handleSetDefaultAddress = (id: number) => {
    setDefaultAddress(id)
    toast({
      title: '기본 배송지로 설정되었습니다',
    })
  }

  return (
    <div className="space-y-8">
      {/* Profile Info */}
      <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">프로필 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium">
                이름
              </Label>
              <Input id="name" defaultValue={user.name} className="h-9 text-sm" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm font-medium">
                이메일
              </Label>
              <Input id="email" type="email" defaultValue={user.email} className="h-9 text-sm" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                전화번호
              </Label>
              <Input id="phone" defaultValue={user.phone} className="h-9 text-sm" />
            </div>
          </div>
          <div className="flex items-end justify-start md:justify-end">
            <Button className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-medium px-6 h-9 text-sm">
              저장
            </Button>
          </div>
        </div>
      </Card>

      {/* Delivery Addresses */}
      <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">배송지 관리</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingAddressId(addresses.length > 0 ? addresses[0].id : null)
              setIsAddressDialogOpen(true)
            }}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <MapPin className="h-4 w-4 mr-2" />
            {addresses.length > 0 ? '배송지 수정' : '배송지 등록'}
          </Button>
        </div>
        <div className="space-y-4">
          {addresses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-[#F9FAF8] dark:bg-gray-900/50 rounded-lg">
              <p className="text-base mb-2 font-medium text-gray-900 dark:text-white">
                등록된 배송지가 없습니다
              </p>
              <p className="text-sm text-gray-500">
                배송지는 1개만 등록 가능하며 기본 배송지로 설정됩니다.
              </p>
            </div>
          ) : (
            addresses.map((address) => (
              <div
                key={address.id}
                className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg flex flex-col sm:flex-row items-start justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      {address.name}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 bg-[#F0FDF4] text-[#22C55E] border-none"
                    >
                      기본
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground font-normal">
                    <div className="text-gray-700 dark:text-gray-300 mb-0.5">{address.phone}</div>
                    <div className="text-gray-500">
                      [{address.zipCode}] {address.address} {address.detailAddress}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditAddress(address.id)}
                    className="flex-1 sm:flex-none h-8 text-xs border-gray-200"
                  >
                    수정
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAddress(address.id)}
                    className="flex-1 sm:flex-none h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    삭제
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Payment Methods */}
      <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">결제 수단</h2>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            결제 수단 추가
          </Button>
        </div>
        <div className="text-center py-10 text-muted-foreground text-sm bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          등록된 결제 수단이 없습니다
        </div>
      </Card>

      {/* Account Actions */}
      <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">계정 관리</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <Button
            variant="outline"
            className="justify-start h-10 text-sm font-medium border-gray-200 dark:border-gray-800"
          >
            <Settings className="h-4 w-4 mr-2" />
            비밀번호 변경
          </Button>
          <Button
            variant="ghost"
            className="justify-start h-10 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 border border-transparent hover:border-red-100"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            로그아웃
          </Button>
        </div>
      </Card>

      <AddressDialog
        open={isAddressDialogOpen}
        onOpenChange={setIsAddressDialogOpen}
        address={
          editingAddressId ? addresses.find((addr) => addr.id === editingAddressId) || null : null
        }
        onSave={handleSaveAddress}
      />
    </div>
  )
}
