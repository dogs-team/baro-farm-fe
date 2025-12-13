'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import type { Address } from '@/lib/api/types'

interface AddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  address?: Address | null
  onSave: (address: Omit<Address, 'id'>) => void
}

export function AddressDialog({ open, onOpenChange, address, onSave }: AddressDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    zipCode: '',
    address: '',
    detailAddress: '',
    isDefault: false,
  })

  useEffect(() => {
    if (address) {
      setFormData({
        name: address.name,
        phone: address.phone,
        zipCode: address.zipCode,
        address: address.address,
        detailAddress: address.detailAddress,
        isDefault: address.isDefault,
      })
    } else {
      setFormData({
        name: '',
        phone: '',
        zipCode: '',
        address: '',
        detailAddress: '',
        isDefault: false,
      })
    }
  }, [address, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.phone || !formData.zipCode || !formData.address) {
      return
    }

    onSave(formData)
    onOpenChange(false)
  }

  const handleAddressSearch = () => {
    // 다음 주소 API 호출
    if (typeof window !== 'undefined' && (window as any).daum?.Postcode) {
      new (window as any).daum.Postcode({
        oncomplete: (data: any) => {
          setFormData((prev) => ({
            ...prev,
            zipCode: data.zonecode,
            address: data.address,
          }))
        },
      }).open()
    } else {
      // 다음 주소 API 스크립트 동적 로드
      const script = document.createElement('script')
      script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
      script.onload = () => {
        new (window as any).daum.Postcode({
          oncomplete: (data: any) => {
            setFormData((prev) => ({
              ...prev,
              zipCode: data.zonecode,
              address: data.address,
            }))
          },
        }).open()
      }
      document.body.appendChild(script)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{address ? '배송지 수정' : '배송지 추가'}</DialogTitle>
          <DialogDescription>배송지 정보를 입력해주세요.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">배송지명 *</Label>
              <Input
                id="name"
                placeholder="예: 집, 회사"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">받는 분 연락처 *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="010-1234-5678"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-1 space-y-2">
                <Label htmlFor="zipCode">우편번호 *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData((prev) => ({ ...prev, zipCode: e.target.value }))}
                  required
                />
              </div>
              <div className="md:col-span-3 flex items-end">
                <Button type="button" variant="outline" onClick={handleAddressSearch}>
                  주소 검색
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">주소 *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="detailAddress">상세 주소</Label>
              <Input
                id="detailAddress"
                value={formData.detailAddress}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, detailAddress: e.target.value }))
                }
              />
            </div>

            <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              배송지는 1개만 등록 가능하며 기본 배송지로 자동 설정됩니다.
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit">저장</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
