'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { numeroBr } from '@/components/admin/produtos-form/dados'
import type { ProductStatus, SizeCode } from '@/lib/database.types'

/** Estado devolvido ao formulário: sempre uma frase em pt-BR, nunca uma exceção. */
export interface EstadoProduto {
  erro?: string
}

const UUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
const STATUS: ProductStatus[] = ['ativo', 'oculto', 'rascunho']
const PRAZOS = [7, 10, 15]

const ERRO_ENTRADA = 'Não consegui ler os dados do formulário. Recarregue a página e tente de novo.'
const ERRO_SESSAO = 'Sua sessão não tem permissão para cadastrar produtos. Entre de novo no painel.'
const ERRO_SALVAR = 'Não foi possível salvar a peça agora. Tente de novo em instantes.'

const Linha = z.object({
  cor: z.string().min(1).max(40),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  quantidades: z
    .array(z.object({ tamanho: z.enum(['P', 'M', 'G', 'GG', 'U']), estoque: z.number().int().min(0).max(9999) }))
    .min(1),
})

const LinhaMedida = z.object({
  tamanho: z.string().min(1).max(12),
  busto: z.string().max(8).optional(),
  cintura: z.string().max(8).optional(),
  quadril: z.string().max(8).optional(),
  comprimento: z.string().max(8).optional(),
})

const Esquema = z.object({
  id: z.string().regex(UUID).nullable(),
  nome: z.string().min(2).max(120),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  ref: z.string().min(2).max(24).regex(/^[A-Za-z0-9._-]+$/),
  categoria: z.string().regex(UUID).nullable(),
  tecido: z.string().max(80),
  fornecedor: z.string().max(80),
  descricao: z.string().max(2000),
  medidas: z.string().max(600),
  preco: z.number().min(0).max(99999),
  precoComparativo: z.number().min(0).max(99999).nullable(),
  precoCusto: z.number().min(0).max(99999).nullable(),
  peso: z.number().min(0).max(99).nullable(),
  fotos: z.array(z.string().max(500).regex(/^(https:\/\/|\/)\S*$/i)).max(12),
  videos: z.array(z.string().max(500).regex(/^(https:\/\/|\/)\S*$/i)).max(4),
  medidasTabela: z.array(LinhaMedida).max(12),
  grade: z.array(Linha).max(24),
})

/** O zod fala inglês: cada campo tem aqui a frase que a cliente lê. */
const MENSAGENS: Record<string, string> = {
  nome: 'Dê um nome para a peça, com pelo menos 2 letras.',
  slug: 'O endereço na loja aceita só letras minúsculas, números e hífen — como vestido-serrote.',
  ref: 'A referência é obrigatória e aceita letras, números, ponto, hífen e sublinhado — como OZ-1042.',
  categoria: 'Escolha uma categoria da lista ou deixe em “Sem categoria”.',
  tecido: 'O nome do tecido passa de 80 letras.',
  fornecedor: 'O nome do fornecedor passa de 80 letras.',
  descricao: 'A descrição passa de 2000 letras.',
  medidas: 'As medidas passam de 600 letras.',
  preco: 'O preço precisa ser um valor entre 0 e 99.999.',
  precoComparativo: 'O preço promocional precisa ser um valor entre 0 e 99.999.',
  precoCusto: 'O preço de custo precisa ser um valor entre 0 e 99.999.',
  peso: 'O peso precisa ser um valor em quilos entre 0 e 99.',
  fotos: 'Cada foto precisa de um endereço começando com https:// — no máximo 12 por peça.',
  videos: 'Cada vídeo precisa de um endereço começando com https:// — no máximo 4 por peça.',
  medidasTabela: 'Confira a tabela de medidas: cada linha precisa da numeração, e as medidas em centímetros.',
  grade: 'Confira a grade de estoque: são no máximo 24 cores.',
  'grade.cor': 'Dê um nome para cada cor da grade de estoque (até 40 letras).',
  'grade.hex': 'A cor do mostruário precisa de um código como #D9CDBA.',
  'grade.quantidades': 'O estoque de cada numeração precisa ser um número inteiro de 0 a 9999.',
}

const texto = (dado: FormDataEntryValue | null) => (typeof dado === 'string' ? dado.trim() : '')

function json<T>(valor: string): T | null {
  try {
    return JSON.parse(valor) as T
  } catch {
    return null
  }
}

function mensagem(erro: z.ZodError): string {
  const issue = erro.issues[0]
  if (!issue) return ERRO_ENTRADA
  const raiz = String(issue.path[0] ?? '')
  if (raiz === 'grade') {
    const campo = issue.path.slice(1).find((p) => typeof p === 'string')
    return MENSAGENS[`grade.${String(campo)}`] ?? MENSAGENS.grade
  }
  return MENSAGENS[raiz] ?? ERRO_ENTRADA
}

async function sessaoAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: perfil } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (perfil?.role !== 'admin') return null

  return supabase
}

function erroDeBanco(aviso: string | undefined, slug: string, ref: string): string {
  const bruto = (aviso ?? '').toLowerCase()
  if (bruto.includes('slug')) return `Já existe outra peça no endereço /produto/${slug}. Mude o endereço na loja.`
  if (bruto.includes('ref')) return `A referência ${ref} já está em outra peça. Use outra.`
  if (bruto.includes('cor_nome') || bruto.includes('variants'))
    return 'Duas linhas da grade usam a mesma cor. Junte as numerações numa linha só.'
  return ERRO_SALVAR
}

/** Grava a peça e sincroniza a grade: insere, atualiza e apaga as linhas que sumiram. */
export async function salvarProduto(_estado: EstadoProduto, formData: FormData): Promise<EstadoProduto> {
  const status = texto(formData.get('status')) as ProductStatus
  const prazo = Number(texto(formData.get('prazo')) || '10')
  if (!STATUS.includes(status) || !PRAZOS.includes(prazo)) return { erro: ERRO_ENTRADA }

  const preco = numeroBr(texto(formData.get('preco')))
  if (preco === null) return { erro: 'Informe o preço da peça, como 289,90.' }

  const promocionalBruto = texto(formData.get('preco_comparativo'))
  const precoComparativo = promocionalBruto ? numeroBr(promocionalBruto) : null
  const custoBruto = texto(formData.get('preco_custo'))
  const precoCusto = custoBruto ? numeroBr(custoBruto) : null
  if (custoBruto && precoCusto === null)
    return { erro: 'Não entendi o preço de custo. Use o valor em reais, como 110,00, ou deixe em branco.' }

  if (promocionalBruto && precoComparativo === null)
    return { erro: 'Não entendi o preço promocional. Use um valor como 349,90 ou deixe o campo em branco.' }

  const pesoBruto = texto(formData.get('peso'))
  const peso = pesoBruto ? numeroBr(pesoBruto) : null
  if (pesoBruto && peso === null)
    return { erro: 'Não entendi o peso. Use o valor em quilos, como 0,42, ou deixe o campo em branco.' }

  const fotos = json<unknown[]>(texto(formData.get('fotos')) || '[]')
  const videos = json<unknown[]>(texto(formData.get('videos')) || '[]')
  const medidasTabela = json<unknown[]>(texto(formData.get('medidas_tabela')) || '[]')
  const grade = json<unknown[]>(texto(formData.get('grade')) || '[]')
  if (!Array.isArray(fotos) || !Array.isArray(videos) || !Array.isArray(medidasTabela) || !Array.isArray(grade))
    return { erro: ERRO_ENTRADA }

  const entrada = Esquema.safeParse({
    id: texto(formData.get('id')) || null,
    nome: texto(formData.get('nome')),
    slug: texto(formData.get('slug')).toLowerCase(),
    ref: texto(formData.get('ref')),
    categoria: texto(formData.get('categoria')) || null,
    tecido: texto(formData.get('tecido')),
    fornecedor: texto(formData.get('fornecedor')),
    descricao: texto(formData.get('descricao')),
    medidas: texto(formData.get('medidas')),
    preco,
    precoComparativo,
    precoCusto,
    peso,
    fotos,
    videos,
    medidasTabela,
    grade,
  })
  if (!entrada.success) return { erro: mensagem(entrada.error) }
  const dados = entrada.data

  const cores = dados.grade.map((l) => l.cor.toLowerCase())
  if (new Set(cores).size !== cores.length)
    return { erro: 'Duas linhas da grade usam a mesma cor. Junte as numerações numa linha só.' }

  const supabase = await sessaoAdmin()
  if (!supabase) return { erro: ERRO_SESSAO }

  const { data: parecidos } = await supabase
    .from('products')
    .select('id, slug, ref')
    .or(`slug.eq.${dados.slug},ref.eq.${dados.ref}`)

  const outros = (parecidos ?? []).filter((p) => p.id !== dados.id)
  if (outros.some((p) => p.slug === dados.slug))
    return { erro: `Já existe outra peça no endereço /produto/${dados.slug}. Mude o endereço na loja.` }
  if (outros.some((p) => p.ref === dados.ref))
    return { erro: `A referência ${dados.ref} já está em outra peça. Use outra.` }

  const valores = {
    nome: dados.nome,
    slug: dados.slug,
    ref: dados.ref,
    category_id: dados.categoria,
    tecido: dados.tecido || null,
    descricao: dados.descricao || null,
    medidas: dados.medidas || null,
    preco: dados.preco,
    preco_comparativo: dados.precoComparativo,
    preco_custo: dados.precoCusto,
    peso: dados.peso,
    fornecedor: dados.fornecedor || null,
    status,
    aceita_encomenda: formData.get('aceita_encomenda') !== null,
    prazo_encomenda_dias: prazo,
    fotos: dados.fotos,
    videos: dados.videos,
    medidas_tabela: dados.medidasTabela,
  }

  let produtoId: string
  let slugAntigo: string | null = null

  if (dados.id) {
    const { data: atual } = await supabase.from('products').select('slug').eq('id', dados.id).maybeSingle()
    if (!atual) return { erro: 'Esta peça não está mais no catálogo. Ela pode ter sido removida em outra aba.' }
    slugAntigo = atual.slug

    const { error } = await supabase.from('products').update(valores).eq('id', dados.id)
    if (error) return { erro: erroDeBanco(error.message, dados.slug, dados.ref) }
    produtoId = dados.id
  } else {
    const { data, error } = await supabase.from('products').insert(valores).select('id').single()
    if (error || !data) return { erro: erroDeBanco(error?.message, dados.slug, dados.ref) }
    produtoId = data.id
  }

  const desejadas = dados.grade.flatMap((linha, i) =>
    linha.quantidades.map((q) => ({
      product_id: produtoId,
      cor_nome: linha.cor,
      cor_hex: linha.hex,
      tamanho: q.tamanho as SizeCode,
      estoque: q.estoque,
      ordem: i + 1,
    })),
  )

  const chave = (v: { cor_nome: string; tamanho: string }) => `${v.cor_nome} / ${v.tamanho}`
  const manter = new Set(desejadas.map(chave))

  const { data: gravadas } = await supabase
    .from('variants')
    .select('id, cor_nome, tamanho')
    .eq('product_id', produtoId)

  const sumiram = (gravadas ?? []).filter((v) => !manter.has(chave(v))).map((v) => v.id)
  if (sumiram.length > 0) {
    const { error } = await supabase.from('variants').delete().in('id', sumiram)
    if (error) return { erro: 'A peça foi salva, mas as cores retiradas da grade continuam no estoque.' }
  }

  if (desejadas.length > 0) {
    const { error } = await supabase
      .from('variants')
      .upsert(desejadas, { onConflict: 'product_id,cor_nome,tamanho' })
    if (error) return { erro: 'A peça foi salva, mas a grade de estoque não foi atualizada. Confira as cores.' }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/produtos')
  revalidatePath(`/admin/produtos/${produtoId}/editar`)
  revalidatePath('/')
  revalidatePath('/novidades')
  revalidatePath(`/produto/${dados.slug}`)
  if (slugAntigo && slugAntigo !== dados.slug) revalidatePath(`/produto/${slugAntigo}`)

  if (dados.categoria) {
    const { data: categoria } = await supabase
      .from('categories')
      .select('slug')
      .eq('id', dados.categoria)
      .maybeSingle()
    if (categoria) revalidatePath(`/${categoria.slug}`)
  }

  redirect('/admin/produtos')
}
