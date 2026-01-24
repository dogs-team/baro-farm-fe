// lib/api/services/chatbot.ts

import { supportApi, API_URLS, buildUrlFromBase } from '../client'
import type { ChatRequest, ChatResponse, ChatStreamChunk, Conversation } from '../types/chatbot'

/**
 * 챗봇 API 서비스
 *
 * 서버에 챗봇 API가 추가되면 아래 엔드포인트를 실제 API 경로로 변경하세요.
 * 예: '/api/v1/chatbot/chat' 또는 '/api/v1/chat/message'
 */
export const chatbotService = {
  /**
   * 챗봇에 메시지 전송 (일반 응답)
   * @param request 챗봇 요청 데이터
   * @returns 챗봇 응답
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    // TODO: 서버 API 엔드포인트로 변경 필요
    // 현재는 지원 서비스(support-service)를 사용하지만,
    // 챗봇이 별도 서비스라면 새로운 API 클라이언트를 생성해야 합니다.
    const response = await supportApi.post<{ data: ChatResponse } | ChatResponse>(
      '/api/v1/chatbot/chat',
      request
    )

    // API 응답이 { status, data: { ... }, message } 형태이면 data 필드 추출
    return response && typeof response === 'object' && 'data' in response
      ? response.data
      : (response as ChatResponse)
  },

  /**
   * 챗봇에 메시지 전송 (스트리밍 응답)
   * @param request 챗봇 요청 데이터
   * @param onChunk 스트림 청크를 받을 콜백 함수
   * @returns Promise<void>
   */
  async sendMessageStream(
    request: ChatRequest,
    onChunk: (chunk: ChatStreamChunk) => void
  ): Promise<void> {
    // rewrites 사용 시 상대 경로, 미사용 시 절대 경로
    // rewrites 규칙: /api/support/:path* → /support-service/api/:path*
    // buildUrlFromBase 유틸리티 함수 사용
    const url = buildUrlFromBase(API_URLS.SUPPORT, '/api/v1/chatbot/chat/stream')

    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include', // [1] cookie 기반 인증
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`챗봇 요청 실패: ${response.statusText}`)
    }

    if (!response.body) {
      throw new Error('스트림 응답을 받을 수 없습니다.')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.trim() === '') continue

          // SSE 형식: "data: {...}"
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)) as ChatStreamChunk
              onChunk(data)
            } catch (e) {
              console.error('스트림 데이터 파싱 실패:', e)
            }
          }
        }
      }

      // 마지막 버퍼 처리
      if (buffer.trim()) {
        if (buffer.startsWith('data: ')) {
          try {
            const data = JSON.parse(buffer.slice(6)) as ChatStreamChunk
            onChunk(data)
          } catch (e) {
            console.error('스트림 데이터 파싱 실패:', e)
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  },

  /**
   * 대화 목록 조회
   * @returns 대화 목록
   */
  async getConversations(): Promise<Conversation[]> {
    // TODO: 서버 API 엔드포인트로 변경 필요
    const response = await supportApi.get<{ data: Conversation[] } | Conversation[]>(
      '/api/v1/chatbot/conversations'
    )

    return response && typeof response === 'object' && 'data' in response
      ? response.data
      : (response as Conversation[])
  },

  /**
   * 대화 삭제
   * @param conversationId 대화 ID
   */
  async deleteConversation(conversationId: string): Promise<void> {
    // TODO: 서버 API 엔드포인트로 변경 필요
    await supportApi.delete(`/api/v1/chatbot/conversations/${conversationId}`)
  },
}
