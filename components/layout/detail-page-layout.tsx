import { Header } from './header'

interface DetailPageLayoutProps {
  children: React.ReactNode
}

export function DetailPageLayout({ children }: DetailPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header showCart />
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  )
}
