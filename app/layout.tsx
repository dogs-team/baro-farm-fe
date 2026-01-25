import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/toaster'
import Providers from '@/components/providers'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '바로팜 | 농장에서 식탁까지',
  description: '신선한 농산물을 농장에서 직접 배송받는 Farm-to-Table 플랫폼',
  keywords: ['농산물', '직거래', '농장', '유기농', '신선농산물', '바로팜', 'BaroFarm'],
  authors: [{ name: '바로팜' }],
  creator: '바로팜',
  publisher: '바로팜',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    title: '바로팜 | 농장에서 식탁까지',
    description: '신선한 농산물을 농장에서 직접 배송받는 Farm-to-Table 플랫폼',
    url: '/',
    siteName: '바로팜',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '바로팜 | 농장에서 식탁까지',
    description: '신선한 농산물을 농장에서 직접 배송받는 Farm-to-Table 플랫폼',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
