import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Kpi } from '@/components/admin/Card'
import { PageHeader } from '@/components/admin/PageHeader'
import { CartaoContato } from '@/components/admin/clientes/CartaoContato'
import { CartaoEnderecos } from '@/components/admin/clientes/CartaoEnderecos'
import { PedidosDoCliente } from '@/components/admin/clientes/PedidosDoCliente'
import {
  buscarCliente,
  cidadeUf,
  linhasDeEndereco,
  nomeDoCliente,
  resumoDoCliente,
} from '@/components/admin/clientes/dados'
import { ehDoCariri } from '@/lib/admin-queries'
import { brl, dataCurta, num } from '@/lib/format'

type Params = Promise<{ id: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params
  return { title: (await nomeDoCliente(id)) ?? 'Cliente' }
}

export default async function ClientePage({ params }: { params: Params }) {
  const { id } = await params
  const detalhe = await buscarCliente(id)
  if (!detalhe) notFound()

  const { cliente, pedidos, enderecos } = detalhe
  const resumo = resumoDoCliente(pedidos)
  const cidade = cidadeUf(cliente.cidade, cliente.uf)
  const cancelados = pedidos.length - resumo.pedidos

  const subtitulo = [
    cidade || 'Cidade não informada',
    ehDoCariri(cliente.cidade) ? 'Cariri' : null,
    `cliente desde ${dataCurta(cliente.criado_em)}`,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <>
      <PageHeader titulo={cliente.nome} subtitulo={subtitulo} />

      <main style={{ padding: '26px 30px 60px' }}>
        <Link
          href="/admin/clientes"
          className="inline-block uppercase text-muted hover:text-ink"
          style={{ fontSize: 11, letterSpacing: '.14em', marginBottom: 20 }}
        >
          ← Todos os clientes
        </Link>

        <div className="grid items-start gap-[22px] lg:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-[22px] lg:col-span-2">
            <div
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 1 }}
            >
              <Kpi
                label="Pedidos"
                valor={num(resumo.pedidos)}
                tendencia={
                  cancelados > 0
                    ? `${num(cancelados)} ${cancelados === 1 ? 'cancelado' : 'cancelados'} fora da conta`
                    : 'nenhum pedido cancelado'
                }
                cor="#8A8375"
              />
              <Kpi label="Gasto total" valor={brl(resumo.gastoTotal)} />
              <Kpi
                label="Ticket médio"
                valor={brl(resumo.ticketMedio)}
                tendencia={cliente.clube_ozzi ? 'participa do Clube Ozzi' : 'fora do Clube Ozzi'}
                cor="#8A8375"
              />
            </div>

            <PedidosDoCliente pedidos={pedidos} />
          </div>

          <div className="flex flex-col gap-[22px] lg:sticky lg:top-[104px]">
            <CartaoContato cliente={cliente} resumo={resumo} />
            <CartaoEnderecos enderecos={linhasDeEndereco(enderecos, pedidos)} />
          </div>
        </div>
      </main>
    </>
  )
}
