'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, Phone, Edit } from 'lucide-react'
import Image from 'next/image'
import { PasswordChangeDialog } from '../dialogs/PasswordChangeDialog'
import type { ProfileUser } from '../types'

interface ProfileInfoSectionProps {
  user: ProfileUser
}

export function ProfileInfoSection({ user }: ProfileInfoSectionProps) {
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
      <div className="mt-auto pt-2">
        <PasswordChangeDialog
          trigger={
            <Button variant="outline" size="sm" className="cursor-pointer">
              <Edit className="h-4 w-4 mr-2" />
              수정하기
            </Button>
          }
        />
      </div>
    </Card>
  )
}
