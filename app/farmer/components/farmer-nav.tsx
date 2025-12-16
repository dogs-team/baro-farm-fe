'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const FARMER_LINKS = [
  { href: '/farmer/dashboard', label: '대시보드' },
  { href: '/farmer/products', label: '상품 관리' },
  { href: '/farmer/orders', label: '주문 관리' },
  { href: '/farmer/experiences', label: '체험 관리' },
  { href: '/farmer/bookings', label: '예약 관리' },
  { href: '/farmer/farm', label: '농장 관리' },
] as const

export function FarmerNav() {
  const pathname = usePathname()

  return (
    <nav className="mb-6 flex flex-wrap gap-2">
      {FARMER_LINKS.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
        return (
          <Button
            key={link.href}
            asChild
            size="sm"
            variant={isActive ? 'default' : 'outline'}
            className={isActive ? '' : 'bg-background'}
          >
            <Link href={link.href}>{link.label}</Link>
          </Button>
        )
      })}
    </nav>
  )
}
