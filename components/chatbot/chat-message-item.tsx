'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/lib/api/types/chatbot'
import { format } from 'date-fns'

interface ChatMessageItemProps {
  message: ChatMessage
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(isUser ? 'bg-[#22C55E] text-white' : 'bg-muted text-muted-foreground')}
        >
          {isUser ? '나' : '봇'}
        </AvatarFallback>
      </Avatar>

      <div className={cn('flex flex-col gap-1 max-w-[80%]', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-lg px-4 py-2 text-sm',
            isUser ? 'bg-[#22C55E] text-white' : 'bg-muted text-foreground'
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <span className="text-xs text-muted-foreground">{format(message.timestamp, 'HH:mm')}</span>
      </div>
    </div>
  )
}
