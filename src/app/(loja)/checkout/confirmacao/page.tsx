import type { Metadata } from 'next'
import {
  Confirmacao,
  PedidoNaoEncontrado,
  type ItemConfirmado,
  type PedidoConfirmado,
} from '@/components/loja/checkout/Confirmacao'
import { Etapas } from '@/components/loja/checkout/Etapas'
import type { DeliveryMethod, OrderStatus, PaymentMethod } from '@/lib/database.types'
import { STATUS_PEDIDO, ENTREGA, PAGAMENTO } from '@/lib/status'
import { getSettings } from '@/lib/queries'
import { createClient } from '@/lib/supabase/server'
import { WHATSAPP } from '@/lib/supabase/config'

type Busca = Promise<{ [chave: string]: string | string[] | undefined }>

export const metadata: Metadata = {
  title: 'Pedido confirmado',
  description: 'Confirmação do seu pedido na Ozzi.',
  robots: { index: false, follow: false },
}

/** A página depende do código e do e-mail da URL — nunca é pré-renderizada. */
export const dynamic = 'force-dynamic'

function primeiro(valor: string | string[] | undefined): string {
  return (Array.isArray(valor) ? (valor[0] ?? '') : (valor ?? '')).trim()
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor : ''
}

function numero(valor: unknown): number {
  const n = Number(valor)
  return Number.isFinite(n) ? n : 0
}

function lerItens(valor: unknown): ItemConfirmado[] {
  if (!Array.isArray(valor)) return []
  return valor.flatMap((bruto) => {
    if (!bruto || typeof bruto !== 'object') return []
    const item = bruto as Record<string, unknown>
    return [
      {
        nome: texto(item.nome),
        variante: texto(item.variante),
        quantidade: Math.max(1, Math.trunc(numero(item.quantidade))),
        precoUnitario: numero(item.preco_unitario),
        foto: typeof item.foto === 'string' && item.foto ? item.foto : null,
      },
    ]
  })
}

/** O retorno da RPC é jsonb: só entra na tela o que tem a forma esperada. */
function lerPedido(valor: unknown): PedidoConfirmado | null {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return null
  const bruto = valor as Record<string, unknown>

  const codigo = texto(bruto.codigo)
  const status = texto(bruto.status) as OrderStatus
  const metodoEntrega = texto(bruto.metodo_entrega) as DeliveryMethod
  const metodoPagamento = texto(bruto.metodo_pagamento) as PaymentMethod

  if (!codigo) return null
  if (!(status in STATUS_PEDIDO)) return null
  if (!(metodoEntrega in ENTREGA) || !(metodoPagamento in PAGAMENTO)) return null

  return {
    codigo,
    status,
    metodoEntrega,
    metodoPagamento,
    subtotal: numero(bruto.subtotal),
    frete: numero(bruto.frete),
    desconto: numero(bruto.desconto),
    total: numero(bruto.total),
    criadoEm: texto(bruto.criado_em),
    clienteNome: texto(bruto.cliente_nome),
    itens: lerItens(bruto.itens),
  }
}

export default async function ConfirmacaoPage({ searchParams }: { searchParams: Busca }) {
  const parametros = await searchParams
  const codigo = primeiro(parametros.codigo)
  const email = primeiro(parametros.email)

  let pedido: PedidoConfirmado | null = null

  if (codigo && email) {
    try {
      const supabase = await createClient()
      const { data } = await supabase.rpc('pedido_publico', { p_codigo: codigo, p_email: email })
      pedido = lerPedido(data)
    } catch {
      pedido = null
    }
  }

  const settings = await getSettings()

  return (
    <div className="shell-narrow" style={{ padding: '44px 28px 92px' }}>
      <Etapas atual={3} />
      {pedido ? (
        <Confirmacao
          pedido={pedido}
          email={email}
          whatsapp={WHATSAPP}
          taxaPix={Number(settings.desconto_pix)}
        />
      ) : (
        <PedidoNaoEncontrado whatsapp={WHATSAPP} />
      )}
    </div>
  )
}
