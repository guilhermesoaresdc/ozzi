import Link from 'next/link'
import { TableScroll } from '@/components/admin/Card'
import type { PedidoComItens } from '@/lib/admin-queries'
import { brl, dataCurta, hora } from '@/lib/format'
import { ENTREGA, PAGAMENTO, STATUS_PEDIDO } from '@/lib/status'

const COLUNAS = '1fr 1.7fr 1.5fr 1.4fr 1fr 1fr'
const CABECALHOS = ['Pedido', 'Cliente', 'Entrega', 'Pagamento', 'Status', 'Total']

export function TabelaPedidos({ pedidos, vazio }: { pedidos: PedidoComItens[]; vazio: string }) {
  if (pedidos.length === 0) {
    return (
      <div className="oz-card text-center" style={{ padding: '48px 22px' }}>
        <p style={{ fontSize: 13.5, color: '#5C574D' }}>{vazio}</p>
        <p className="mt-[6px]" style={{ fontSize: 12, color: '#8A8375' }}>
          Assim que um pedido chegar nesta etapa, ele aparece aqui.
        </p>
      </div>
    )
  }

  return (
    <div className="oz-card">
      <TableScroll minWidth={920}>
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
            const cidade = [pedido.cliente_cidade, pedido.cliente_uf].filter(Boolean).join(' · ')
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
                      {dataCurta(pedido.criado_em)} · {hora(pedido.criado_em)}
                    </span>
                  </span>

                  <span className="flex min-w-0 flex-col gap-[3px]">
                    <span className="truncate" style={{ fontSize: 13.5 }}>
                      {pedido.cliente_nome}
                    </span>
                    <span className="truncate" style={{ fontSize: 11, color: '#8A8375' }}>
                      {cidade || 'Cidade não informada'}
                    </span>
                  </span>

                  <span style={{ fontSize: 12.5, color: '#5C574D' }}>{ENTREGA[pedido.metodo_entrega]}</span>
                  <span style={{ fontSize: 12.5, color: '#5C574D' }}>{PAGAMENTO[pedido.metodo_pagamento]}</span>

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
    </div>
  )
}
