import type { Metadata } from 'next'
import { getSettings } from '@/lib/queries'
import { DetalhePedido } from '@/components/loja/conta/DetalhePedido'
import { PedidoNaoAchado } from '@/components/loja/conta/Estados'
import { pedidoDaConta } from '@/components/loja/conta/consultas'

type Params = Promise<{ codigo: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { codigo } = await params
  return { title: `Pedido #${decodeURIComponent(codigo).toUpperCase()}` }
}

export default async function PedidoDaContaPage({ params }: { params: Params }) {
  const { codigo } = await params

  // O RLS só devolve pedido do cadastro ligado a este login.
  const [pedido, config] = await Promise.all([
    pedidoDaConta(decodeURIComponent(codigo)),
    getSettings(),
  ])

  if (!pedido) return <PedidoNaoAchado />

  return <DetalhePedido pedido={pedido} taxaAVista={Number(config.desconto_avista)} />
}
