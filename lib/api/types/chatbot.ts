// lib/api/types/chatbot.ts

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  attachments?: ChatAttachment[]
}

export interface ChatAttachment {
  type: 'image' | 'document'
  url: string
  name?: string
}

export interface ChatRequest {
  message: string
  conversationId?: string
  attachments?: ChatAttachment[]
  model?: string
  temperature?: number
}

export interface ChatResponse {
  message: string
  conversationId: string
  model?: string
  finishReason?: string
}

export interface ChatStreamChunk {
  content: string
  done?: boolean
  conversationId?: string
}

export interface Conversation {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  messageCount: number
}
