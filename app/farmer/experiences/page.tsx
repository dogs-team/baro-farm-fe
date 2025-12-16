'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Sprout,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Search,
  Filter,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Settings, LogOut } from 'lucide-react'
import { FarmerNav } from '../components/farmer-nav'
import { farmService } from '@/lib/api/services/farm'
import { experienceService } from '@/lib/api/services/experience'
import type { Farm, Experience } from '@/lib/api/types'

interface ExperienceListItem {
  id: string
  title: string
  description: string
  image?: string | null
  pricePerPerson: number
  durationMinutes: number
  capacity: number
  status: 'active' | 'paused' | 'closed'
  category?: string
}

export default function FarmerExperiencesPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedExperience, setSelectedExperience] = useState<ExperienceListItem | null>(null)
  const [hasFarm, setHasFarm] = useState<boolean | null>(null)
  const [isCheckingFarm, setIsCheckingFarm] = useState(false)
  const [farms, setFarms] = useState<Farm[]>([])
  const [selectedFarmId, setSelectedFarmId] = useState<string | undefined>(undefined)
  const [experiences, setExperiences] = useState<ExperienceListItem[]>([])
  const [isLoadingExperiences, setIsLoadingExperiences] = useState(false)

  const [newExperience, setNewExperience] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    maxParticipants: '',
    category: '',
  })

  const [editExperience, setEditExperience] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    maxParticipants: '',
  })

  const handleCreateExperience = async () => {
    if (!selectedFarmId) {
      toast({
        title: '농장 선택 필요',
        description: '체험을 등록할 농장을 먼저 선택해주세요.',
        variant: 'destructive',
      })
      return
    }

    try {
      const price = Number(newExperience.price) || 0
      const durationMinutes = Number(newExperience.duration) || 60
      const capacity = Number(newExperience.maxParticipants) || 0

      await experienceService.createExperience({
        farmId: selectedFarmId,
        title: newExperience.title,
        description: newExperience.description,
        pricePerPerson: price,
        capacity,
        durationMinutes,
      } as any)

      toast({
        title: '체험 등록 완료',
        description: '새로운 체험이 등록되었습니다.',
      })
      setIsCreateDialogOpen(false)
      setNewExperience({
        title: '',
        description: '',
        price: '',
        duration: '',
        maxParticipants: '',
        category: '',
      })

      if (selectedFarmId) {
        await fetchExperiencesByFarm(selectedFarmId)
      }
    } catch (error: any) {
      console.error('체험 등록 실패:', error)
      toast({
        title: '체험 등록 실패',
        description: error?.message || '체험을 등록하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  const handleEditExperience = async () => {
    if (!selectedExperience) return

    try {
      const price = Number(editExperience.price || selectedExperience.pricePerPerson) || 0
      const durationMinutes =
        Number(editExperience.duration || selectedExperience.durationMinutes) || 60
      const capacity = Number(editExperience.maxParticipants || selectedExperience.capacity) || 0

      await experienceService.updateExperience(selectedExperience.id, {
        title: editExperience.title || selectedExperience.title,
        description: editExperience.description || selectedExperience.description,
        pricePerPerson: price,
        capacity,
        durationMinutes,
      } as any)

      toast({
        title: '체험 수정 완료',
        description: '체험 정보가 수정되었습니다.',
      })
      setIsEditDialogOpen(false)
      setSelectedExperience(null)

      if (selectedFarmId) {
        await fetchExperiencesByFarm(selectedFarmId)
      }
    } catch (error: any) {
      console.error('체험 수정 실패:', error)
      toast({
        title: '체험 수정 실패',
        description: error?.message || '체험 정보를 수정하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteExperience = async (id: string) => {
    try {
      await experienceService.deleteExperience(id)
      toast({
        title: '체험 삭제 완료',
        description: '체험이 삭제되었습니다.',
      })
      if (selectedFarmId) {
        await fetchExperiencesByFarm(selectedFarmId)
      }
    } catch (error: any) {
      console.error('체험 삭제 실패:', error)
      toast({
        title: '체험 삭제 실패',
        description: error?.message || '체험을 삭제하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: 'active' | 'paused' | 'closed') => {
    try {
      const target = experiences.find((e) => e.id === id)
      if (!target) return

      const nextStatus = currentStatus === 'active' ? 'paused' : 'active'
      await experienceService.updateExperience(id, {
        status: nextStatus === 'active' ? 'ON_SALE' : 'CLOSED',
      } as any)

      toast({
        title: '상태 변경 완료',
        description: '체험 상태가 변경되었습니다.',
      })

      setExperiences((prev) =>
        prev.map((exp) => (exp.id === id ? { ...exp, status: nextStatus } : exp))
      )
    } catch (error: any) {
      console.error('체험 상태 변경 실패:', error)
      toast({
        title: '상태 변경 실패',
        description: error?.message || '상태를 변경하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  // 내 농장 목록 조회 및 기본 선택
  useEffect(() => {
    const checkHasFarm = async () => {
      try {
        setIsCheckingFarm(true)
        const response = await farmService.getMyFarms({ page: 0, size: 20 } as any)
        const content = Array.isArray(response?.content) ? response.content : []
        setFarms(content)
        setHasFarm(content.length > 0)
        if (content.length > 0 && !selectedFarmId) {
          setSelectedFarmId(content[0].id)
        }
      } catch (error) {
        console.error('농장 보유 여부 확인 실패:', error)
        setHasFarm(false)
      } finally {
        setIsCheckingFarm(false)
      }
    }

    checkHasFarm()
  }, [selectedFarmId])

  const fetchExperiencesByFarm = async (farmId: string) => {
    setIsLoadingExperiences(true)
    try {
      const response = await experienceService.getExperiences({
        page: 0,
        size: 50,
        farmId,
      } as any)
      const content = Array.isArray(response?.content) ? response.content : []
      const mapped: ExperienceListItem[] = content.map((exp: Experience) => ({
        id: (exp as any).experienceId || (exp as any).id,
        title: exp.title,
        description: exp.description,
        image: (exp as any).image || null,
        pricePerPerson: exp.pricePerPerson,
        durationMinutes: exp.durationMinutes,
        capacity: exp.capacity,
        status: exp.status === 'ON_SALE' ? 'active' : exp.status === 'CLOSED' ? 'closed' : 'paused',
        category: exp.category,
      }))
      setExperiences(mapped)
    } catch (error) {
      console.error('체험 목록 조회 실패:', error)
      setExperiences([])
    } finally {
      setIsLoadingExperiences(false)
    }
  }

  // 선택된 농장 변경 시 체험 목록 조회
  useEffect(() => {
    if (!selectedFarmId) return
    fetchExperiencesByFarm(selectedFarmId)
  }, [selectedFarmId])

  const filteredExperiences = experiences.filter((exp) => {
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && exp.status === 'active') ||
      (filterStatus === 'paused' && exp.status !== 'active')
    return matchesSearch && matchesFilter
  })

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
        {/* 농장 보유 여부에 따라 체험 관리 기능 제어 */}
        {isCheckingFarm ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">농장 정보를 확인하는 중입니다...</p>
          </div>
        ) : hasFarm === false ? (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-2">먼저 농장을 등록해주세요</h1>
              <p className="text-muted-foreground mb-6">
                농장 체험 프로그램은 내 농장이 등록된 경우에만 관리할 수 있습니다.
              </p>
              <Button asChild>
                <Link href="/farmer/farm">내 농장 등록/관리 페이지로 이동</Link>
              </Button>
            </Card>
          </div>
        ) : (
          <>
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">체험 관리</h1>
                <p className="text-muted-foreground">농장 체험 프로그램을 관리하세요</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">농장 선택</span>
                  <Select
                    value={selectedFarmId}
                    onValueChange={(value) => setSelectedFarmId(value)}
                  >
                    <SelectTrigger className="w-56">
                      <SelectValue placeholder="농장을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {farms.map((farm) => (
                        <SelectItem key={farm.id} value={farm.id}>
                          {farm.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      체험 등록
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>새 체험 등록</DialogTitle>
                      <DialogDescription>농장 체험 프로그램을 등록하세요</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">체험 제목</Label>
                        <Input
                          id="title"
                          placeholder="딸기 수확 체험"
                          value={newExperience.title}
                          onChange={(e) =>
                            setNewExperience({ ...newExperience, title: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">체험 설명</Label>
                        <Textarea
                          id="description"
                          placeholder="체험에 대한 자세한 설명을 입력하세요"
                          value={newExperience.description}
                          onChange={(e) =>
                            setNewExperience({ ...newExperience, description: e.target.value })
                          }
                          rows={4}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price">가격 (원)</Label>
                          <Input
                            id="price"
                            type="number"
                            placeholder="25000"
                            value={newExperience.price}
                            onChange={(e) =>
                              setNewExperience({ ...newExperience, price: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="duration">소요 시간</Label>
                          <Input
                            id="duration"
                            placeholder="2시간"
                            value={newExperience.duration}
                            onChange={(e) =>
                              setNewExperience({ ...newExperience, duration: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="maxParticipants">최대 인원</Label>
                          <Input
                            id="maxParticipants"
                            type="number"
                            placeholder="20"
                            value={newExperience.maxParticipants}
                            onChange={(e) =>
                              setNewExperience({
                                ...newExperience,
                                maxParticipants: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">카테고리</Label>
                          <Select
                            value={newExperience.category}
                            onValueChange={(value) =>
                              setNewExperience({ ...newExperience, category: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="카테고리 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="수확체험">수확체험</SelectItem>
                              <SelectItem value="수확+요리">수확+요리</SelectItem>
                              <SelectItem value="농장투어">농장투어</SelectItem>
                              <SelectItem value="만들기체험">만들기체험</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        취소
                      </Button>
                      <Button onClick={handleCreateExperience}>등록하기</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Search and Filter */}
            <Card className="p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="체험 제목으로 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="상태 필터" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="active">활성</SelectItem>
                    <SelectItem value="paused">일시중지</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Experiences Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingExperiences ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  체험 목록을 불러오는 중입니다...
                </div>
              ) : (
                filteredExperiences.map((experience) => (
                  <Card key={experience.id} className="overflow-hidden">
                    <div className="relative aspect-video">
                      <Image
                        src={experience.image || '/placeholder.svg'}
                        alt={experience.title}
                        fill
                        className="object-cover"
                      />
                      <Badge className="absolute top-3 right-3">
                        {experience.status === 'active' ? '활성' : '일시중지'}
                      </Badge>
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold">{experience.title}</h3>
                        {experience.category && (
                          <Badge variant="outline">{experience.category}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {experience.description}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {experience.pricePerPerson.toLocaleString()}원
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{experience.durationMinutes}분</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>최대 {experience.capacity}명</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedExperience(experience)
                            setEditExperience({
                              title: experience.title,
                              description: experience.description,
                              price: String(experience.pricePerPerson),
                              duration: String(experience.durationMinutes),
                              maxParticipants: String(experience.capacity),
                            })
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          수정
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(experience.id, experience.status)}
                        >
                          {experience.status === 'active' ? '일시중지' : '활성화'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteExperience(experience.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Edit Experience Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>체험 수정</DialogTitle>
                  <DialogDescription>선택한 체험 프로그램 정보를 수정합니다.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">체험 제목</Label>
                    <Input
                      id="edit-title"
                      value={editExperience.title}
                      onChange={(e) =>
                        setEditExperience((prev) => ({ ...prev, title: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">체험 설명</Label>
                    <Textarea
                      id="edit-description"
                      value={editExperience.description}
                      onChange={(e) =>
                        setEditExperience((prev) => ({ ...prev, description: e.target.value }))
                      }
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-price">가격 (원)</Label>
                      <Input
                        id="edit-price"
                        type="number"
                        value={editExperience.price}
                        onChange={(e) =>
                          setEditExperience((prev) => ({ ...prev, price: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-duration">소요 시간(분)</Label>
                      <Input
                        id="edit-duration"
                        type="number"
                        value={editExperience.duration}
                        onChange={(e) =>
                          setEditExperience((prev) => ({ ...prev, duration: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-maxParticipants">최대 인원</Label>
                      <Input
                        id="edit-maxParticipants"
                        type="number"
                        value={editExperience.maxParticipants}
                        onChange={(e) =>
                          setEditExperience((prev) => ({
                            ...prev,
                            maxParticipants: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false)
                      setSelectedExperience(null)
                    }}
                  >
                    취소
                  </Button>
                  <Button onClick={handleEditExperience}>저장하기</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {filteredExperiences.length === 0 && (
              <Card className="p-12">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">등록된 체험이 없습니다</h3>
                  <p className="text-muted-foreground mb-4">새로운 체험 프로그램을 등록해보세요</p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    체험 등록
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
