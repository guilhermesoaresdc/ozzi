import { OpcaoRadio } from '@/components/loja/checkout/OpcaoRadio'
import type { DeliveryMethod, ShippingMethodRow } from '@/lib/database.types'
import { brl } from '@/lib/format'
import { calcularFrete, rotuloFrete } from '@/lib/pricing'

/**
 * Formas de entrega vindas de shipping_methods. O preço mostrado já passa pela
 * regra de frete grátis nos Correios (handoff §7).
 */
export function OpcoesEntrega({
  metodos,
  valor,
  aoMudar,
  subtotal,
  precos,
  freteGratisAcima,
}: {
  metodos: ShippingMethodRow[]
  valor: DeliveryMethod
  aoMudar: (metodo: DeliveryMethod) => void
  subtotal: number
  precos: Partial<Record<DeliveryMethod, number>>
  freteGratisAcima: number
}) {
  return (
    <fieldset className="min-w-0 border-0 p-0" style={{ margin: 0 }}>
      <legend className="oz-label" style={{ marginBottom: 10 }}>
        Forma de entrega
      </legend>
      <div className="flex flex-col" style={{ gap: 10 }}>
        {metodos.map((metodo) => {
          const frete = calcularFrete(metodo.chave, subtotal, precos, freteGratisAcima)
          const correios = metodo.chave === 'pac' || metodo.chave === 'sedex'
          const detalhe =
            correios && frete > 0
              ? `${metodo.detalhe} · grátis acima de ${brl(freteGratisAcima)}`
              : metodo.detalhe

          return (
            <OpcaoRadio
              key={metodo.chave}
              nome="metodo-entrega"
              valor={metodo.chave}
              marcado={valor === metodo.chave}
              aoMarcar={(v) => aoMudar(v as DeliveryMethod)}
              fundoMarcado="#E9E3D9"
              padding="14px 16px"
            >
              <span className="flex flex-wrap items-baseline justify-between" style={{ gap: '4px 14px' }}>
                <span className="flex min-w-0 flex-col" style={{ gap: 3 }}>
                  <span style={{ fontSize: 14 }}>{metodo.nome}</span>
                  <span style={{ fontSize: 11.5, color: '#8A8375' }}>{detalhe}</span>
                </span>
                <span style={{ fontSize: 13.5 }}>{rotuloFrete(frete)}</span>
              </span>
            </OpcaoRadio>
          )
        })}
      </div>
    </fieldset>
  )
}
