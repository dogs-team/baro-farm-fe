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
 * 파일 이름: events-YYYY-MM-DD.log
 */
export async function writeEventLog(eventType: string, data: Record<string, unknown>) {
  try {
    ensureLogDir()

    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10) // YYYY-MM-DD
    const filePath = path.join(LOG_BASE_DIR, `events-${dateStr}.log`)

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
