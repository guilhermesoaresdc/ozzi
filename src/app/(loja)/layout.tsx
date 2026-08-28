import { PromoBar } from '@/components/loja/PromoBar'
import { Header } from '@/components/loja/Header'
import { Footer } from '@/components/loja/Footer'

export default function LojaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PromoBar />
      <Header />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  )
}
