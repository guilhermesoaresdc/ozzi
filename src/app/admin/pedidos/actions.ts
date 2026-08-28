'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { STATUS_PEDIDO } from '@/lib/status'
import { podeCancelar, proximoPasso, STATUS_ALCANCAVEIS } from '@/components/admin/pedidos/passos'
import type { OrderStatus } from '@/lib/database.types'

/** Estado devolvido às telas: erro ou confirmação, sempre em pt-BR. */
export interface EstadoAcao {
  erro?: string
  ok?: string
}

const Codigo = z
  .string()
  .trim()
  .min(3)
  .max(24)
  .regex(/^[A-Za-z0-9-]+$/)

const EsquemaAvancar = z.object({ codigo: Codigo, proximo: z.enum(STATUS_ALCANCAVEIS) })
const EsquemaCancelar = z.object({ codigo: Codigo })

const texto = (dado: FormDataEntryValue | null) => (typeof dado === 'string' ? dado : '')
const rotulo = (status: OrderStatus) => STATUS_PEDIDO[status].rotulo.toLowerCase()

const ERRO_ENTRADA = 'Não entendi o que mudar neste pedido. Recarregue a página e tente de novo.'
const ERRO_SESSAO = 'Sua sessão não tem permissão para alterar pedidos. Entre de novo no painel.'
const ERRO_SALVAR = 'Não foi possível salvar a mudança agora. Tente de novo em instantes.'

/** Cliente de sessão + nome do admin, para assinar o evento do histórico. */
async function admin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: perfil } = await supabase.from('profiles').select('nome, role').eq('id', user.id).maybeSingle()
  if (!perfil || perfil.role !== 'admin') return null

  return { supabase, nome: perfil.nome?.trim() || 'Administração' }
}

function revalidar(codigo: string) {
  revalidatePath('/admin')
  revalidatePath('/admin/pedidos')
  revalidatePath(`/admin/pedidos/${codigo}`)
}

/** Avança o pedido um passo e registra o evento no histórico. */
export async function avancarPedido(_estado: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const entrada = EsquemaAvancar.safeParse({
    codigo: texto(formData.get('codigo')),
    proximo: texto(formData.get('proximo')),
  })
  if (!entrada.success) return { erro: ERRO_ENTRADA }

  const sessao = await admin()
  if (!sessao) return { erro: ERRO_SESSAO }
  const { supabase, nome } = sessao

  const { data: pedido } = await supabase
    .from('orders')
    .select('id, codigo, status, metodo_entrega')
    .eq('codigo', entrada.data.codigo.toUpperCase())
    .maybeSingle()
  if (!pedido) return { erro: 'Pedido não encontrado.' }

  const passo = proximoPasso(pedido.status, pedido.metodo_entrega)
  if (!passo) return { erro: `Este pedido já está ${rotulo(pedido.status)} — não há próximo passo.` }
  if (passo.proximo !== entrada.data.proximo)
    return { erro: 'O pedido mudou de status enquanto esta tela estava aberta. Recarregue a página.' }

  const { error: erroStatus } = await supabase
    .from('orders')
    .update({ status: passo.proximo })
    .eq('id', pedido.id)
  if (erroStatus) return { erro: ERRO_SALVAR }

  const { error: erroEvento } = await supabase
    .from('order_events')
    .insert({ order_id: pedido.id, titulo: passo.evento, autor: nome, previsto: false })

  revalidar(pedido.codigo)

  if (erroEvento)
    return { erro: `Status alterado para ${rotulo(passo.proximo)}, mas o histórico não registrou o evento.` }
  return { ok: `Pedido marcado como ${rotulo(passo.proximo)}.` }
}

/** Cancela o pedido. O estoque não volta sozinho — o histórico guarda o registro. */
export async function cancelarPedido(_estado: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const entrada = EsquemaCancelar.safeParse({ codigo: texto(formData.get('codigo')) })
  if (!entrada.success) return { erro: ERRO_ENTRADA }

  const sessao = await admin()
  if (!sessao) return { erro: ERRO_SESSAO }
  const { supabase, nome } = sessao

  const { data: pedido } = await supabase
    .from('orders')
    .select('id, codigo, status')
    .eq('codigo', entrada.data.codigo.toUpperCase())
    .maybeSingle()
  if (!pedido) return { erro: 'Pedido não encontrado.' }
  if (!podeCancelar(pedido.status))
    return { erro: `Este pedido já está ${rotulo(pedido.status)} e não pode mais ser cancelado.` }

  const { error: erroStatus } = await supabase
    .from('orders')
    .update({ status: 'cancelado' })
    .eq('id', pedido.id)
  if (erroStatus) return { erro: ERRO_SALVAR }

  const { error: erroEvento } = await supabase
    .from('order_events')
    .insert({ order_id: pedido.id, titulo: 'Pedido cancelado', autor: nome, previsto: false })

  revalidar(pedido.codigo)

  if (erroEvento) return { erro: 'Pedido cancelado, mas o histórico não registrou o evento.' }
  return { ok: 'Pedido cancelado.' }
}
