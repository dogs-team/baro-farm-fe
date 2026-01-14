import fs from 'fs'
import path from 'path'

const LOG_BASE_DIR = '/mnt/s3/logs/events'

function ensureLogDir() {
  if (!fs.existsSync(LOG_BASE_DIR)) {
    fs.mkdirSync(LOG_BASE_DIR, { recursive: true })
  }
}

/**
 * S3 마운트 경로(/mnt/s3/logs/events)에 JSON Lines 형식으로 로그 적재
 * 파일 이름: {eventType}-YYYY-MM-DD-HH.log (1시간 단위, 서울 시간 기준)
 * 예: product_detail_click-2026-01-13-14.log, product_detail_dwell_time-2026-01-13-14.log
 */
export async function writeEventLog(eventType: string, data: Record<string, unknown>) {
  try {
    ensureLogDir()

    const now = new Date()
    // 서울 시간(KST, UTC+9)으로 변환
    const kstOffset = 9 * 60 // UTC+9를 분 단위로
    const kstTime = new Date(now.getTime() + kstOffset * 60 * 1000)
    const dateStr = kstTime.toISOString().slice(0, 10) // YYYY-MM-DD
    const hourStr = String(kstTime.getUTCHours()).padStart(2, '0') // HH (00-23)
    // 이벤트 타입별로 파일 분리, 1시간 단위로 파일명 변경 (서울 시간 기준)
    const filePath = path.join(LOG_BASE_DIR, `${eventType}-${dateStr}-${hourStr}.log`)

    const line = JSON.stringify({
      type: eventType,
      loggedAt: now.toISOString(),
      ...data,
    })

    await fs.promises.appendFile(filePath, line + '\n', 'utf8')
  } catch (error) {
    // 로그 적재 실패는 서비스 동작에 영향 주지 않도록 콘솔만 찍고 무시
    console.error('[EventLogger] writeEventLog error', error)
  }
}
