import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type {
  AddressRow,
  CustomerRow,
  OrderEventRow,
  OrderItemRow,
  OrderRow,
  ProfileRow,
  VariantRow,
} from '@/lib/database.types'
import type { EnderecoPedido, ItemRecompra, PedidoDaConta } from '@/components/loja/conta/tipos'

/**
 * Consultas da área da conta. Todas passam pelo cliente de sessão: o RLS já
 * limita as linhas ao cadastro ligado ao login (`orders.customer_id =
 * my_customer_id()`), então nenhuma delas filtra por cliente na mão.
 */

type LinhaPedido = OrderRow & {
  order_items?: OrderItemRow[] | null
  order_events?: OrderEventRow[] | null
}

const CAMPOS_PEDIDO =
  'id, codigo, status, metodo_entrega, metodo_pagamento, subtotal, frete, desconto, total, cupom, observacao, criado_em, endereco'

function lerEndereco(bruto: unknown): EnderecoPedido | null {
  if (!bruto || typeof bruto !== 'object' || Array.isArray(bruto)) return null
  return bruto as EnderecoPedido
}

function paraPedido(linha: LinhaPedido): PedidoDaConta {
  const eventos = [...(linha.order_events ?? [])].sort(
    (a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime(),
  )

  return {
    id: linha.id,
    codigo: linha.codigo,
    status: linha.status,
    metodoEntrega: linha.metodo_entrega,
    metodoPagamento: linha.metodo_pagamento,
    subtotal: Number(linha.subtotal),
    frete: Number(linha.frete),
    desconto: Number(linha.desconto),
    total: Number(linha.total),
    cupom: linha.cupom,
    observacao: linha.observacao,
    criadoEm: linha.criado_em,
    endereco: lerEndereco(linha.endereco),
    itens: linha.order_items ?? [],
    eventos,
  }
}

/** Os pedidos do cadastro ligado ao login, do mais novo para o mais antigo. */
export async function pedidosDaConta(): Promise<PedidoDaConta[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select(`${CAMPOS_PEDIDO}, order_items(*), order_events(*)`)
    .order('criado_em', { ascending: false })

  return ((data ?? []) as unknown as LinhaPedido[]).map(paraPedido)
}

export async function pedidoDaConta(codigo: string): Promise<PedidoDaConta | null> {
  const limpo = codigo.trim().toUpperCase()
  if (!/^[A-Z0-9-]{3,24}$/.test(limpo)) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select(`${CAMPOS_PEDIDO}, order_items(*), order_events(*)`)
    .eq('codigo', limpo)
    .maybeSingle()

  return data ? paraPedido(data as unknown as LinhaPedido) : null
}

type LinhaVariante = Pick<VariantRow, 'id' | 'product_id' | 'cor_nome' | 'cor_hex' | 'tamanho' | 'estoque'> & {
  products?: {
    id: string
    slug: string
    nome: string
    ref: string
    preco: number
    fotos: unknown
    status: string
  } | null
}

/**
 * O que ainda dá para recomprar, por pedido. Só entra peça ativa na vitrine e
 * com estoque — "Comprar de novo" não pode prometer o que não existe mais.
 */
export async function recompraPorPedido(
  pedidos: PedidoDaConta[],
): Promise<Record<string, ItemRecompra[]>> {
  const variantes = [
    ...new Set(pedidos.flatMap((p) => p.itens.map((i) => i.variant_id).filter(Boolean) as string[])),
  ]
  if (variantes.length === 0) return {}

  const supabase = await createClient()
  const { data } = await supabase
    .from('variants')
    .select('id, product_id, cor_nome, cor_hex, tamanho, estoque, products(id, slug, nome, ref, preco, fotos, status)')
    .in('id', variantes)

  const porVariante = new Map<string, LinhaVariante>()
  for (const linha of (data ?? []) as unknown as LinhaVariante[]) porVariante.set(linha.id, linha)

  const mapa: Record<string, ItemRecompra[]> = {}

  for (const pedido of pedidos) {
    const disponiveis: ItemRecompra[] = []

    for (const item of pedido.itens) {
      if (!item.variant_id) continue
      const variante = porVariante.get(item.variant_id)
      const produto = variante?.products
      if (!variante || !produto || produto.status !== 'ativo') continue

      const quantidade = Math.min(item.quantidade, variante.estoque)
      if (quantidade < 1) continue

      const fotos = Array.isArray(produto.fotos) ? (produto.fotos as string[]) : []

      disponiveis.push({
        variantId: variante.id,
        productId: produto.id,
        slug: produto.slug,
        nome: produto.nome,
        ref: produto.ref,
        cor: variante.cor_nome,
        corHex: variante.cor_hex,
        tamanho: variante.tamanho,
        preco: Number(produto.preco),
        quantidade,
        foto: item.foto ?? fotos[0] ?? null,
        prontaEntrega: true,
      })
    }

    mapa[pedido.id] = disponiveis
  }

  return mapa
}

export interface Cadastro {
  profile: ProfileRow | null
  customer: CustomerRow | null
  email: string
}

/** Perfil (login) e cadastro de cliente (pedidos) da pessoa que está na conta. */
export async function meuCadastro(): Promise<Cadastro> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { profile: null, customer: null, email: '' }

  const [{ data: profile }, { data: customer }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('customers').select('*').eq('profile_id', user.id).maybeSingle(),
  ])

  return { profile: profile ?? null, customer: customer ?? null, email: user.email ?? profile?.email ?? '' }
}

/** Endereços salvos. O padrão vem primeiro; depois, o mais recente. */
export async function meusEnderecos(): Promise<AddressRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('addresses')
    .select('*')
    .order('padrao', { ascending: false })
    .order('criado_em', { ascending: false })
  return (data ?? []) as AddressRow[]
}
