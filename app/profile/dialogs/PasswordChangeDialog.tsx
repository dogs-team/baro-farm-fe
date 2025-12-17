'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { authService } from '@/lib/api/services/auth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface PasswordChangeDialogProps {
  trigger: React.ReactNode
}

export function PasswordChangeDialog({ trigger }: PasswordChangeDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isChanging, setIsChanging] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast({
        title: '입력 오류',
        description: '현재 비밀번호와 새 비밀번호를 모두 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: '입력 오류',
        description: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.',
        variant: 'destructive',
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: '입력 오류',
        description: '새 비밀번호는 최소 8자 이상이어야 합니다.',
        variant: 'destructive',
      })
      return
    }

    setIsChanging(true)
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      toast({
        title: '비밀번호 변경 완료',
        description: '비밀번호가 성공적으로 변경되었습니다.',
      })

      setOpen(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error: any) {
      toast({
        title: '비밀번호 변경 실패',
        description: error?.message || '비밀번호 변경 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsChanging(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>비밀번호 변경</DialogTitle>
          <DialogDescription>
            현재 비밀번호를 입력하고 새 비밀번호를 설정해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">현재 비밀번호</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
              }
              disabled={isChanging}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">새 비밀번호</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
              }
              disabled={isChanging}
            />
            <p className="text-xs text-muted-foreground">최소 8자 이상 입력해주세요.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
              disabled={isChanging}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isChanging}
            className="cursor-pointer"
          >
            취소
          </Button>
          <Button
            onClick={handlePasswordChange}
            disabled={isChanging || !passwordData.currentPassword || !passwordData.newPassword}
            className="cursor-pointer"
          >
            {isChanging ? '변경 중...' : '변경하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
