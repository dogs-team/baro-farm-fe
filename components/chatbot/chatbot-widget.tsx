'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { chatbotService } from '@/lib/api/services/chatbot'
import { useToast } from '@/hooks/use-toast'
import type { ChatMessage } from '@/lib/api/types/chatbot'
import { ChatMessageItem } from './chat-message-item'

export function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // 초기 환영 메시지
  useEffect(() => {
    if (open && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: '안녕하세요! 바로팜 챗봇입니다. 무엇을 도와드릴까요?',
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [open, messages.length])

  // 메시지 추가 시 자동 스크롤
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]')
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
      }
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // 스트리밍 응답 처리
    let assistantContent = ''
    const assistantMessageId = `assistant-${Date.now()}`

    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, assistantMessage])

    try {
      await chatbotService.sendMessageStream(
        {
          message: userMessage.content,
          conversationId,
        },
        (chunk) => {
          if (chunk.content) {
            assistantContent += chunk.content
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId ? { ...msg, content: assistantContent } : msg
              )
            )
          }

          if (chunk.conversationId) {
            setConversationId(chunk.conversationId)
          }

          if (chunk.done) {
            setIsLoading(false)
          }
        }
      )
    } catch (error: any) {
      console.error('챗봇 요청 실패:', error)
      toast({
        title: '오류 발생',
        description: error.message || '챗봇과의 통신 중 오류가 발생했습니다.',
        variant: 'destructive',
      })

      // 에러 메시지 추가
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.',
              }
            : msg
        )
      )
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* 플로팅 버튼 */}
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-[#22C55E] hover:bg-[#16A34A] text-white"
        size="icon"
        aria-label="챗봇 열기"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* 챗봇 Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>바로팜 챗봇</SheetTitle>
            <SheetDescription>
              궁금한 사항을 물어보세요. 친절하게 답변해드리겠습니다.
            </SheetDescription>
          </SheetHeader>

          {/* 메시지 영역 */}
          <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
            <div className="py-4 space-y-4">
              {messages.map((message) => (
                <ChatMessageItem key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>응답을 생성하는 중...</span>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* 입력 영역 */}
          <div className="border-t p-4 space-y-2">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="메시지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
                className="min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="self-end"
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              챗봇은 실시간으로 응답하며, 농산물 주문 및 문의에 도움을 드립니다.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
