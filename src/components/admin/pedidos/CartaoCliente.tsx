import { Card } from '@/components/admin/Card'
import type { PedidoCompleto } from '@/lib/admin-queries'
import { brl } from '@/lib/format'
import { linhasEntrega } from '@/components/admin/pedidos/passos'

export function CartaoCliente({
  pedido,
  historico,
  localizacao,
}: {
  pedido: PedidoCompleto
  historico: { pedidos: number; total: number }
  localizacao: string
}) {
  const telefone = pedido.cliente_telefone ?? pedido.customers?.telefone ?? null

  const resumo = !pedido.customer_id
    ? ['Pedido sem cadastro vinculado']
    : [`${historico.pedidos} ${historico.pedidos === 1 ? 'pedido' : 'pedidos'} · ${brl(historico.total)} no total`]

  const campos: { label: string; valores: string[] }[] = [
    { label: 'Nome', valores: [pedido.cliente_nome] },
    { label: 'WhatsApp', valores: [telefone ?? 'Não informado neste pedido'] },
    { label: 'Entrega', valores: linhasEntrega(pedido, localizacao) },
    { label: 'Histórico', valores: resumo },
  ]

  return (
    <Card>
      <h2 className="font-display" style={{ fontSize: 20, fontWeight: 400, marginBottom: 14 }}>
        Cliente
      </h2>
      <div className="flex flex-col gap-[14px]" style={{ fontSize: 13, lineHeight: 1.6 }}>
        {campos.map((campo) => (
          <div key={campo.label}>
            <p className="oz-label" style={{ marginBottom: 4 }}>
              {campo.label}
            </p>
            {campo.valores.map((valor) => (
              <p key={valor} style={{ color: '#232320' }}>
                {valor}
              </p>
            ))}
          </div>
        ))}
      </div>
    </Card>
  )
}
