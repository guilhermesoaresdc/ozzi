'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { brl } from '@/lib/format'
import { CHAVES_REGRA, descricaoDoCupom } from '@/components/admin/config/dados'

/** Estado devolvido às telas: erro ou confirmação, sempre em pt-BR. */
export interface EstadoAcao {
  erro?: string
  ok?: string
}

const ERRO_ENTRADA = 'Não entendi o que salvar nesta tela. Recarregue a página e tente de novo.'
const ERRO_SESSAO = 'Sua sessão não tem permissão para mudar as configurações. Entre de novo no painel.'
const ERRO_SALVAR = 'Não foi possível salvar agora. Tente de novo em instantes.'

const texto = (dado: FormDataEntryValue | null) => (typeof dado === 'string' ? dado : '')

/** Cliente de sessão com o papel conferido — o RLS silencioso não avisaria. */
async function admin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: perfil } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (perfil?.role !== 'admin') return null

  return supabase
}

/** Frete, desconto do PIX e formas de pagamento aparecem na loja inteira. */
function revalidar() {
  revalidatePath('/admin/configuracoes')
  revalidatePath('/', 'layout')
}

/** "12,00", "1.234,56" e "12.5" viram número. Null quando não é número. */
function paraNumero(valor: string): number | null {
  const limpo = valor.trim().replace(/\s/g, '').replace(/^R\$/i, '')
  if (!limpo) return null
  const normal = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo
  if (!/^\d+(\.\d{1,4})?$/.test(normal)) return null
  const n = Number(normal)
  return Number.isFinite(n) ? n : null
}

/** Duas casas: as colunas de dinheiro são numeric(10,2). */
const emCentavos = (n: number) => Math.round(n * 100) / 100

/* ------------------------------------------------------------------ *
 * Entrega e retirada
 * ------------------------------------------------------------------ */

const EsquemaEntregas = z.object({
  freteGratisAcima: z.string(),
  linhas: z
    .array(
      z.object({
        chave: z.enum(['retirada', 'motoboy', 'pac', 'sedex']),
        nome: z.string().trim().min(1),
        preco: z.string(),
        ativo: z.boolean(),
      }),
    )
    .min(1, ERRO_ENTRADA)
    .max(8, ERRO_ENTRADA),
})

export async function salvarEntregas(_estado: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  let bruto: unknown
  try {
    bruto = JSON.parse(texto(formData.get('entregas')))
  } catch {
    return { erro: ERRO_ENTRADA }
  }

  const entrada = EsquemaEntregas.safeParse({
    freteGratisAcima: texto(formData.get('frete_gratis_acima')),
    linhas: bruto,
  })
  if (!entrada.success) return { erro: entrada.error.issues[0]?.message ?? ERRO_ENTRADA }

  const limite = paraNumero(entrada.data.freteGratisAcima)
  if (limite === null || limite > 99_999)
    return { erro: 'O valor de “Frete grátis acima de” precisa ser um número em reais, como 249,00.' }

  const linhas: { chave: 'retirada' | 'motoboy' | 'pac' | 'sedex'; preco: number; ativo: boolean }[] = []
  for (const l of entrada.data.linhas) {
    // A retirada é sempre grátis: na tela o campo dela fica desabilitado.
    const preco = l.chave === 'retirada' ? 0 : paraNumero(l.preco)
    if (preco === null || preco > 9_999)
      return { erro: `O preço de ${l.nome} precisa ser um número em reais, como 12,00.` }
    linhas.push({ chave: l.chave, preco: emCentavos(preco), ativo: l.ativo })
  }

  const supabase = await admin()
  if (!supabase) return { erro: ERRO_SESSAO }

  const { error: erroLimite } = await supabase
    .from('store_settings')
    .update({ frete_gratis_acima: emCentavos(limite) })
    .eq('id', true)
  if (erroLimite) return { erro: ERRO_SALVAR }

  for (const l of linhas) {
    const { error } = await supabase
      .from('shipping_methods')
      .update({ preco: l.preco, ativo: l.ativo })
      .eq('chave', l.chave)
    if (error) {
      revalidar()
      return { erro: ERRO_SALVAR }
    }
  }

  revalidar()

  const ligadas = linhas.filter((l) => l.ativo).length
  if (ligadas === 0)
    return { ok: 'Entrega salva. Nenhuma forma está ligada — o checkout fica sem opção de envio.' }
  return {
    ok: `Entrega salva. ${ligadas} ${ligadas === 1 ? 'forma ligada' : 'formas ligadas'} · frete grátis acima de ${brl(limite)}.`,
  }
}

/* ------------------------------------------------------------------ *
 * Pagamentos
 * ------------------------------------------------------------------ */

const EsquemaPagamentos = z.object({
  descontoPix: z.string(),
  parcelasMax: z.string(),
  linhas: z
    .array(
      z.object({
        chave: z.enum(['pix', 'cartao', 'whatsapp', 'na_retirada']),
        nome: z.string().trim().min(1),
        ativo: z.boolean(),
      }),
    )
    .min(1, ERRO_ENTRADA)
    .max(8, ERRO_ENTRADA),
})

export async function salvarPagamentos(_estado: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  let bruto: unknown
  try {
    bruto = JSON.parse(texto(formData.get('pagamentos')))
  } catch {
    return { erro: ERRO_ENTRADA }
  }

  const entrada = EsquemaPagamentos.safeParse({
    descontoPix: texto(formData.get('desconto_pix')),
    parcelasMax: texto(formData.get('parcelas_max')),
    linhas: bruto,
  })
  if (!entrada.success) return { erro: entrada.error.issues[0]?.message ?? ERRO_ENTRADA }

  const porcento = paraNumero(entrada.data.descontoPix)
  if (porcento === null || porcento > 50)
    return { erro: 'O desconto do PIX precisa ser um número entre 0 e 50, como 5 ou 7,5.' }

  const parcelas = Number(entrada.data.parcelasMax.trim())
  if (!Number.isInteger(parcelas) || parcelas < 1 || parcelas > 12)
    return { erro: 'O número máximo de parcelas precisa ser um número inteiro de 1 a 12.' }

  const supabase = await admin()
  if (!supabase) return { erro: ERRO_SESSAO }

  const { error: erroSettings } = await supabase
    .from('store_settings')
    // A coluna guarda a fração (0,05 = 5%); a tela pergunta em porcentagem.
    .update({ desconto_pix: Math.round(porcento * 100) / 10_000, parcelas_max: parcelas })
    .eq('id', true)
  if (erroSettings) return { erro: ERRO_SALVAR }

  const porcentoTexto = porcento.toLocaleString('pt-BR', { maximumFractionDigits: 2 })

  for (const l of entrada.data.linhas) {
    // O destaque é o que a cliente lê no checkout: ele acompanha os números acima.
    const destaque =
      l.chave === 'pix'
        ? `${porcentoTexto}% de desconto`
        : l.chave === 'cartao'
          ? `até ${parcelas}x sem juros`
          : undefined

    const { error } = await supabase
      .from('payment_options')
      .update(destaque ? { ativo: l.ativo, destaque } : { ativo: l.ativo })
      .eq('chave', l.chave)
    if (error) {
      revalidar()
      return { erro: ERRO_SALVAR }
    }
  }

  revalidar()

  const ligadas = entrada.data.linhas.filter((l) => l.ativo).length
  if (ligadas === 0)
    return { ok: 'Pagamentos salvos. Nenhuma forma está ligada — o checkout fica sem como cobrar.' }
  return {
    ok: `Pagamentos salvos. PIX com ${porcentoTexto}% de desconto e cartão em até ${parcelas}x.`,
  }
}

/* ------------------------------------------------------------------ *
 * Dados da loja
 * ------------------------------------------------------------------ */

const soDigitos = (v: string) => v.replace(/\D+/g, '')

const EsquemaLoja = z.object({
  nomeLoja: z
    .string()
    .trim()
    .min(2, 'A loja precisa de um nome.')
    .max(60, 'O nome da loja passa de 60 caracteres.'),
  localizacao: z
    .string()
    .trim()
    .min(2, 'A localização precisa dizer ao menos o bairro e a cidade.')
    .max(80, 'A localização passa de 80 caracteres.'),
  whatsapp: z.string().trim().min(1, 'O WhatsApp da loja não pode ficar vazio.'),
  instagram: z
    .string()
    .trim()
    .min(1, 'O Instagram da loja não pode ficar vazio.')
    .max(31, 'O nome de usuário do Instagram passa de 30 caracteres.'),
  cnpj: z.string().trim().min(1, 'O CNPJ da loja não pode ficar vazio.'),
  email: z.email('Esse e-mail não parece válido. Confira o endereço.'),
})

export async function salvarDadosLoja(_estado: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const entrada = EsquemaLoja.safeParse({
    nomeLoja: texto(formData.get('nome_loja')),
    localizacao: texto(formData.get('localizacao')),
    whatsapp: texto(formData.get('whatsapp')),
    instagram: texto(formData.get('instagram')),
    cnpj: texto(formData.get('cnpj')),
    email: texto(formData.get('email')).trim(),
  })
  if (!entrada.success) return { erro: entrada.error.issues[0]?.message ?? ERRO_ENTRADA }

  const d = entrada.data

  const telefone = soDigitos(d.whatsapp)
  if (telefone.length !== 10 && telefone.length !== 11)
    return { erro: 'O WhatsApp precisa ter DDD e número, como (88) 99999-0000.' }

  const usuario = d.instagram.replace(/^@/, '')
  if (!/^[A-Za-z0-9._]{1,30}$/.test(usuario))
    return { erro: 'O Instagram é só o nome de usuário, como @ozzimodafeminina.' }

  const cnpj = soDigitos(d.cnpj)
  if (cnpj.length !== 14) return { erro: 'O CNPJ precisa ter 14 números.' }

  const supabase = await admin()
  if (!supabase) return { erro: ERRO_SESSAO }

  const { error } = await supabase
    .from('store_settings')
    .update({
      nome_loja: d.nomeLoja,
      localizacao: d.localizacao,
      whatsapp: d.whatsapp,
      instagram: `@${usuario}`,
      cnpj: cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5'),
      email: d.email,
    })
    .eq('id', true)
  if (error) return { erro: ERRO_SALVAR }

  revalidar()
  return { ok: 'Dados da loja salvos. O rodapé e o WhatsApp da loja já mostram o texto novo.' }
}

/* ------------------------------------------------------------------ *
 * Cupons
 * ------------------------------------------------------------------ */

const CODIGO = /^[A-Z0-9]{3,24}$/
const ERRO_CODIGO =
  'O código do cupom usa só letras e números, de 3 a 24 caracteres — como CARIRI15.'

const EsquemaCupom = z.object({
  codigo: z.string().regex(CODIGO, ERRO_CODIGO),
  tipo: z.enum(['percentual', 'valor'], 'Escolha se o desconto é em % ou em reais.'),
  valor: z.string(),
  regra: z.enum(CHAVES_REGRA, 'Escolha quando o cupom vale.'),
  validade: z
    .string()
    .trim()
    .refine((v) => v === '' || /^\d{4}-\d{2}-\d{2}$/.test(v), 'Data inválida. Use o seletor de data do campo.'),
})

export async function criarCupom(_estado: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const entrada = EsquemaCupom.safeParse({
    codigo: texto(formData.get('codigo')).trim().toUpperCase(),
    tipo: texto(formData.get('tipo')),
    valor: texto(formData.get('valor')),
    regra: texto(formData.get('regra')),
    validade: texto(formData.get('validade')),
  })
  if (!entrada.success) return { erro: entrada.error.issues[0]?.message ?? ERRO_ENTRADA }

  const d = entrada.data
  const ERRO_PORCENTO = 'O desconto em porcentagem precisa estar entre 1 e 90, como 10 ou 12,5.'
  const ERRO_REAIS = 'O desconto em reais precisa estar entre R$ 0,01 e R$ 9.999,00.'

  const valor = paraNumero(d.valor)
  if (valor === null) return { erro: d.tipo === 'percentual' ? ERRO_PORCENTO : ERRO_REAIS }
  if (d.tipo === 'percentual' && (valor < 1 || valor > 90)) return { erro: ERRO_PORCENTO }
  if (d.tipo === 'valor' && (valor < 0.01 || valor > 9_999)) return { erro: ERRO_REAIS }

  const supabase = await admin()
  if (!supabase) return { erro: ERRO_SESSAO }

  const { data: existente } = await supabase
    .from('coupons')
    .select('codigo')
    .eq('codigo', d.codigo)
    .maybeSingle()
  if (existente) return { erro: `Já existe um cupom com o código ${d.codigo}. Escolha outro código.` }

  const linha = {
    codigo: d.codigo,
    tipo: d.tipo,
    valor: emCentavos(valor),
    regra: d.regra,
    descricao: descricaoDoCupom({ tipo: d.tipo, valor, regra: d.regra }),
    validade: d.validade || null,
    usos: 0,
    ativo: true,
  }

  const { error } = await supabase.from('coupons').insert(linha)
  if (error) {
    // Corrida entre duas abas: o código pode ter nascido entre a conferência e o insert.
    if (error.code === '23505')
      return { erro: `Já existe um cupom com o código ${d.codigo}. Escolha outro código.` }
    return { erro: ERRO_SALVAR }
  }

  revalidar()
  return { ok: `Cupom ${d.codigo} criado e ligado.` }
}

export async function alternarCupom(codigo: string, ativo: boolean): Promise<EstadoAcao> {
  const entrada = z.object({ codigo: z.string().regex(CODIGO, ERRO_CODIGO), ativo: z.boolean() }).safeParse({
    codigo,
    ativo,
  })
  if (!entrada.success) return { erro: ERRO_ENTRADA }

  const supabase = await admin()
  if (!supabase) return { erro: ERRO_SESSAO }

  const { error } = await supabase
    .from('coupons')
    .update({ ativo: entrada.data.ativo })
    .eq('codigo', entrada.data.codigo)
  if (error) return { erro: ERRO_SALVAR }

  revalidar()
  return {
    ok: entrada.data.ativo
      ? `Cupom ${entrada.data.codigo} ligado.`
      : `Cupom ${entrada.data.codigo} desligado. Quem digitar o código não ganha o desconto.`,
  }
}

export async function removerCupom(codigo: string): Promise<EstadoAcao> {
  const entrada = z.object({ codigo: z.string().regex(CODIGO, ERRO_CODIGO) }).safeParse({ codigo })
  if (!entrada.success) return { erro: ERRO_ENTRADA }

  const supabase = await admin()
  if (!supabase) return { erro: ERRO_SESSAO }

  const { error } = await supabase.from('coupons').delete().eq('codigo', entrada.data.codigo)
  if (error) return { erro: ERRO_SALVAR }

  revalidar()
  return { ok: `Cupom ${entrada.data.codigo} removido.` }
}
