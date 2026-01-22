'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Mail, Phone, Edit } from 'lucide-react'
import Image from 'next/image'
import { PasswordChangeDialog } from '../dialogs/PasswordChangeDialog'
import type { ProfileUser } from '../types'

interface ProfileInfoSectionProps {
  user: ProfileUser
  isWithdrawDialogOpen: boolean
  onWithdrawDialogOpenChange: (open: boolean) => void
  isWithdrawing: boolean
  onWithdraw: () => Promise<void>
}

export function ProfileInfoSection({
  user,
  isWithdrawDialogOpen,
  onWithdrawDialogOpenChange,
  isWithdrawing,
  onWithdraw,
}: ProfileInfoSectionProps) {
  return (
    <Card className="p-4 flex flex-col h-full">
      <div className="flex items-start gap-4 flex-1">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
          <Image
            src={user.avatar || '/placeholder.svg'}
            alt={user.name || user.email || '사용자 프로필'}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="mb-2">
            <h2 className="text-lg font-semibold">{user.name || user.email}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {user.role === 'SELLER' ? '판매자' : '일반 회원'}
              </Badge>
            </div>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground flex-1">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-auto pt-2 space-y-2">
        <PasswordChangeDialog
          trigger={
            <Button variant="outline" size="sm" className="cursor-pointer">
              <Edit className="h-4 w-4 mr-2" />
              수정하기
            </Button>
          }
        />
        <AlertDialog open={isWithdrawDialogOpen} onOpenChange={onWithdrawDialogOpenChange}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="cursor-pointer">
              회원탈퇴
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>회원 탈퇴</AlertDialogTitle>
              <AlertDialogDescription>
                탈퇴 시 계정 정보가 복구되지 않습니다. 계속할까요?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isWithdrawing}>취소</AlertDialogCancel>
              <AlertDialogAction onClick={onWithdraw} disabled={isWithdrawing}>
                {isWithdrawing ? '탈퇴 중...' : '회원 탈퇴'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  )
}
