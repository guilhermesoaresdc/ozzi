import type { PedidoCompleto } from '@/lib/admin-queries'
import { brl, dataCurta } from '@/lib/format'
import { ENTREGA } from '@/lib/status'
import { linhasEntrega } from '@/components/admin/pedidos/passos'

/* Fora da impressão a etiqueta não existe; na impressão, só ela aparece. */
const ESTILO = `
.oz-etiqueta { display: none }
@media print {
  body * { visibility: hidden !important }
  .oz-etiqueta { display: block !important; position: absolute; top: 0; left: 0; width: 100%; padding: 0; background: #fff }
  .oz-etiqueta, .oz-etiqueta * { visibility: visible !important; color: #232320 }
  .oz-etiqueta-caixa { border: 1px solid #232320; padding: 22px; max-width: 420px }
}
`

export function EtiquetaImprimivel({
  pedido,
  localizacao,
  nomeLoja,
}: {
  pedido: PedidoCompleto
  localizacao: string
  nomeLoja: string
}) {
  const pecas = (pedido.order_items ?? []).reduce((soma, item) => soma + item.quantidade, 0)
  const retirada = pedido.metodo_entrega === 'retirada'

  return (
    <>
      <style>{ESTILO}</style>
      <div className="oz-etiqueta" aria-hidden="true">
        <div className="oz-etiqueta-caixa">
          <p className="uppercase" style={{ fontSize: 10.5, letterSpacing: '.24em' }}>
            {nomeLoja} · {retirada ? 'Retirada' : 'Envio'}
          </p>
          <p className="font-display" style={{ fontSize: 34, margin: '6px 0 14px' }}>
            #{pedido.codigo}
          </p>

          <p className="uppercase" style={{ fontSize: 10.5, letterSpacing: '.14em' }}>
            {retirada ? 'Cliente' : 'Destinatário'}
          </p>
          <p style={{ fontSize: 14, marginBottom: 12 }}>{pedido.cliente_nome}</p>

          <p className="uppercase" style={{ fontSize: 10.5, letterSpacing: '.14em' }}>
            {retirada ? 'Retirada' : 'Endereço'}
          </p>
          {linhasEntrega(pedido, localizacao).map((linha) => (
            <p key={linha} style={{ fontSize: 13, lineHeight: 1.5 }}>
              {linha}
            </p>
          ))}
          {pedido.cliente_telefone && (
            <p style={{ fontSize: 13, lineHeight: 1.5 }}>{pedido.cliente_telefone}</p>
          )}

          <p style={{ fontSize: 12, marginTop: 14, borderTop: '1px solid #232320', paddingTop: 10 }}>
            {pecas} {pecas === 1 ? 'peça' : 'peças'} · {brl(pedido.total)} · {ENTREGA[pedido.metodo_entrega]}
          </p>
          <p style={{ fontSize: 11, marginTop: 4 }}>
            Pedido de {dataCurta(pedido.criado_em)} · {nomeLoja}, {localizacao}
          </p>
        </div>
      </div>
    </>
  )
}
