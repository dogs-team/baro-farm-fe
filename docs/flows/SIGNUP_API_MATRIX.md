# Signup API Matrix

`/signup` 페이지에서 실제로 호출하는 API 흐름 정리.

## 서비스 베이스 URL

- 사용자/인증: `USER` (`/user-service`)
- 지원/입금: `SUPPORT` (`/support-service`)

필요하면 `NEXT_PUBLIC_USER_SERVICE_URL`로 `user-service` base URL을 직접 오버라이드할 수 있습니다.

## API 호출 순서

| 순서 | 용도 | Method | Endpoint | 호출 위치 |
| --- | --- | --- | --- | --- |
| 1 | 이메일 인증코드 발송 | `POST` | `/api/v1/auth/verification/email/send-code` | `userService.requestEmailVerification` |
| 2 | 이메일 인증코드 검증 | `POST` | `/api/v1/auth/verification/email/verify-code` | `userService.verifyEmailCode` |
| 3 | 회원가입 | `POST` | `/api/v1/auth/signup` | `userService.signup` |
| 4 | 예치금 계정 생성(2차 호출) | `POST` | 1차 `/api/v1/deposits/create`, 404 시 `/internal/deposits/create` fallback | `depositService.createDeposit` |

## 요청/응답 메모

### 1) 이메일 인증코드 발송

- Request

```json
{
  "email": "user@example.com"
}
```

- 주요 실패: `400`, `404`, `429`, `500`

### 2) 이메일 인증코드 검증

- Request

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

- Response 예시

```json
{
  "verified": true
}
```

- 구현 메모: `verified` 필드가 없어도 HTTP 200이면 인증 성공으로 처리

### 3) 회원가입

- Request

```json
{
  "email": "user@example.com",
  "password": "string",
  "name": "홍길동",
  "phone": "010-1234-5678"
}
```

- Response

```json
{
  "userId": "uuid",
  "email": "user@example.com"
}
```

- 주요 실패: `409`(중복 이메일), `400`, `422`, `500`
- 구현 메모: 성공 직후 인증 쿠키는 백엔드가 발급

### 4) 예치금 계정 생성

- Request Body: 없음 (`userId` body 전달 금지)
- 사용 컨텍스트: 인증 쿠키/헤더 기반
- 실패 처리: 가입 자체를 막지 않고 로그만 남김
- 권장 서버 동작: 이미 계정이 있어도 멱등 성공 처리(`200`/`204`)

## 프론트 연동 규칙

- `isEmailVerified=false`면 `signup` 호출 금지
- 비밀번호 불일치면 `signup` 호출 금지
- `signup` 성공 후 `authStateChanged` 이벤트 발생
- 완료 후 `/`로 이동
