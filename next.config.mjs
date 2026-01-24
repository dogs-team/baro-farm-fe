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
  // API 요청 프록시 (SameSite 쿠키 문제 해결)
  // 브라우저는 같은 도메인으로 요청을 보내고, Next.js가 백엔드로 프록시
  async rewrites() {
    const gatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://3.34.14.73:8080'
    
    // 환경 변수로 rewrites 사용 여부 제어 (기본값: true)
    const useRewrites = process.env.NEXT_PUBLIC_USE_API_REWRITES !== 'false'
    
    if (!useRewrites) {
      return []
    }

    return [
      {
        source: '/api/auth/:path*',
        destination: `${gatewayUrl}/auth-service/api/:path*`,
      },
      {
        source: '/api/buyer/:path*',
        destination: `${gatewayUrl}/buyer-service/api/:path*`,
      },
      {
        source: '/api/seller/:path*',
        destination: `${gatewayUrl}/seller-service/api/:path*`,
      },
      {
        source: '/api/order/:path*',
        destination: `${gatewayUrl}/order-service/api/:path*`,
      },
      {
        source: '/api/support/:path*',
        destination: `${gatewayUrl}/support-service/api/:path*`,
      },
      {
        source: '/api/ai/:path*',
        destination: `${gatewayUrl}/ai-service/api/:path*`,
      },
    ]
  },
  // 보안 헤더 설정 (SECURITY_INCIDENT_REPORT.md)
  async headers() {
    const gatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://3.34.14.73:8080'
    const gatewayHost = new URL(gatewayUrl).hostname

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
              `connect-src 'self' http://${gatewayHost}:8080 https://api.tosspayments.com`, // API Gateway 및 토스페이먼츠
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
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
