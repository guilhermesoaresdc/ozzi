import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type { AddressRow, CustomerRow, OrderItemRow, OrderRow } from '@/lib/database.types'
import { ehDoCariri, type ClienteComResumo } from '@/lib/admin-queries'
import { lerEndereco } from '@/components/admin/pedidos/passos'

export type PedidoDoCliente = OrderRow & { order_items: OrderItemRow[] }

export interface ClienteDetalhe {
  cliente: CustomerRow
  pedidos: PedidoDoCliente[]
  enderecos: AddressRow[]
}

export async function buscarCliente(id: string): Promise<ClienteDetalhe | null> {
  const supabase = await createClient()
  const { data: cliente } = await supabase.from('customers').select('*').eq('id', id).maybeSingle()
  if (!cliente) return null

  const [{ data: pedidos }, { data: enderecos }] = await Promise.all([
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('customer_id', id)
      .order('criado_em', { ascending: false }),
    supabase.from('addresses').select('*').eq('customer_id', id).order('padrao', { ascending: false }),
  ])

  return {
    cliente,
    pedidos: (pedidos ?? []) as PedidoDoCliente[],
    enderecos: enderecos ?? [],
  }
}

export interface ResumoDoCliente {
  pedidos: number
  gastoTotal: number
  ticketMedio: number
  ultimoPedido: string | null
}

/** Cancelado não conta como compra — o mesmo critério de `listarClientes`. */
export function resumoDoCliente(pedidos: PedidoDoCliente[]): ResumoDoCliente {
  const validos = pedidos.filter((p) => p.status !== 'cancelado')
  const gastoTotal = validos.reduce((s, p) => s + Number(p.total), 0)
  const ultimo = validos.reduce<string | null>(
    (maior, p) => (!maior || new Date(p.criado_em) > new Date(maior) ? p.criado_em : maior),
    null,
  )
  return {
    pedidos: validos.length,
    gastoTotal,
    ticketMedio: validos.length ? gastoTotal / validos.length : 0,
    ultimoPedido: ultimo,
  }
}

export interface KpisClientes {
  total: number
  comPedido: number
  recorrentes: number
  cariri: number
  clube: number
  pctRecorrentes: number
  pctCariri: number
  pctClube: number
}

export function kpisClientes(clientes: ClienteComResumo[]): KpisClientes {
  const total = clientes.length
  const parte = (n: number) => (total ? (n / total) * 100 : 0)
  const comPedido = clientes.filter((c) => c.pedidos > 0).length
  const recorrentes = clientes.filter((c) => c.pedidos >= 2).length
  const cariri = clientes.filter((c) => ehDoCariri(c.cidade)).length
  const clube = clientes.filter((c) => c.clube_ozzi).length

  return {
    total,
    comPedido,
    recorrentes,
    cariri,
    clube,
    pctRecorrentes: parte(recorrentes),
    pctCariri: parte(cariri),
    pctClube: parte(clube),
  }
}

/** "Várzea Alegre - CE", ou o que houver. */
export function cidadeUf(cidade: string | null, uf: string | null): string {
  return [cidade, uf].filter(Boolean).join(' - ')
}

/** Endereços salvos no cadastro; sem eles, o último endereço que um pedido carregou. */
export function linhasDeEndereco(
  enderecos: AddressRow[],
  pedidos: PedidoDoCliente[],
): { titulo: string; linhas: string[] }[] {
  if (enderecos.length > 0) {
    return enderecos.map((e) => ({
      titulo: e.padrao ? 'Endereço padrão' : 'Outro endereço',
      linhas: [
        [e.rua, e.numero].filter(Boolean).join(', ') + (e.complemento ? ` · ${e.complemento}` : ''),
        [e.bairro, cidadeUf(e.cidade, e.uf)].filter(Boolean).join(' · '),
        `CEP ${e.cep}`,
      ].filter(Boolean),
    }))
  }

  for (const pedido of pedidos) {
    const endereco = lerEndereco(pedido.endereco)
    if (!endereco) continue
    return [
      {
        titulo: `Do pedido #${pedido.codigo}`,
        linhas: [
          [endereco.rua, endereco.numero].filter(Boolean).join(', ') +
            (endereco.complemento ? ` · ${endereco.complemento}` : ''),
          [endereco.bairro, cidadeUf(endereco.cidade ?? null, endereco.uf ?? null)]
            .filter(Boolean)
            .join(' · '),
          endereco.cep ? `CEP ${endereco.cep}` : '',
        ].filter(Boolean),
      },
    ]
  }

  return []
}
