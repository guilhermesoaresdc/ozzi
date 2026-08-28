import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/admin/PageHeader'
import { CartaoCliente } from '@/components/admin/pedidos/CartaoCliente'
import { CartaoHistorico } from '@/components/admin/pedidos/CartaoHistorico'
import { CartaoItens } from '@/components/admin/pedidos/CartaoItens'
import { EtiquetaImprimivel } from '@/components/admin/pedidos/EtiquetaImprimivel'
import { ProximoPasso } from '@/components/admin/pedidos/ProximoPasso'
import { motivoSemEtiqueta } from '@/components/admin/pedidos/passos'
import { buscarPedido, historicoDoCliente } from '@/lib/admin-queries'
import { dataLonga } from '@/lib/format'
import { getSettings } from '@/lib/queries'

type Params = Promise<{ codigo: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { codigo } = await params
  return { title: `Pedido #${codigo.toUpperCase()}` }
}

export default async function PedidoPage({ params }: { params: Params }) {
  const { codigo } = await params
  const pedido = await buscarPedido(codigo)
  if (!pedido) notFound()

  const [historico, settings] = await Promise.all([
    historicoDoCliente(pedido.customer_id),
    getSettings(),
  ])

  const semEtiqueta = motivoSemEtiqueta(pedido)

  return (
    <>
      <PageHeader
        titulo={`Pedido #${pedido.codigo}`}
        subtitulo={`${pedido.cliente_nome} · ${dataLonga(pedido.criado_em)}`}
      />

      <main style={{ padding: '26px 30px 60px' }}>
        <Link
          href="/admin/pedidos"
          className="inline-block uppercase text-muted hover:text-ink"
          style={{ fontSize: 11, letterSpacing: '.14em', marginBottom: 20 }}
        >
          ← Todos os pedidos
        </Link>

        <div className="grid items-start gap-[22px] lg:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-[22px] lg:col-span-2">
            <CartaoItens pedido={pedido} taxaPix={Number(settings.desconto_pix)} />
            <CartaoHistorico eventos={pedido.order_events ?? []} />
          </div>

          <div className="flex flex-col gap-[22px] lg:sticky lg:top-[104px]">
            <ProximoPasso
              codigo={pedido.codigo}
              status={pedido.status}
              metodoEntrega={pedido.metodo_entrega}
              clienteNome={pedido.cliente_nome}
              telefone={pedido.cliente_telefone ?? pedido.customers?.telefone ?? null}
              motivoSemEtiqueta={semEtiqueta}
            />
            <CartaoCliente pedido={pedido} historico={historico} localizacao={settings.localizacao} />
          </div>
        </div>

        {!semEtiqueta && (
          <EtiquetaImprimivel
            pedido={pedido}
            localizacao={settings.localizacao}
            nomeLoja={settings.nome_loja}
          />
        )}
      </main>
    </>
  )
}
