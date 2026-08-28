import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CartaoPedido } from '@/components/loja/conta/CartaoPedido'
import { EsqueletoPedidos, SemPedidos, TituloConta } from '@/components/loja/conta/Estados'
import { pedidosDaConta, recompraPorPedido } from '@/components/loja/conta/consultas'

export const metadata: Metadata = {
  title: 'Meus pedidos',
  description: 'Acompanhe seus pedidos na Ozzi: status, itens, entrega e histórico de cada etapa.',
}

async function Lista() {
  const pedidos = await pedidosDaConta()
  if (pedidos.length === 0) return <SemPedidos />

  // Só os entregues ganham "Comprar de novo" — só eles precisam da consulta.
  const recompra = await recompraPorPedido(pedidos.filter((p) => p.status === 'entregue'))

  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      {pedidos.map((pedido) => (
        <CartaoPedido key={pedido.id} pedido={pedido} recompra={recompra[pedido.id] ?? []} />
      ))}
    </div>
  )
}

export default function MeusPedidosPage() {
  return (
    <>
      <TituloConta>Meus pedidos</TituloConta>
      <Suspense fallback={<EsqueletoPedidos />}>
        <Lista />
      </Suspense>
    </>
  )
}
