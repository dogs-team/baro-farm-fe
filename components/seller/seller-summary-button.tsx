'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileText, X, Loader2, Volume2, VolumeX } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SummaryData {
  statistics?: Record<string, unknown>
  summary?: string
  insights?: string
  recommendations?: string
}

interface SellerSummaryButtonProps {
  sellerId: string
}

export function SellerSummaryButton({ sellerId }: SellerSummaryButtonProps) {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<string>('')
  const [progressPercent, setProgressPercent] = useState<number>(0)
  const [summaryData, setSummaryData] = useState<SummaryData>({})
  const [error, setError] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const { toast } = useToast()

  // SpeechSynthesis 초기화 및 정리
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
    }

    return () => {
      // 컴포넌트 언마운트 시 EventSource 정리
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      // TTS 정리
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  // TTS 기능
  const speakText = (text: string) => {
    if (
      !synthRef.current ||
      !text ||
      typeof window === 'undefined' ||
      !('speechSynthesis' in window)
    ) {
      toast({
        title: 'TTS 지원 안됨',
        description: '이 브라우저는 음성 읽기 기능을 지원하지 않습니다.',
        variant: 'destructive',
      })
      return
    }

    // 이전 TTS 중지
    synthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ko-KR' // 한국어
    utterance.rate = 1.0 // 읽기 속도 (0.1 ~ 10)
    utterance.pitch = 1.0 // 음성 높이 (0 ~ 2)
    utterance.volume = 1.0 // 음량 (0 ~ 1)

    utterance.onstart = () => {
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
    }

    utterance.onerror = (error) => {
      console.error('TTS Error:', error)
      setIsSpeaking(false)
      toast({
        title: '음성 읽기 오류',
        description: '음성을 읽는 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }

    utteranceRef.current = utterance
    synthRef.current.speak(utterance)
  }

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  const fetchSummary = async () => {
    setLoading(true)
    setProgress('요약 요청 시작...')
    setProgressPercent(0)
    setSummaryData({})
    setError(null)
    setShowResults(true)

    try {
      // 게이트웨이 URL 구성
      const gatewayUrl =
        process.env.NEXT_PUBLIC_API_GATEWAY_URL?.replace(/\/$/, '') || 'http://3.34.14.73:8080'

      // 어제 날짜 계산 (YYYY-MM-DD 형식)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const dateStr = yesterday.toISOString().split('T')[0] // YYYY-MM-DD

      // EventSource는 헤더를 직접 설정할 수 없으므로, URL에 토큰을 포함하거나
      // fetch API를 사용하여 스트림을 읽어야 합니다.
      // 여기서는 fetch API를 사용하여 ReadableStream을 읽는 방식으로 구현합니다.
      const url = `${gatewayUrl}/api/v1/seller-summary/${sellerId}/stream?date=${dateStr}`

      const response = await fetch(url, {
        credentials: 'include', // [1] cookie 기반 인증
        headers: {
          Accept: 'text/event-stream',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('Response body is null')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullSummaryText = '' // 전체 요약 텍스트 추적

      const readStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              setLoading(false)
              setProgress('완료')
              setProgressPercent(100)
              // 요약 완료 시 전체 요약을 TTS로 읽기
              if (fullSummaryText.trim()) {
                setTimeout(() => {
                  speakText(fullSummaryText)
                }, 500)
              }
              break
            }

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6)
                if (dataStr.trim() === '') continue

                try {
                  const data = JSON.parse(dataStr)

                  // 이벤트 타입에 따라 처리
                  if (data.type === 'progress') {
                    setProgress(data.message || data.text || '처리 중...')
                    setProgressPercent(data.progress || 0)
                  } else if (data.type === 'statistics' || data.statistics) {
                    setSummaryData((prev) => ({ ...prev, statistics: data.statistics || data }))
                  } else if (
                    data.type === 'summary' ||
                    data.type === 'summary_chunk' ||
                    data.summary
                  ) {
                    const summaryText = data.summary || data.text || data
                    fullSummaryText += summaryText
                    setSummaryData((prev) => ({
                      ...prev,
                      summary: (prev.summary || '') + summaryText,
                    }))
                  } else if (data.type === 'insights' || data.insights) {
                    setSummaryData((prev) => ({
                      ...prev,
                      insights: data.insights || data.text || data,
                    }))
                  } else if (data.type === 'recommendations' || data.recommendations) {
                    setSummaryData((prev) => ({
                      ...prev,
                      recommendations: data.recommendations || data.text || data,
                    }))
                  } else if (data.type === 'complete') {
                    setLoading(false)
                    setProgress('완료')
                    setProgressPercent(100)
                    toast({
                      title: '요약 완료',
                      description: 'Off 시간 주문 요약이 완료되었습니다.',
                    })
                    // 요약 완료 시 전체 요약을 TTS로 읽기
                    if (fullSummaryText.trim()) {
                      setTimeout(() => {
                        speakText(fullSummaryText)
                      }, 500)
                    }
                    return
                  } else if (data.type === 'error') {
                    throw new Error(
                      data.message || data.error || '요약 생성 중 오류가 발생했습니다.'
                    )
                  } else {
                    // 타입이 없는 경우 데이터를 그대로 처리
                    if (data.message) {
                      setProgress(data.message)
                    }
                    if (data.progress !== undefined) {
                      setProgressPercent(data.progress)
                    }
                  }
                } catch (parseError) {
                  console.error('JSON 파싱 오류:', parseError, 'Data:', dataStr)
                  // JSON 파싱 실패 시 무시하고 계속 진행
                }
              } else if (line.startsWith('event: ')) {
                // 이벤트 타입 정보 (필요시 사용)
                const eventType = line.slice(7).trim()
                console.log('Event type:', eventType)
              }
            }
          }
        } catch (streamError) {
          console.error('스트림 읽기 오류:', streamError)
          setError('요약 생성 중 오류가 발생했습니다.')
          setLoading(false)
        }
      }

      readStream()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '연결 실패'
      console.error('SSE 연결 오류:', err)
      setError(errorMessage)
      setLoading(false)
      toast({
        title: '오류 발생',
        description: errorMessage || '요약 요청 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  const handleClose = () => {
    // TTS 중지
    stopSpeaking()

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setShowResults(false)
    setLoading(false)
    setSummaryData({})
    setError(null)
    setProgress('')
    setProgressPercent(0)
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={fetchSummary}
        disabled={loading}
        className="w-full sm:w-auto"
        variant="outline"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            요약 생성 중...
          </>
        ) : (
          <>
            <FileText className="h-4 w-4 mr-2" />
            Off 시간 주문 요약 보기
          </>
        )}
      </Button>

      {showResults && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">주문 요약</h3>
            <div className="flex items-center gap-2">
              {isSpeaking && (
                <Button variant="outline" size="sm" onClick={stopSpeaking}>
                  <VolumeX className="h-4 w-4 mr-2" />
                  음성 중지
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {loading && (
            <div className="space-y-2">
              <Progress value={progressPercent} className="w-full" />
              <p className="text-sm text-muted-foreground">{progress}</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {summaryData.statistics && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">주문 통계</h4>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(summaryData.statistics, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {summaryData.summary && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">주문 개요</h4>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{summaryData.summary}</p>
              </div>
            </div>
          )}

          {summaryData.insights && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">인사이트</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => speakText(summaryData.insights || '')}
                  disabled={isSpeaking}
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  다시 듣기
                </Button>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{summaryData.insights}</p>
              </div>
            </div>
          )}

          {summaryData.recommendations && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">추천 사항</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => speakText(summaryData.recommendations || '')}
                  disabled={isSpeaking}
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  다시 듣기
                </Button>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{summaryData.recommendations}</p>
              </div>
            </div>
          )}

          {!loading && !error && Object.keys(summaryData).length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              요약 결과가 없습니다.
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
