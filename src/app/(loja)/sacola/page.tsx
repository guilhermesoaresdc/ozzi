import type { Metadata } from 'next'
import { PainelSacola } from '@/components/loja/sacola/PainelSacola'
import { getSettings, getShippingMethods } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Sua sacola',
  description:
    'As peças que você separou na Ozzi, com frete, desconto no PIX e retirada no Centro de Várzea Alegre.',
  alternates: { canonical: '/sacola' },
  // A sacola é pessoal e muda a cada visita: fora do índice.
  robots: { index: false, follow: true },
}

export default async function SacolaPage() {
  // A página é client (a sacola vive no localStorage); os métodos de entrega
  // vêm daqui, do servidor, em vez de uma rota /api.
  const [metodos, config] = await Promise.all([getShippingMethods(), getSettings()])

  return (
    <div style={{ width: '100%', maxWidth: 1180, margin: '0 auto', padding: '44px 28px 92px' }}>
      <h1
        className="font-display"
        style={{ fontWeight: 300, fontSize: 'clamp(36px, 4vw, 48px)', lineHeight: 1.05, marginBottom: 30 }}
      >
        Sua sacola
      </h1>

      <PainelSacola
        metodos={metodos.map((m) => ({
          chave: m.chave,
          nome: m.nome,
          detalhe: m.detalhe,
          preco: Number(m.preco),
        }))}
        freteGratisAcima={Number(config.frete_gratis_acima)}
        taxaPix={Number(config.desconto_pix)}
        parcelas={Number(config.parcelas_max)}
      />
    </div>
  )
}
