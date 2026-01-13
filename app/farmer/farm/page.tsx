'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Sprout,
  MapPin,
  Phone,
  Mail,
  Image as ImageIcon,
  Save,
  Settings,
  LogOut,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { FarmerNav } from '../components/farmer-nav'
import { farmService } from '@/lib/api/services/farm'
import { uploadService } from '@/lib/api/services/upload'
import type { Farm } from '@/lib/api/types'
import { X } from 'lucide-react'

interface FarmFormData {
  id?: string
  name: string
  description: string
  address: string
  phone: string
  email: string
  businessNumber: string
  certifications: string[]
  operatingHours: string
  parkingAvailable: boolean
  facilities: string[]
}

export default function FarmManagementPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isNewFarm, setIsNewFarm] = useState(false)
  const [myFarms, setMyFarms] = useState<Farm[]>([])
  const [selectedFarmId, setSelectedFarmId] = useState<string | 'new' | null>(null)
  const [farmData, setFarmData] = useState<FarmFormData>({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    businessNumber: '',
    certifications: [],
    operatingHours: '',
    parkingAvailable: true,
    facilities: [],
  })
  const [farmImage, setFarmImage] = useState<File | null>(null)
  const [farmImageUrl, setFarmImageUrl] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 내 농장 목록 조회
  useEffect(() => {
    const fetchMyFarms = async () => {
      if (!mounted) return

      setIsLoading(true)
      try {
        const response = await farmService.getMyFarms({ page: 0, size: 20 })
        const content = Array.isArray(response?.content) ? response.content : []
        setMyFarms(content)

        if (content.length > 0) {
          // 기본 선택: 첫 번째 농장
          const first = content[0]
          setSelectedFarmId(first.id)
          setFarmData({
            id: first.id,
            name: (first as any).name || '',
            description: (first as any).description || '',
            address: (first as any).address || '',
            phone: (first as any).phone || '',
            email: (first as any).email || '',
            businessNumber: (first as any).businessNumber || '',
            certifications: (first as any).certifications || [],
            operatingHours: (first as any).operatingHours || '',
            parkingAvailable: (first as any).parkingAvailable ?? true,
            facilities: (first as any).facilities || [],
          })
          setIsNewFarm(false)
          setIsEditing(false)
        } else {
          // 등록된 농장이 없으면 신규 등록 모드
          setIsNewFarm(true)
          setSelectedFarmId('new')
          setIsEditing(true)
        }
      } catch (error: any) {
        console.error('내 농장 목록 조회 실패:', error)
        toast({
          title: '농장 정보 조회 실패',
          description: error?.message || '농장 정보를 불러오지 못했습니다.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMyFarms()
  }, [mounted, toast])

  const handleSave = async () => {
    if (!farmData.name || !farmData.address) {
      toast({
        title: '필수 항목 입력',
        description: '농장명과 주소는 필수 입력 항목입니다.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      // 농장 이미지 업로드 (있는 경우) - uploadService가 자동으로 압축 처리
      let uploadedImageUrl: string | null = null
      if (farmImage) {
        setIsUploadingImage(true)
        try {
          const uploadResult = await uploadService.uploadFile(farmImage, 'farm')
          uploadedImageUrl = uploadResult.url
          setFarmImageUrl(uploadedImageUrl)
        } catch (error) {
          console.error('이미지 업로드 실패:', error)
          toast({
            title: '이미지 업로드 실패',
            description: '이미지 업로드 중 오류가 발생했습니다. 다시 시도해주세요.',
            variant: 'destructive',
          })
          setIsUploadingImage(false)
          setIsSaving(false)
          return
        } finally {
          setIsUploadingImage(false)
        }
      }

      if (isNewFarm || !selectedFarmId || selectedFarmId === 'new') {
        // 농장 신규 등록
        const created = await farmService.createFarm({
          name: farmData.name,
          description: farmData.description,
          address: farmData.address,
          phone: farmData.phone,
          email: farmData.email,
          businessNumber: farmData.businessNumber,
        } as any)

        setFarmData((prev) => ({
          ...prev,
          id: (created as any).id,
        }))
        setMyFarms((prev) => [...prev, created])
        setSelectedFarmId((created as any).id)
        setIsNewFarm(false)
      } else if (farmData.id && selectedFarmId && selectedFarmId !== 'new') {
        // 기존 농장 정보 수정
        await farmService.updateFarm(farmData.id, {
          name: farmData.name,
          description: farmData.description,
          address: farmData.address,
          phone: farmData.phone,
          email: farmData.email,
          businessNumber: farmData.businessNumber,
        } as any)
      }

      toast({
        title: isNewFarm ? '농장 등록 완료' : '농장 정보 저장 완료',
        description: isNewFarm
          ? '농장이 성공적으로 등록되었습니다.'
          : '농장 정보가 업데이트되었습니다.',
      })
      setIsEditing(false)
    } catch (error: any) {
      console.error('농장 정보 저장 실패:', error)
      toast({
        title: '농장 정보 저장 실패',
        description: error?.message || '농장 정보를 저장하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: keyof FarmFormData, value: any) => {
    setFarmData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Sprout className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">바로팜</span>
            </Link>
            <Badge variant="secondary">농가</Badge>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">고객 페이지</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarFallback>햇</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>햇살농장</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/farmer/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    설정
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="h-4 w-4 mr-2" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <FarmerNav />
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {isNewFarm ? '농장 등록' : '농장 정보 관리'}
            </h1>
            <p className="text-muted-foreground">
              {isNewFarm
                ? '농장의 기본 정보를 입력하여 농장을 등록하세요.'
                : '농장의 기본 정보를 관리하세요.'}
            </p>
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>편집하기</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                  취소
                </Button>
                <Button onClick={handleSave} disabled={isSaving || isUploadingImage}>
                  <Save className="h-4 w-4 mr-2" />
                  {isUploadingImage
                    ? '이미지 업로드 중...'
                    : isSaving
                      ? '저장 중...'
                      : isNewFarm
                        ? '등록하기'
                        : '저장하기'}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">기본 정보</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="farmName">농장명</Label>
                  <Input
                    id="farmName"
                    value={farmData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">농장 소개</Label>
                  <Textarea
                    id="description"
                    value={farmData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">주소</Label>
                  <div className="flex gap-2">
                    <Input
                      id="address"
                      value={farmData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      disabled={!isEditing}
                    />
                    {isEditing && (
                      <Button variant="outline" type="button">
                        주소 검색
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">연락처 정보</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">전화번호</Label>
                  <Input
                    id="phone"
                    value={farmData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={farmData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">사업자 정보</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessNumber">사업자 등록번호</Label>
                  <Input
                    id="businessNumber"
                    value={farmData.businessNumber}
                    onChange={(e) => handleChange('businessNumber', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>인증서</Label>
                  <div className="flex flex-wrap gap-2">
                    {farmData.certifications.map((cert, index) => (
                      <Badge key={index} variant="secondary">
                        {cert}
                      </Badge>
                    ))}
                    {isEditing && (
                      <Button variant="outline" size="sm">
                        인증서 추가
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">운영 정보</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="operatingHours">운영 시간</Label>
                  <Input
                    id="operatingHours"
                    value={farmData.operatingHours}
                    onChange={(e) => handleChange('operatingHours', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>편의시설</Label>
                  <div className="flex flex-wrap gap-2">
                    {farmData.facilities.map((facility, index) => (
                      <Badge key={index} variant="outline">
                        {facility}
                      </Badge>
                    ))}
                    {isEditing && (
                      <Button variant="outline" size="sm">
                        시설 추가
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">농장 이미지</h2>
              <div className="space-y-4">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border">
                  {farmImageUrl || farmImage ? (
                    <>
                      <img
                        src={
                          farmImageUrl ||
                          (farmImage
                            ? URL.createObjectURL(farmImage)
                            : '/sunny-farm-with-greenhouse.jpg')
                        }
                        alt="농장 메인 이미지"
                        className="w-full h-full object-cover"
                      />
                      {isEditing && farmImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setFarmImage(null)
                            if (farmImageUrl) {
                              setFarmImageUrl(null)
                            }
                          }}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs hover:bg-destructive/90"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-12 w-12" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="block">
                    <Button variant="outline" className="w-full" asChild>
                      <span>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        {farmImage || farmImageUrl ? '이미지 변경' : '이미지 업로드'}
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setFarmImage(file)
                          // 기존 URL이 있으면 초기화 (새 이미지로 교체)
                          if (farmImageUrl) {
                            setFarmImageUrl(null)
                          }
                        }
                      }}
                    />
                  </label>
                )}
                {isEditing && (farmImage || farmImageUrl) && (
                  <p className="text-xs text-muted-foreground text-center">
                    이미지는 자동으로 압축되어 WebP 형식으로 변환됩니다
                  </p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">빠른 메뉴</h2>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/farmer/dashboard">대시보드</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/farmer/products">상품 관리</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/farmer/experiences">체험 관리</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/farmer/bookings">예약 관리</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/farmer/orders">주문 관리</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
