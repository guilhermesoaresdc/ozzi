import type { Metadata } from 'next'
import { PageHeader } from '@/components/admin/PageHeader'
import { Tabs, type Aba } from '@/components/admin/Tabs'
import { TabelaPedidos } from '@/components/admin/pedidos/TabelaPedidos'
import { ABAS_PEDIDO, contarPedidosPorAba, listarPedidos, type AbaPedido } from '@/lib/admin-queries'

export const metadata: Metadata = { title: 'Pedidos' }

type Busca = Promise<{ [chave: string]: string | string[] | undefined }>

const ROTULOS: Record<AbaPedido, string> = {
  abertos: 'Abertos',
  pagos: 'Pagos',
  enviados: 'Enviados',
  encomendas: 'Encomendas',
  concluidos: 'Concluídos',
}

const VAZIOS: Record<AbaPedido, string> = {
  abertos: 'Nenhum pedido aberto agora — nada esperando por você.',
  pagos: 'Nenhum pedido pago esperando separação.',
  enviados: 'Nenhum pedido postado no momento.',
  encomendas: 'Nenhuma encomenda em produção no ateliê.',
  concluidos: 'Nenhum pedido concluído ainda.',
}

const CHAVES = Object.keys(ABAS_PEDIDO) as AbaPedido[]

function lerAba(valor: string | string[] | undefined): AbaPedido {
  const bruto = Array.isArray(valor) ? valor[0] : valor
  return CHAVES.find((c) => c === bruto) ?? 'abertos'
}

export default async function PedidosPage({ searchParams }: { searchParams: Busca }) {
  const { aba } = await searchParams
  const atual = lerAba(aba)

  const [contagens, pedidos] = await Promise.all([contarPedidosPorAba(), listarPedidos(atual)])

  const aguardando = contagens.abertos
  const abas: Aba[] = CHAVES.map((chave) => ({
    chave,
    rotulo: ROTULOS[chave],
    contagem: contagens[chave],
  }))

  return (
    <>
      <PageHeader
        titulo="Pedidos"
        subtitulo={`${aguardando} ${aguardando === 1 ? 'pedido' : 'pedidos'} aguardando ação`}
      />

      <main style={{ padding: '26px 30px 60px' }}>
        <div style={{ marginBottom: 20 }}>
          <Tabs abas={abas} ativa={atual} base="/admin/pedidos" />
        </div>

        <TabelaPedidos pedidos={pedidos} vazio={VAZIOS[atual]} />
      </main>
    </>
  )
}
