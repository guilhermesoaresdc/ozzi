import Link from 'next/link'
import { Card } from '@/components/admin/Card'
import { brl } from '@/lib/format'
import { STATUS_PEDIDO } from '@/lib/status'
import { LinhaLink } from '@/components/admin/visao/LinhaLink'
import { EstadoVazio } from '@/components/admin/visao/EstadoVazio'
import type { PedidoComItens } from '@/lib/admin-queries'

export function PedidosRecentes({ pedidos }: { pedidos: PedidoComItens[] }) {
  return (
    <Card
      titulo="Pedidos recentes"
      acao={
        <Link
          href="/admin/pedidos"
          className="uppercase"
          style={{ fontSize: 11, letterSpacing: '.14em', borderBottom: '1px solid #C9C0B1' }}
        >
          Ver todos
        </Link>
      }
      semPadding
    >
      {pedidos.length === 0 ? (
        <EstadoVazio texto="Nenhum pedido registrado ainda." />
      ) : (
        <div className="flex flex-col">
          {pedidos.map((p, i) => {
            const status = STATUS_PEDIDO[p.status]
            const itens = (p.order_items ?? []).reduce((s, item) => s + item.quantidade, 0)
            return (
              <LinhaLink
                key={p.id}
                href={`/admin/pedidos/${p.codigo}`}
                ultima={i === pedidos.length - 1}
              >
                <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  <span style={{ fontSize: 13.5 }}>{p.cliente_nome}</span>
                  <span style={{ fontSize: 11.5, color: '#8A8375' }}>
                    #{p.codigo} · {itens} {itens === 1 ? 'item' : 'itens'}
                  </span>
                </span>
                <span
                  className="whitespace-nowrap uppercase"
                  style={{ fontSize: 10, letterSpacing: '.12em', color: status.cor }}
                >
                  {status.rotulo}
                </span>
                <span className="whitespace-nowrap" style={{ fontSize: 14 }}>
                  {brl(p.total)}
                </span>
              </LinhaLink>
            )
          })}
        </div>
      )}
    </Card>
  )
}
