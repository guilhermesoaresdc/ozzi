import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type {
  BannerRow,
  CouponRow,
  CustomerRow,
  EmailAutomationRow,
  EmailCampaignRow,
  EmailListRow,
  NoticeRow,
  OrderEventRow,
  OrderItemRow,
  OrderRow,
  OrderStatus,
  PaymentOptionRow,
  ProductRow,
  ProductStatus,
  ShippingMethodRow,
  VariantRow,
} from '@/lib/database.types'

/* ------------------------------------------------------------------ *
 * Pedidos
 * ------------------------------------------------------------------ */

export type PedidoComItens = OrderRow & { order_items: OrderItemRow[] }
export type PedidoCompleto = PedidoComItens & {
  order_events: OrderEventRow[]
  customers: CustomerRow | null
}

export const ABAS_PEDIDO = {
  abertos: ['aguardando_pagamento', 'pago', 'em_separacao', 'pronto'] as OrderStatus[],
  pagos: ['pago'] as OrderStatus[],
  enviados: ['postado'] as OrderStatus[],
  encomendas: ['sob_encomenda'] as OrderStatus[],
  concluidos: ['entregue'] as OrderStatus[],
}

export type AbaPedido = keyof typeof ABAS_PEDIDO

export async function listarPedidos(aba: AbaPedido = 'abertos'): Promise<PedidoComItens[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .in('status', ABAS_PEDIDO[aba])
    .order('criado_em', { ascending: false })
  return (data ?? []) as PedidoComItens[]
}

export async function contarPedidosPorAba(): Promise<Record<AbaPedido, number>> {
  const supabase = await createClient()
  const { data } = await supabase.from('orders').select('status')
  const linhas = data ?? []
  const conta = (chaves: OrderStatus[]) => linhas.filter((o) => chaves.includes(o.status)).length
  return {
    abertos: conta(ABAS_PEDIDO.abertos),
    pagos: conta(ABAS_PEDIDO.pagos),
    enviados: conta(ABAS_PEDIDO.enviados),
    encomendas: conta(ABAS_PEDIDO.encomendas),
    concluidos: conta(ABAS_PEDIDO.concluidos),
  }
}

export async function buscarPedido(codigo: string): Promise<PedidoCompleto | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*), order_events(*), customers(*)')
    .eq('codigo', codigo.toUpperCase())
    .maybeSingle()
  if (!data) return null
  const pedido = data as unknown as PedidoCompleto
  pedido.order_events = [...(pedido.order_events ?? [])].sort(
    (a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime(),
  )
  return pedido
}

/** Quantos pedidos e quanto o cliente já gastou — o bloco "Histórico" do detalhe. */
export async function historicoDoCliente(customerId: string | null) {
  if (!customerId) return { pedidos: 0, total: 0 }
  const supabase = await createClient()
  const { data } = await supabase.from('orders').select('total').eq('customer_id', customerId)
  const linhas = data ?? []
  return {
    pedidos: linhas.length,
    total: linhas.reduce((s, o) => s + Number(o.total), 0),
  }
}

/* ------------------------------------------------------------------ *
 * Produtos
 * ------------------------------------------------------------------ */

export type ProdutoAdmin = ProductRow & {
  categories: { nome: string; slug: string } | null
  variants: VariantRow[]
}

export interface ResumoEstoque {
  total: number
  esgotadas: string[]
  cores: number
}

export function resumoEstoque(variantes: VariantRow[]): ResumoEstoque {
  const total = variantes.reduce((s, v) => s + v.estoque, 0)
  const porTamanho = new Map<string, number>()
  for (const v of variantes) porTamanho.set(v.tamanho, (porTamanho.get(v.tamanho) ?? 0) + v.estoque)
  const esgotadas = [...porTamanho].filter(([, q]) => q === 0).map(([t]) => t)
  return { total, esgotadas, cores: new Set(variantes.map((v) => v.cor_nome)).size }
}

export const ABAS_PRODUTO = {
  todos: null,
  ativos: 'ativo',
  encomenda: 'encomenda',
  rascunhos: 'rascunho',
} as const

export type AbaProduto = keyof typeof ABAS_PRODUTO

export async function listarProdutos(aba: AbaProduto = 'todos'): Promise<ProdutoAdmin[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, categories(nome, slug), variants(*)')
    .order('criado_em', { ascending: false })

  const todos = (data ?? []) as unknown as ProdutoAdmin[]
  if (aba === 'todos') return todos
  if (aba === 'ativos') return todos.filter((p) => p.status === 'ativo')
  if (aba === 'rascunhos') return todos.filter((p) => p.status === 'rascunho')
  // "Sob encomenda": grade inteira zerada, mas a peça aceita encomenda
  return todos.filter(
    (p) => p.aceita_encomenda && p.status !== 'rascunho' && resumoEstoque(p.variants ?? []).total === 0,
  )
}

export async function contarProdutosPorAba(): Promise<Record<AbaProduto, number>> {
  const todos = await listarProdutos('todos')
  return {
    todos: todos.length,
    ativos: todos.filter((p) => p.status === 'ativo').length,
    encomenda: todos.filter(
      (p) => p.aceita_encomenda && p.status !== 'rascunho' && resumoEstoque(p.variants ?? []).total === 0,
    ).length,
    rascunhos: todos.filter((p) => p.status === 'rascunho').length,
  }
}

export async function listarCategorias() {
  const supabase = await createClient()
  const { data } = await supabase.from('categories').select('*').order('ordem', { ascending: true })
  return data ?? []
}

/* ------------------------------------------------------------------ *
 * Visão geral
 * ------------------------------------------------------------------ */

export interface DiaDeVenda {
  dia: string
  rotulo: string
  receita: number
}

export interface VisaoGeral {
  vendasHoje: number
  vendasOntem: number
  pedidosAbertos: number
  aguardandoPagamento: number
  ticketMedio: number
  ticketMedioMesPassado: number
  pecasNaSemana: number
  pedidosNaSemana: number
  serie: DiaDeVenda[]
  precisaDeVoce: { rotulo: string; detalhe: string; contagem: number; href: string }[]
  recentes: PedidoComItens[]
  alertaEstoque: { produto: ProdutoAdmin; resumo: ResumoEstoque }[]
}

const CANCELADOS: OrderStatus[] = ['cancelado']

export async function visaoGeral(agora: Date = new Date()): Promise<VisaoGeral> {
  const supabase = await createClient()
  const inicioDe = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const hoje = inicioDe(agora)
  const de14Dias = new Date(hoje.getTime() - 13 * 86_400_000)

  const [{ data: pedidos }, { data: produtos }, { data: recentes }] = await Promise.all([
    supabase.from('orders').select('*, order_items(*)').order('criado_em', { ascending: false }),
    supabase.from('products').select('*, categories(nome, slug), variants(*)'),
    supabase.from('orders').select('*, order_items(*)').order('criado_em', { ascending: false }).limit(5),
  ])

  const todos = ((pedidos ?? []) as PedidoComItens[]).filter((o) => !CANCELADOS.includes(o.status))
  const noDia = (o: PedidoComItens) => inicioDe(new Date(o.criado_em)).getTime()

  const vendasHoje = todos.filter((o) => noDia(o) === hoje.getTime()).reduce((s, o) => s + Number(o.total), 0)
  const ontem = hoje.getTime() - 86_400_000
  const vendasOntem = todos.filter((o) => noDia(o) === ontem).reduce((s, o) => s + Number(o.total), 0)

  const ticketMedio = todos.length ? todos.reduce((s, o) => s + Number(o.total), 0) / todos.length : 0
  const mesPassado = todos.filter((o) => new Date(o.criado_em) < new Date(hoje.getTime() - 30 * 86_400_000))
  const ticketMedioMesPassado = mesPassado.length
    ? mesPassado.reduce((s, o) => s + Number(o.total), 0) / mesPassado.length
    : ticketMedio

  const semana = todos.filter((o) => new Date(o.criado_em) >= new Date(hoje.getTime() - 6 * 86_400_000))
  const pecasNaSemana = semana.reduce(
    (s, o) => s + (o.order_items ?? []).reduce((t, i) => t + i.quantidade, 0),
    0,
  )

  const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
  const serie: DiaDeVenda[] = []
  for (let i = 0; i < 14; i++) {
    const d = new Date(de14Dias.getTime() + i * 86_400_000)
    serie.push({
      dia: `${d.getDate()}/${d.getMonth() + 1}`,
      rotulo: `${d.getDate()} ${MESES[d.getMonth()]}`,
      receita: todos.filter((o) => noDia(o) === d.getTime()).reduce((s, o) => s + Number(o.total), 0),
    })
  }

  const lista = ((produtos ?? []) as unknown as ProdutoAdmin[]).map((p) => ({
    produto: p,
    resumo: resumoEstoque(p.variants ?? []),
  }))

  const semFoto = lista.filter(
    ({ produto }) => produto.status !== 'rascunho' && (produto.fotos as unknown[])?.length === 0,
  ).length

  const precisaDeVoce = [
    {
      rotulo: 'Pedidos para separar',
      detalhe: 'Pagos, esperando a sacola ser montada',
      contagem: todos.filter((o) => o.status === 'pago' || o.status === 'em_separacao').length,
      href: '/admin/pedidos?aba=abertos',
    },
    {
      rotulo: 'Aguardando pagamento',
      detalhe: 'PIX ou cartão ainda não confirmado',
      contagem: todos.filter((o) => o.status === 'aguardando_pagamento').length,
      href: '/admin/pedidos?aba=abertos',
    },
    {
      rotulo: 'Encomendas em produção',
      detalhe: 'No ateliê, prazo de até 10 dias úteis',
      contagem: todos.filter((o) => o.status === 'sob_encomenda').length,
      href: '/admin/pedidos?aba=encomendas',
    },
    {
      rotulo: 'Peças sem foto',
      detalhe: 'Publicadas com placeholder na vitrine',
      contagem: semFoto,
      href: '/admin/produtos',
    },
  ]

  const alertaEstoque = lista
    .filter(({ produto, resumo }) => produto.status === 'ativo' && (resumo.total === 0 || resumo.total <= 5))
    .sort((a, b) => a.resumo.total - b.resumo.total)
    .slice(0, 5)

  return {
    vendasHoje,
    vendasOntem,
    pedidosAbertos: todos.filter((o) => ABAS_PEDIDO.abertos.includes(o.status)).length,
    aguardandoPagamento: todos.filter((o) => o.status === 'aguardando_pagamento').length,
    ticketMedio,
    ticketMedioMesPassado,
    pecasNaSemana,
    pedidosNaSemana: semana.length,
    serie,
    precisaDeVoce,
    recentes: (recentes ?? []) as PedidoComItens[],
    alertaEstoque,
  }
}

/* ------------------------------------------------------------------ *
 * Clientes
 * ------------------------------------------------------------------ */

export interface ClienteComResumo extends CustomerRow {
  pedidos: number
  gastoTotal: number
  ultimoPedido: string | null
}

export async function listarClientes(): Promise<ClienteComResumo[]> {
  const supabase = await createClient()
  const [{ data: clientes }, { data: pedidos }] = await Promise.all([
    supabase.from('customers').select('*').order('criado_em', { ascending: false }),
    supabase.from('orders').select('customer_id, total, criado_em, status'),
  ])

  const porCliente = new Map<string, { pedidos: number; gastoTotal: number; ultimo: string | null }>()
  for (const o of pedidos ?? []) {
    if (!o.customer_id || o.status === 'cancelado') continue
    const atual = porCliente.get(o.customer_id) ?? { pedidos: 0, gastoTotal: 0, ultimo: null }
    atual.pedidos += 1
    atual.gastoTotal += Number(o.total)
    if (!atual.ultimo || new Date(o.criado_em) > new Date(atual.ultimo)) atual.ultimo = o.criado_em
    porCliente.set(o.customer_id, atual)
  }

  return (clientes ?? []).map((c) => {
    const r = porCliente.get(c.id)
    return { ...c, pedidos: r?.pedidos ?? 0, gastoTotal: r?.gastoTotal ?? 0, ultimoPedido: r?.ultimo ?? null }
  })
}

const CIDADES_CARIRI = [
  'várzea alegre', 'juazeiro do norte', 'crato', 'barbalha', 'lavras da mangabeira',
  'iguatu', 'cedro', 'aurora', 'farias brito', 'granjeiro', 'caririaçu', 'missão velha',
]

export function ehDoCariri(cidade: string | null): boolean {
  if (!cidade) return false
  return CIDADES_CARIRI.includes(cidade.trim().toLowerCase())
}

/* ------------------------------------------------------------------ *
 * Conteúdo e configuração
 * ------------------------------------------------------------------ */

export async function listarAvisos(): Promise<NoticeRow[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('notices').select('*').order('ordem', { ascending: true })
  return data ?? []
}

export async function listarBanners(): Promise<BannerRow[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('banners').select('*').order('ordem', { ascending: true })
  return data ?? []
}

export async function listarCupons(): Promise<CouponRow[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('coupons').select('*').order('criado_em', { ascending: true })
  return data ?? []
}

export async function listarEntregas(): Promise<ShippingMethodRow[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('shipping_methods').select('*').order('ordem', { ascending: true })
  return data ?? []
}

export async function listarPagamentos(): Promise<PaymentOptionRow[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('payment_options').select('*').order('ordem', { ascending: true })
  return data ?? []
}

/* ------------------------------------------------------------------ *
 * E-mail marketing
 * ------------------------------------------------------------------ */

export type CampanhaComLista = EmailCampaignRow & { email_lists: { nome: string } | null }

export async function listarCampanhas(): Promise<CampanhaComLista[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('email_campaigns')
    .select('*, email_lists(nome)')
    .order('criado_em', { ascending: false })
  return (data ?? []) as unknown as CampanhaComLista[]
}

export async function listarAutomacoes(): Promise<EmailAutomationRow[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('email_automations').select('*').order('nome', { ascending: true })
  return data ?? []
}

export async function listarListas(): Promise<EmailListRow[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('email_lists').select('*').order('ordem', { ascending: true })
  return data ?? []
}

export async function kpisEmail() {
  const [campanhas, listas, clientes] = await Promise.all([listarCampanhas(), listarListas(), listarClientes()])
  const enviadas = campanhas.filter((c) => c.aberturas !== null)
  const media = (vals: (number | null)[]) => {
    const n = vals.filter((v): v is number => v !== null)
    return n.length ? n.reduce((s, v) => s + v, 0) / n.length : 0
  }
  return {
    contatos: clientes.filter((c) => c.opt_in_email).length,
    contatosLista: listas[0]?.contagem ?? 0,
    abertura: media(enviadas.map((c) => c.aberturas)),
    cliques: media(enviadas.map((c) => c.cliques)),
    receita: campanhas.reduce((s, c) => s + Number(c.receita ?? 0), 0),
    automacoesAtivas: 0,
  }
}

export type { ProductStatus }
