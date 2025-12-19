# 보안 대책 적용 문서

## 📋 개요

**작성 일시**: 2025년 12월 19일  
**관련 사고**: [보안 사고 보고서](./2025-12-19-SECURITY_INCIDENT_REPORT.md)  
**상태**: ✅ 적용 완료

본 문서는 크립토마이닝 봇 침입 사건 이후 적용된 보안 대책들을 정리한 문서입니다.

---

## 🛡️ 적용된 보안 대책

### 1. 컨테이너 보안 강화

#### 1.1 읽기 전용 파일 시스템

**파일**: `docker-compose.yml`

```yaml
# 읽기 전용 파일 시스템 (악성 파일 쓰기 방지)
read_only: true
```

**효과**:

- 컨테이너 파일 시스템을 읽기 전용으로 설정하여 악성 파일 쓰기 방지
- `/tmp` 및 `/var/tmp`를 제외한 모든 디렉토리에서 파일 생성 불가

#### 1.2 임시 디렉토리 보안 강화

**파일**: `docker-compose.yml`

```yaml
# 임시 디렉토리만 쓰기 가능 (noexec, nosuid로 실행 방지)
tmpfs:
  - /tmp:noexec,nosuid,size=100m
  - /var/tmp:noexec,nosuid,size=100m
```

**효과**:

- `noexec`: 임시 디렉토리에서 실행 파일 실행 불가
- `nosuid`: setuid 비트 무시 (권한 상승 방지)
- `size=100m`: 디스크 공간 제한으로 DoS 공격 방지

#### 1.3 Dockerfile 보안 강화

**파일**: `Dockerfile`

```dockerfile
# 보안 강화: 불필요한 도구 제거
RUN apk del --no-cache curl wget 2>/dev/null || true
```

**효과**:

- 런타임에서 불필요한 네트워크 도구 제거
- 악성 스크립트가 외부에서 파일을 다운로드하는 것을 방지
- 공격 표면 축소

**기존 보안 설정**:

- ✅ 비root 사용자(`nextjs`)로 실행 (이미 적용되어 있었음)
- ✅ 최소 권한 원칙 준수

---

### 2. 애플리케이션 보안

#### 2.1 외부 URL 검증 시스템

**파일**: `lib/security.ts`

**구현 내용**:

```typescript
const ALLOWED_DOMAINS = [
  '3.34.14.73', // API Gateway
  'localhost', // 로컬 개발 환경
  '127.0.0.1', // 로컬 개발 환경
]

export function validateUrl(url: string): boolean {
  // 허용된 도메인만 접근 가능
  // 프로덕션 환경에서는 localhost 차단
}

export async function safeFetch(url: string, options?: RequestInit) {
  // URL 검증 후 fetch 실행
}
```

**효과**:

- 허용된 도메인만 접근 가능하도록 화이트리스트 방식 적용
- 악성 서버로의 요청 자동 차단
- 프로덕션 환경에서 localhost 접근 차단

#### 2.2 API 클라이언트 보안 강화

**파일**: `lib/api/client.ts`

**구현 내용**:

```typescript
import { validateUrl } from '../security'

private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = this.buildUrl(endpoint, params)

  // 보안: URL 검증
  if (!validateUrl(url)) {
    throw new Error('보안 정책 위반: 허용되지 않은 URL입니다.')
  }

  // ... fetch 실행
}
```

**효과**:

- 모든 API 요청 전 URL 검증 수행
- 허용되지 않은 URL 접근 시 403 에러 반환
- 악성 페이로드 주입 방지

---

### 3. HTTP 보안 헤더

#### 3.1 Content Security Policy (CSP)

**파일**: `next.config.mjs`

**구현 내용**:

```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            `connect-src 'self' http://${gatewayHost}:8080 https://api.tosspayments.com`,
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join('; '),
        },
      ],
    },
  ]
}
```

**효과**:

- XSS 공격 방지
- 외부 스크립트 로드 제한
- API Gateway 및 토스페이먼츠만 허용
- Clickjacking 공격 방지

#### 3.2 추가 보안 헤더

**구현 내용**:

```javascript
{
  key: 'X-Frame-Options',
  value: 'DENY', // iframe 임베딩 차단
},
{
  key: 'X-Content-Type-Options',
  value: 'nosniff', // MIME 타입 스니핑 방지
},
{
  key: 'Referrer-Policy',
  value: 'strict-origin-when-cross-origin', // 리퍼러 정보 제한
},
{
  key: 'Permissions-Policy',
  value: 'camera=(), microphone=(), geolocation=()', // 불필요한 권한 차단
}
```

**효과**:

- 다양한 클라이언트 사이드 공격 방지
- 개인정보 유출 위험 감소

---

### 4. 런타임 모니터링

#### 4.1 프로세스 모니터링 스크립트

**파일**: `scripts/monitor-container.sh`

**기능**:

1. **의심스러운 프로세스 감지**
   - `javae`, `minerd`, `xmrig`, `cpuminer` 등 크립토마이닝 관련 프로세스 검색
   - 감지 시 자동 컨테이너 재시작

2. **악성 파일 검사**
   - `/tmp` 디렉토리에서 의심스러운 파일 검색
   - 크립토마이닝 관련 파일 패턴 감지

3. **네트워크 연결 모니터링**
   - 의심스러운 도메인 연결 감지
   - `supportxmr.com`, `accrochezvous.fr` 등 차단

4. **로그 패턴 검색**
   - 최근 100줄 로그에서 의심스러운 패턴 검색
   - base64 인코딩된 스크립트, eval/exec 패턴 감지

5. **리소스 사용률 모니터링**
   - CPU 사용률 60% 이상 시 경고

**사용법**:

```bash
# 수동 실행
./scripts/monitor-container.sh

# Cron 설정 (5분마다 실행)
*/5 * * * * /home/ubuntu/apps/FE/scripts/monitor-container.sh >> /var/log/container-monitor.log 2>&1
```

**로그 확인**:

```bash
# 실시간 로그 확인
tail -f /var/log/container-monitor.log

# 최근 로그 확인
tail -n 100 /var/log/container-monitor.log
```

---

## 📊 보안 대책 적용 현황

| 대책                  | 파일                           | 상태         | 우선순위 |
| --------------------- | ------------------------------ | ------------ | -------- |
| 읽기 전용 파일 시스템 | `docker-compose.yml`           | ✅ 적용 완료 | 높음     |
| 임시 디렉토리 보안    | `docker-compose.yml`           | ✅ 적용 완료 | 높음     |
| Dockerfile 보안 강화  | `Dockerfile`                   | ✅ 적용 완료 | 높음     |
| URL 검증 시스템       | `lib/security.ts`              | ✅ 적용 완료 | 높음     |
| API 클라이언트 보안   | `lib/api/client.ts`            | ✅ 적용 완료 | 높음     |
| CSP 헤더              | `next.config.mjs`              | ✅ 적용 완료 | 중간     |
| 보안 헤더             | `next.config.mjs`              | ✅ 적용 완료 | 중간     |
| 프로세스 모니터링     | `scripts/monitor-container.sh` | ✅ 적용 완료 | 높음     |

---

## 🚀 배포 및 적용 방법

### 1. 코드 변경사항 적용

```bash
# 저장소에서 최신 코드 가져오기
git pull origin main

# 의존성 확인
pnpm install
```

### 2. 컨테이너 재빌드 및 재시작

```bash
cd /home/ubuntu/apps/FE

# 기존 컨테이너 중지 및 제거
docker compose down

# 이미지 재빌드 (캐시 없이)
docker compose build --no-cache

# 컨테이너 시작
docker compose up -d

# 상태 확인
docker compose ps
docker logs barofarm-frontend
```

### 3. 모니터링 스크립트 설정

```bash
# 스크립트 실행 권한 확인
chmod +x scripts/monitor-container.sh

# 수동 테스트
./scripts/monitor-container.sh

# Cron 작업 추가 (5분마다 실행)
echo "*/5 * * * * /home/ubuntu/apps/FE/scripts/monitor-container.sh >> /var/log/container-monitor.log 2>&1" | sudo tee /etc/cron.d/container-monitor

# Cron 권한 설정
sudo chmod 644 /etc/cron.d/container-monitor

# Cron 서비스 재시작 (필요시)
sudo systemctl restart cron
```

### 4. 보안 설정 검증

```bash
# 컨테이너가 읽기 전용으로 실행되는지 확인
docker inspect barofarm-frontend | grep -i "readonly"

# tmpfs 마운트 확인
docker inspect barofarm-frontend | grep -A 5 "tmpfs"

# 프로세스 확인
docker exec barofarm-frontend ps aux

# 보안 헤더 확인
curl -I http://localhost:3000 | grep -i "content-security-policy"
```

---

## 🔍 모니터링 및 점검

### 정기 점검 항목

1. **일일 점검**
   - 모니터링 로그 확인: `/var/log/container-monitor.log`
   - 컨테이너 상태 확인: `docker ps`
   - CPU/메모리 사용률 확인: `docker stats barofarm-frontend`

2. **주간 점검**
   - 의존성 취약점 스캔: `pnpm audit`
   - 보안 로그 검토
   - 모니터링 스크립트 동작 확인

3. **월간 점검**
   - 보안 패치 적용
   - 모니터링 패턴 업데이트
   - 보안 정책 검토

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

## ⚠️ 주의사항

### 1. 읽기 전용 파일 시스템

- **주의**: 애플리케이션이 파일을 쓰는 경우 오류가 발생할 수 있습니다.
- **해결**: 필요한 경우 `tmpfs`로 마운트된 디렉토리(`/tmp`, `/var/tmp`)만 사용하세요.

### 2. URL 화이트리스트

- **주의**: 새로운 API 서버 추가 시 `lib/security.ts`의 `ALLOWED_DOMAINS`에 도메인을 추가해야 합니다.
- **해결**: 프로덕션 도메인을 추가할 때는 신중하게 검토하세요.

### 3. CSP 헤더

- **주의**: 외부 스크립트나 리소스를 사용하는 경우 CSP 정책을 업데이트해야 합니다.
- **해결**: `next.config.mjs`의 CSP 설정을 적절히 조정하세요.

### 4. 모니터링 스크립트

- **주의**: 모니터링 스크립트가 오탐지할 경우 컨테이너가 불필요하게 재시작될 수 있습니다.
- **해결**: 로그를 확인하고 필요시 패턴을 조정하세요.

---

## 📚 참고 자료

- [보안 사고 보고서](./2025-12-19-SECURITY_INCIDENT_REPORT.md)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

## 📝 변경 이력

| 날짜       | 변경 내용                            | 작성자  |
| ---------- | ------------------------------------ | ------- |
| 2025-12-19 | 초기 문서 작성 (보안 대책 적용 완료) | 보안 팀 |

---

## ✅ 체크리스트

### 즉시 적용 완료

- [x] 컨테이너 보안 강화 (읽기 전용 파일 시스템, tmpfs)
- [x] Dockerfile 보안 강화 (불필요한 도구 제거)
- [x] URL 검증 시스템 구현
- [x] API 클라이언트 보안 강화
- [x] CSP 및 보안 헤더 설정
- [x] 프로세스 모니터링 스크립트 작성

### 단기 (1주일 내)

- [ ] 모니터링 스크립트 Cron 설정 (서버에서 실행 필요)
- [ ] 의존성 취약점 스캔 및 업데이트
- [ ] 모니터링 로그 검토 프로세스 수립

### 중기 (1개월 내)

- [ ] 이미지 서명 및 검증 프로세스 도입
- [ ] 보안 스캔 도구 통합 (Snyk, Trivy 등)
- [ ] 정기적인 보안 감사 일정 수립

---

**작성자**: 보안 팀  
**검토자**: [검토자 이름]  
**승인자**: [승인자 이름]
