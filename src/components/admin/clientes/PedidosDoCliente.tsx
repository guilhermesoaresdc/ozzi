import Link from 'next/link'
import { Card, TableScroll } from '@/components/admin/Card'
import type { PedidoDoCliente } from '@/components/admin/clientes/dados'
import { brl, dataCurta, hora } from '@/lib/format'
import { ENTREGA, STATUS_PEDIDO } from '@/lib/status'

const COLUNAS = '1.4fr 1.3fr 1.1fr .9fr'
const CABECALHOS = ['Pedido', 'Entrega', 'Status', 'Total']

export function PedidosDoCliente({ pedidos }: { pedidos: PedidoDoCliente[] }) {
  return (
    <Card
      semPadding
      titulo={
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 400 }}>
          Pedidos
        </h2>
      }
      acao={
        <span className="uppercase" style={{ fontSize: 11, letterSpacing: '.14em', color: '#8A8375' }}>
          {pedidos.length === 1 ? '1 pedido' : `${pedidos.length} pedidos`}
        </span>
      }
    >
      {pedidos.length === 0 ? (
        <div className="text-center" style={{ padding: '40px 22px' }}>
          <p style={{ fontSize: 13.5, color: '#5C574D' }}>Esta cliente ainda não fez nenhum pedido.</p>
          <p className="mt-[6px]" style={{ fontSize: 12, color: '#8A8375' }}>
            O cadastro existe, mas nenhuma compra foi fechada até agora.
          </p>
        </div>
      ) : (
        <TableScroll minWidth={560}>
          <div
            className="grid gap-[14px] border-b border-line px-5 py-[14px] uppercase"
            style={{ gridTemplateColumns: COLUNAS, fontSize: 10.5, letterSpacing: '.14em', color: '#8A8375' }}
          >
            {CABECALHOS.map((c) => (
              <span key={c} className={c === 'Total' ? 'text-right' : undefined}>
                {c}
              </span>
            ))}
          </div>

          <ul>
            {pedidos.map((pedido, i) => {
              const status = STATUS_PEDIDO[pedido.status]
              const pecas = (pedido.order_items ?? []).reduce((s, item) => s + item.quantidade, 0)
              return (
                <li key={pedido.id}>
                  <Link
                    href={`/admin/pedidos/${pedido.codigo}`}
                    className="oz-table-row grid items-center gap-[14px] px-5 py-[15px] hover:text-ink"
                    style={{
                      gridTemplateColumns: COLUNAS,
                      borderBottom: i === pedidos.length - 1 ? undefined : '1px solid #E4DDD1',
                    }}
                  >
                    <span className="flex flex-col gap-[3px]">
                      <span style={{ fontSize: 13.5 }}>#{pedido.codigo}</span>
                      <span style={{ fontSize: 11, color: '#8A8375' }}>
                        {dataCurta(pedido.criado_em)} · {hora(pedido.criado_em)} · {pecas}{' '}
                        {pecas === 1 ? 'peça' : 'peças'}
                      </span>
                    </span>

                    <span style={{ fontSize: 12.5, color: '#5C574D' }}>
                      {ENTREGA[pedido.metodo_entrega]}
                    </span>

                    <span
                      className="uppercase"
                      style={{ fontSize: 10.5, letterSpacing: '.12em', color: status.cor }}
                    >
                      {status.rotulo}
                    </span>

                    <span className="text-right" style={{ fontSize: 14 }}>
                      {brl(pedido.total)}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </TableScroll>
      )}
    </Card>
  )
}
