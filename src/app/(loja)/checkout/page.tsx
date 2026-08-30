import type { Metadata } from 'next'
import { Etapas } from '@/components/loja/checkout/Etapas'
import { PainelCheckout } from '@/components/loja/checkout/PainelCheckout'
import type { DeliveryMethod } from '@/lib/database.types'
import { getPaymentOptions, getSettings, getShippingMethods } from '@/lib/queries'
import { WHATSAPP } from '@/lib/supabase/config'

type Busca = Promise<{ [chave: string]: string | string[] | undefined }>

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Entrega e pagamento do seu pedido na Ozzi.',
  robots: { index: false, follow: false },
}

const ENTREGAS: DeliveryMethod[] = ['retirada', 'motoboy', 'pac', 'sedex']

function lerEntrega(valor: string | string[] | undefined): DeliveryMethod | null {
  const bruto = Array.isArray(valor) ? valor[0] : valor
  return ENTREGAS.find((e) => e === bruto) ?? null
}

export default async function CheckoutPage({ searchParams }: { searchParams: Busca }) {
  const { entrega } = await searchParams
  const [metodosEntrega, opcoesPagamento, settings] = await Promise.all([
    getShippingMethods(),
    getPaymentOptions(),
    getSettings(),
  ])

  // A escolha vem da sacola pela URL; sem ela, a retirada é o padrão da casa.
  const escolhida = lerEntrega(entrega)
  const entregaInicial =
    (escolhida && metodosEntrega.some((m) => m.chave === escolhida) ? escolhida : null) ??
    metodosEntrega[0]?.chave ??
    'retirada'

  return (
    <div className="shell-narrow" style={{ padding: '44px 28px 92px' }}>
      <Etapas atual={2} linkarAnteriores />
      <PainelCheckout
        metodosEntrega={metodosEntrega}
        opcoesPagamento={opcoesPagamento}
        entregaInicial={entregaInicial}
        freteGratisAcima={Number(settings.frete_gratis_acima)}
        taxaAVista={Number(settings.desconto_avista)}
        parcelasMax={settings.parcelas_max}
        whatsapp={WHATSAPP}
      />
    </div>
  )
}
