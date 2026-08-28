import { Card } from '@/components/admin/Card'
import { Placeholder } from '@/components/ui/Placeholder'
import type { PedidoCompleto } from '@/lib/admin-queries'
import { brl } from '@/lib/format'
import { rotuloFrete } from '@/lib/pricing'
import { ENTREGA, STATUS_PEDIDO } from '@/lib/status'

/** Rótulo da linha de desconto: cupom, PIX ou o genérico. */
function rotuloDesconto(pedido: PedidoCompleto, taxaPix: number): string {
  if (pedido.cupom) return `Desconto · cupom ${pedido.cupom}`
  if (pedido.metodo_pagamento === 'pix') return `Desconto PIX (${Math.round(taxaPix * 100)}%)`
  return 'Desconto'
}

export function CartaoItens({ pedido, taxaPix }: { pedido: PedidoCompleto; taxaPix: number }) {
  const itens = pedido.order_items ?? []
  const status = STATUS_PEDIDO[pedido.status]
  const desconto = Number(pedido.desconto)
  // "Total pago" só é verdade depois que o pagamento entrou.
  const totalRotulo = pedido.status === 'aguardando_pagamento' ? 'Total a pagar' : 'Total pago'

  return (
    <Card
      semPadding
      titulo={
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 400 }}>
          Itens do pedido
        </h2>
      }
      acao={
        <span className="uppercase" style={{ fontSize: 11, letterSpacing: '.14em', color: status.cor }}>
          {status.rotulo}
        </span>
      }
    >
      <ul>
        {itens.map((item) => {
          const detalhe = [item.variante, item.ref].filter(Boolean).join(' · ')
          return (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-4 px-[22px] py-4"
              style={{ borderBottom: '1px solid #E4DDD1' }}
            >
              <Placeholder
                src={item.foto}
                alt={item.nome}
                ratio="3/4"
                densidade="denso"
                sizes="58px"
                className="w-[58px] shrink-0"
              />
              <span className="flex min-w-0 flex-1 basis-[180px] flex-col gap-1">
                <span style={{ fontSize: 14 }}>{item.nome}</span>
                {detalhe && <span style={{ fontSize: 11.5, color: '#8A8375' }}>{detalhe}</span>}
              </span>
              <span style={{ fontSize: 13, color: '#5C574D' }}>{item.quantidade} un</span>
              <span style={{ fontSize: 14 }}>{brl(Number(item.preco_unitario) * item.quantidade)}</span>
            </li>
          )
        })}
      </ul>

      <div
        className="flex flex-col gap-[9px] px-[22px] py-[18px]"
        style={{ fontSize: 13, color: '#5C574D' }}
      >
        <div className="flex justify-between gap-5">
          <span>Subtotal</span>
          <span style={{ color: '#232320' }}>{brl(pedido.subtotal)}</span>
        </div>
        <div className="flex justify-between gap-5">
          <span>Frete · {ENTREGA[pedido.metodo_entrega]}</span>
          <span style={{ color: '#232320' }}>{rotuloFrete(Number(pedido.frete))}</span>
        </div>
        {desconto > 0 && (
          <div className="flex justify-between gap-5">
            <span>{rotuloDesconto(pedido, taxaPix)}</span>
            <span style={{ color: '#8A6A4F' }}>− {brl(desconto)}</span>
          </div>
        )}
        <div
          className="flex items-baseline justify-between gap-5 border-t border-line"
          style={{ paddingTop: 12, marginTop: 4 }}
        >
          <span className="uppercase" style={{ fontSize: 11, letterSpacing: '.14em', color: '#232320' }}>
            {totalRotulo}
          </span>
          <span className="font-display" style={{ fontSize: 28, color: '#232320' }}>
            {brl(pedido.total)}
          </span>
        </div>
      </div>
    </Card>
  )
}
