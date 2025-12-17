'use client'

import { Card } from '@/components/ui/card'

interface ProductDescriptionSectionProps {
  description: string
}

export function ProductDescriptionSection({ description }: ProductDescriptionSectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">상품 설명</h2>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </Card>
  )
}
