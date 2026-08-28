import type { DeliveryMethod, OrderStatus } from '@/lib/database.types'
import { primeiroNome, soDigitos } from '@/lib/format'
import { ENTREGA } from '@/lib/status'

/* ------------------------------------------------------------------ *
 * Próximo passo do pedido
 * ------------------------------------------------------------------ */

export interface Passo {
  rotulo: string
  proximo: OrderStatus
  /** Título do order_event gravado junto com a mudança. */
  evento: string
}

/** Os únicos status que o painel escreve. */
export const STATUS_ALCANCAVEIS = ['pago', 'pronto', 'postado', 'entregue'] as const
export type StatusAlcancavel = (typeof STATUS_ALCANCAVEIS)[number]

const porCorreios = (entrega: DeliveryMethod) => entrega === 'pac' || entrega === 'sedex'

/** Um passo por vez. `null` quando o pedido já acabou (entregue ou cancelado). */
export function proximoPasso(status: OrderStatus, entrega: DeliveryMethod): Passo | null {
  switch (status) {
    case 'aguardando_pagamento':
      return { rotulo: 'Marcar como pago', proximo: 'pago', evento: 'Pagamento confirmado' }

    case 'pago':
    case 'em_separacao':
      return {
        rotulo: 'Marcar como pronto',
        proximo: 'pronto',
        evento:
          entrega === 'retirada'
            ? 'Pronto para retirada no Centro'
            : porCorreios(entrega)
              ? 'Separado e pronto para postagem'
              : 'Separado e pronto para o motoboy',
      }

    case 'sob_encomenda':
      return { rotulo: 'Marcar como pronto', proximo: 'pronto', evento: 'Encomenda pronta no ateliê' }

    case 'pronto':
      if (entrega === 'retirada')
        return { rotulo: 'Marcar como entregue', proximo: 'entregue', evento: 'Retirado no Centro' }
      return {
        rotulo: 'Marcar como postado',
        proximo: 'postado',
        evento: porCorreios(entrega) ? 'Postado nos Correios' : 'Saiu para entrega com o motoboy',
      }

    case 'postado':
      return { rotulo: 'Marcar como entregue', proximo: 'entregue', evento: 'Pedido entregue' }

    default:
      return null
  }
}

export function podeCancelar(status: OrderStatus): boolean {
  return status !== 'entregue' && status !== 'cancelado'
}

/* ------------------------------------------------------------------ *
 * Aviso no WhatsApp
 * ------------------------------------------------------------------ */

const FRASE: Record<OrderStatus, string> = {
  aguardando_pagamento: 'está esperando a confirmação do pagamento',
  pago: 'está pago e já entrou na fila de separação',
  em_separacao: 'está sendo separado agora',
  pronto: 'está separado e pronto para sair',
  postado: 'já saiu para entrega',
  entregue: 'foi entregue',
  sob_encomenda: 'está em produção no ateliê',
  cancelado: 'foi cancelado',
}

export interface PedidoAviso {
  codigo: string
  cliente_nome: string
  status: OrderStatus
  metodo_entrega: DeliveryMethod
}

export function mensagemWhatsapp(pedido: PedidoAviso): string {
  let frase = FRASE[pedido.status]
  if (pedido.status === 'pronto' && pedido.metodo_entrega === 'retirada')
    frase = 'está pronto para retirada no Centro'
  if (pedido.status === 'postado' && porCorreios(pedido.metodo_entrega)) frase = 'foi postado nos Correios'

  const nome = primeiroNome(pedido.cliente_nome)
  const abertura = nome ? `Oi, ${nome}!` : 'Oi!'
  return `${abertura} Aqui é da Ozzi. Seu pedido #${pedido.codigo} ${frase}. Qualquer dúvida, é só chamar por aqui.`
}

/** `null` quando o pedido não tem telefone utilizável. */
export function linkWhatsapp(telefone: string | null, mensagem: string): string | null {
  const digitos = soDigitos(telefone ?? '')
  if (digitos.length < 10) return null
  const numero = digitos.length <= 11 ? `55${digitos}` : digitos
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`
}

/* ------------------------------------------------------------------ *
 * Endereço de entrega
 * ------------------------------------------------------------------ */

export interface EnderecoPedido {
  cep?: string
  rua?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  uf?: string
}

export function lerEndereco(valor: unknown): EnderecoPedido | null {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return null
  const bruto = valor as Record<string, unknown>
  const txt = (chave: string) => {
    const v = bruto[chave]
    return typeof v === 'string' && v.trim() ? v.trim() : undefined
  }
  const endereco: EnderecoPedido = {
    cep: txt('cep'),
    rua: txt('rua'),
    numero: txt('numero'),
    complemento: txt('complemento'),
    bairro: txt('bairro'),
    cidade: txt('cidade'),
    uf: txt('uf'),
  }
  return endereco.rua || endereco.cidade ? endereco : null
}

export interface PedidoEntrega {
  endereco: unknown
  metodo_entrega: DeliveryMethod
  cliente_cidade: string | null
  cliente_uf: string | null
}

/** As linhas do bloco "Entrega". Sem endereço, diz o que o banco realmente sabe. */
export function linhasEntrega(pedido: PedidoEntrega, localizacao: string): string[] {
  const endereco = lerEndereco(pedido.endereco)

  if (endereco) {
    const rua = [endereco.rua, endereco.numero].filter(Boolean).join(', ')
    const cidade = [endereco.cidade, endereco.uf].filter(Boolean).join(' - ')
    return [
      [rua, endereco.complemento].filter(Boolean).join(' · '),
      [endereco.bairro, cidade].filter(Boolean).join(' · '),
      endereco.cep ? `CEP ${endereco.cep}` : '',
    ].filter(Boolean)
  }

  if (pedido.metodo_entrega === 'retirada') return [`Retirada no ${localizacao}`]

  const destino = [pedido.cliente_cidade, pedido.cliente_uf].filter(Boolean).join(' - ')
  return [
    destino ? `${ENTREGA[pedido.metodo_entrega]} para ${destino}` : ENTREGA[pedido.metodo_entrega],
    'Endereço ainda não cadastrado neste pedido',
  ]
}

/** A etiqueta só existe quando há o que imprimir: retirada ou endereço de envio. */
export function motivoSemEtiqueta(pedido: PedidoEntrega): string | null {
  if (pedido.metodo_entrega === 'retirada' || lerEndereco(pedido.endereco)) return null
  return 'Este pedido ainda não tem endereço cadastrado — sem ele não há etiqueta de envio para imprimir.'
}
