'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { mascaraCep, mascaraCpf, mascaraTelefone, soDigitos } from '@/lib/format'
import type { EstadoConta } from '@/components/loja/conta/tipos'

/**
 * Escrita da área da conta. Tudo passa pelo cliente de sessão — o RLS só deixa
 * a pessoa mexer no próprio perfil, no próprio cadastro e nos próprios
 * endereços. Nada aqui aceita id de cliente vindo do formulário.
 */

const ERRO_ENTRADA = 'Não entendi os dados enviados. Recarregue a página e tente de novo.'
const ERRO_SESSAO = 'Sua sessão expirou. Entre de novo para salvar.'
const ERRO_SALVAR = 'Não foi possível salvar agora. Tente de novo em instantes.'
const ERRO_SEM_CADASTRO =
  'Seu cadastro de cliente é criado no primeiro pedido — por isso ainda não dá para salvar endereço aqui.'

const texto = (dado: FormDataEntryValue | null) => (typeof dado === 'string' ? dado : '')

const Id = z.string().regex(/^[0-9a-fA-F-]{36}$/)

const EsquemaDados = z.object({
  nome: z.string().max(120),
  telefone: z.string().max(24),
  cpf: z.string().max(18),
  cidade: z.string().max(80),
  uf: z.string().max(2),
})

const EsquemaEndereco = z.object({
  cep: z.string().max(12),
  rua: z.string().max(120),
  numero: z.string().max(20),
  complemento: z.string().max(60),
  bairro: z.string().max(80),
  cidade: z.string().max(80),
  uf: z.string().max(2),
  padrao: z.string().max(4),
})

/** Sessão + id do cadastro de cliente (pode não existir antes do primeiro pedido). */
async function sessao() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: cliente } = await supabase
    .from('customers')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle()

  return { supabase, userId: user.id, customerId: cliente?.id ?? null }
}

/**
 * Meus dados: grava no perfil (o login) e, quando existe, no cadastro de
 * cliente que os pedidos usam. O e-mail não muda por aqui.
 */
export async function salvarDados(_estado: EstadoConta, formData: FormData): Promise<EstadoConta> {
  const entrada = EsquemaDados.safeParse({
    nome: texto(formData.get('nome')),
    telefone: texto(formData.get('telefone')),
    cpf: texto(formData.get('cpf')),
    cidade: texto(formData.get('cidade')),
    uf: texto(formData.get('uf')),
  })
  if (!entrada.success) return { erro: ERRO_ENTRADA }

  const nome = entrada.data.nome.trim().replace(/\s+/g, ' ')
  const telefone = soDigitos(entrada.data.telefone)
  const cpf = soDigitos(entrada.data.cpf)
  const cidade = entrada.data.cidade.trim()
  const uf = entrada.data.uf.trim().toUpperCase()

  if (nome.length < 2) return { erro: 'Digite seu nome para a gente saber como te chamar', campo: 'nome' }
  if (telefone && telefone.length < 10)
    return { erro: 'O celular tem DDD + 9 dígitos', campo: 'telefone' }
  if (cpf && cpf.length !== 11) return { erro: 'O CPF tem 11 dígitos', campo: 'cpf' }
  if (uf && !/^[A-Z]{2}$/.test(uf)) return { erro: 'A UF tem duas letras — CE, PE, PB', campo: 'uf' }

  const atual = await sessao()
  if (!atual) return { erro: ERRO_SESSAO }
  const { supabase, userId, customerId } = atual

  const campos = {
    nome,
    telefone: telefone ? mascaraTelefone(telefone) : null,
    cpf: cpf ? mascaraCpf(cpf) : null,
    cidade: cidade || null,
    uf: uf || null,
  }

  const { error } = await supabase.from('profiles').update(campos).eq('id', userId)
  if (error) return { erro: ERRO_SALVAR }

  if (customerId) {
    const { error: erroCliente } = await supabase.from('customers').update(campos).eq('id', customerId)
    if (erroCliente) return { erro: ERRO_SALVAR }
  }

  // A saudação da barra lateral vem do perfil.
  revalidatePath('/conta', 'layout')

  return { ok: 'Seus dados foram salvos' }
}

/** Novo endereço. O CEP vem do formulário já consultado no ViaCEP. */
export async function salvarEndereco(_estado: EstadoConta, formData: FormData): Promise<EstadoConta> {
  const entrada = EsquemaEndereco.safeParse({
    cep: texto(formData.get('cep')),
    rua: texto(formData.get('rua')),
    numero: texto(formData.get('numero')),
    complemento: texto(formData.get('complemento')),
    bairro: texto(formData.get('bairro')),
    cidade: texto(formData.get('cidade')),
    uf: texto(formData.get('uf')),
    padrao: texto(formData.get('padrao')),
  })
  if (!entrada.success) return { erro: ERRO_ENTRADA }

  const cep = soDigitos(entrada.data.cep)
  const rua = entrada.data.rua.trim()
  const numero = entrada.data.numero.trim()
  const complemento = entrada.data.complemento.trim()
  const bairro = entrada.data.bairro.trim()
  const cidade = entrada.data.cidade.trim()
  const uf = entrada.data.uf.trim().toUpperCase()

  if (cep.length !== 8) return { erro: 'O CEP tem 8 dígitos', campo: 'cep' }
  if (rua.length < 3) return { erro: 'Digite a rua', campo: 'rua' }
  if (!numero) return { erro: 'Digite o número — se não tiver, escreva S/N', campo: 'numero' }
  if (cidade.length < 2) return { erro: 'Digite a cidade', campo: 'cidade' }
  if (!/^[A-Z]{2}$/.test(uf)) return { erro: 'A UF tem duas letras — CE, PE, PB', campo: 'uf' }

  const atual = await sessao()
  if (!atual) return { erro: ERRO_SESSAO }
  const { supabase, customerId } = atual
  if (!customerId) return { erro: ERRO_SEM_CADASTRO }

  const marcado = entrada.data.padrao === 'on' || entrada.data.padrao === 'true'

  // O primeiro endereço da conta já entra como padrão, mesmo sem a marcação.
  const { count } = await supabase
    .from('addresses')
    .select('id', { count: 'exact', head: true })
    .eq('customer_id', customerId)
  const padrao = marcado || (count ?? 0) === 0

  if (padrao) {
    await supabase.from('addresses').update({ padrao: false }).eq('customer_id', customerId)
  }

  const { error } = await supabase.from('addresses').insert({
    customer_id: customerId,
    cep: mascaraCep(cep),
    rua,
    numero,
    complemento: complemento || null,
    bairro: bairro || null,
    cidade,
    uf,
    padrao,
  })
  if (error) return { erro: ERRO_SALVAR }

  revalidatePath('/conta/enderecos')
  return { ok: 'Endereço salvo' }
}

/** Marca um endereço como padrão e tira a marca dos outros. */
export async function definirPadrao(_estado: EstadoConta, formData: FormData): Promise<EstadoConta> {
  const entrada = Id.safeParse(texto(formData.get('id')))
  if (!entrada.success) return { erro: ERRO_ENTRADA }

  const atual = await sessao()
  if (!atual) return { erro: ERRO_SESSAO }
  const { supabase, customerId } = atual
  if (!customerId) return { erro: ERRO_SEM_CADASTRO }

  await supabase.from('addresses').update({ padrao: false }).eq('customer_id', customerId)
  const { error } = await supabase
    .from('addresses')
    .update({ padrao: true })
    .eq('id', entrada.data)
    .eq('customer_id', customerId)
  if (error) return { erro: ERRO_SALVAR, id: entrada.data }

  revalidatePath('/conta/enderecos')
  return { ok: 'Endereço padrão atualizado', id: entrada.data }
}

/** Remove um endereço. Se ele era o padrão, o mais recente assume. */
export async function removerEndereco(_estado: EstadoConta, formData: FormData): Promise<EstadoConta> {
  const entrada = Id.safeParse(texto(formData.get('id')))
  if (!entrada.success) return { erro: ERRO_ENTRADA }

  const atual = await sessao()
  if (!atual) return { erro: ERRO_SESSAO }
  const { supabase, customerId } = atual
  if (!customerId) return { erro: ERRO_SEM_CADASTRO }

  const { data: alvo } = await supabase
    .from('addresses')
    .select('id, padrao')
    .eq('id', entrada.data)
    .maybeSingle()

  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', entrada.data)
    .eq('customer_id', customerId)
  if (error) return { erro: 'Não foi possível remover o endereço agora.', id: entrada.data }

  if (alvo?.padrao) {
    const { data: proximo } = await supabase
      .from('addresses')
      .select('id')
      .eq('customer_id', customerId)
      .order('criado_em', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (proximo) await supabase.from('addresses').update({ padrao: true }).eq('id', proximo.id)
  }

  revalidatePath('/conta/enderecos')
  return { ok: 'Endereço removido' }
}
