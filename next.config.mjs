/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Docker 배포용
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // 보안 헤더 설정 (SECURITY_INCIDENT_REPORT.md)
  async headers() {
    const gatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://3.34.14.73:8080'
    const gatewayHost = new URL(gatewayUrl).hostname

    // 서비스 직접 접근 URL 목록 (게이트웨이 우회)
    const serviceUrls = [
      process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || `http://${gatewayHost}:8081`,
      process.env.NEXT_PUBLIC_BUYER_SERVICE_URL || `http://${gatewayHost}:8082`,
      process.env.NEXT_PUBLIC_SELLER_SERVICE_URL || `http://${gatewayHost}:8085`,
      process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || `http://${gatewayHost}:8087`,
      process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || `http://${gatewayHost}:8087`,
      process.env.NEXT_PUBLIC_SUPPORT_SERVICE_URL || `http://${gatewayHost}:8089`,
      process.env.NEXT_PUBLIC_AI_SERVICE_URL || `http://${gatewayHost}:8092`,
    ]
      .filter(Boolean)
      .map((url) => {
        try {
          const urlObj = new URL(url)
          return `http://${urlObj.hostname}:${urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80')}`
        } catch {
          return url
        }
      })
      .filter((url, index, self) => self.indexOf(url) === index) // 중복 제거

    const connectSrcUrls = [
      "'self'",
      `http://${gatewayHost}:8080`, // 게이트웨이 (하위 호환성)
      ...serviceUrls, // 직접 서비스 접근
      'https://api.tosspayments.com',
      'https://log.tosspayments.com',
      'https://event.tosspayments.com',
      'https://apigw-sandbox.tosspayments.com',
    ].join(' ')

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.tosspayments.com", // Next.js 및 토스페이먼츠 스크립트
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              // ✅ 게이트웨이 및 모든 서비스 직접 접근 허용
              `connect-src ${connectSrcUrls}`,

              // ✅ 결제창/위젯 동작을 위한 frame 허용
              "frame-src 'self' https://*.tosspayments.com",
              "child-src 'self' https://*.tosspayments.com",

              // ✅ 중복 제거하고 한 번만
              "form-action 'self' https://*.tosspayments.com",

              "frame-ancestors 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig
