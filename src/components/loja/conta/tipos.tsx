import type {
  AddressRow,
  DeliveryMethod,
  OrderEventRow,
  OrderItemRow,
  OrderStatus,
  PaymentMethod,
} from '@/lib/database.types'
import { dataCurta, rotuloDia } from '@/lib/format'
import { ENTREGA } from '@/lib/status'

/**
 * Modelos e regras puras da área da conta (handoff §5.8). Ficam fora do arquivo
 * de consultas para que os componentes de navegador possam importar os tipos
 * sem arrastar o cliente do banco junto.
 */

/** O endereço gravado no pedido é jsonb — mesmas chaves da tabela `addresses`. */
export interface EnderecoPedido {
  cep?: string | null
  rua?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  uf?: string | null
}

export interface PedidoDaConta {
  id: string
  codigo: string
  status: OrderStatus
  metodoEntrega: DeliveryMethod
  metodoPagamento: PaymentMethod
  subtotal: number
  frete: number
  desconto: number
  total: number
  cupom: string | null
  observacao: string | null
  criadoEm: string
  endereco: EnderecoPedido | null
  itens: OrderItemRow[]
  eventos: OrderEventRow[]
}

/** Uma peça pronta para voltar à sacola em "Comprar de novo". */
export interface ItemRecompra {
  variantId: string
  productId: string
  slug: string
  nome: string
  ref: string
  cor: string
  corHex: string
  tamanho: string
  preco: number
  quantidade: number
  foto: string | null
  prontaEntrega: boolean
}

export type Endereco = AddressRow

/** Estado devolvido pelas server actions da conta. */
export interface EstadoConta {
  erro?: string
  ok?: string
  /** Campo a marcar como inválido no formulário. */
  campo?: string
  /** Endereço a que o aviso se refere, quando a ação é de uma linha da lista. */
  id?: string
}

/** Prazo da encomenda, a regra da casa repetida em toda a loja. */
export const PRAZO_ENCOMENDA = 'Previsão de entrega em 10 dias úteis'

const ANDAMENTO: Record<OrderStatus, string> = {
  aguardando_pagamento: 'aguardando o pagamento',
  pago: 'pagamento confirmado',
  em_separacao: 'separando as peças',
  pronto: 'pronto para você',
  postado: 'a caminho',
  entregue: 'entregue',
  sob_encomenda: '',
  cancelado: 'pedido cancelado',
}

/** "24 ago" — o dia sem o ano, para caber na linha de entrega. */
function diaCurto(iso: string): string {
  return dataCurta(iso).replace(/\s\d{4}$/, '')
}

/**
 * A linha de entrega do card (handoff §5.8). Sai sempre de dado real: o método
 * de entrega, o status e, quando existe, o evento previsto do histórico.
 */
export function linhaEntrega(pedido: PedidoDaConta): string {
  const base = ENTREGA[pedido.metodoEntrega]

  if (pedido.status === 'sob_encomenda') return PRAZO_ENCOMENDA

  if (pedido.status === 'entregue') {
    const ultimo = [...pedido.eventos].reverse().find((e) => !e.previsto)
    return ultimo ? `${base} · entregue em ${diaCurto(ultimo.criado_em)}` : `${base} · entregue`
  }

  const previsto = pedido.eventos.find((e) => e.previsto)
  if (previsto && pedido.status !== 'cancelado') {
    const quando = rotuloDia(previsto.criado_em).toLowerCase()
    const hora = previsto.rotulo_tempo ? ` até ${previsto.rotulo_tempo}` : ''
    return `${previsto.titulo} · ${quando}${hora}`
  }

  const andamento = ANDAMENTO[pedido.status]
  return andamento ? `${base} · ${andamento}` : base
}

/** O rótulo do botão muda com o status (handoff §5.8). */
export function acaoDoPedido(status: OrderStatus): 'Ver pedido' | 'Comprar de novo' | 'Acompanhar' {
  if (status === 'entregue') return 'Comprar de novo'
  if (status === 'sob_encomenda') return 'Acompanhar'
  return 'Ver pedido'
}

/** Os nomes das peças, do jeito que o handoff mostra: "Vestido Serrote · Blusa Cordel". */
export function nomesDosItens(itens: OrderItemRow[]): string {
  return itens.map((i) => i.nome).join(' · ')
}

export function enderecoEmLinha(endereco: EnderecoPedido | null): string {
  if (!endereco) return ''
  const rua = [endereco.rua, endereco.numero].filter(Boolean).join(', ')
  const partes = [rua, endereco.complemento, endereco.bairro].filter(Boolean)
  const cidade = [endereco.cidade, endereco.uf].filter(Boolean).join(' - ')
  return [...partes, cidade, endereco.cep].filter(Boolean).join(' · ')
}
