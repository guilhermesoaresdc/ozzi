import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type {
  BannerRow,
  CategoryRow,
  NoticeRow,
  PaymentOptionRow,
  ProductRow,
  ShippingMethodRow,
  StoreSettingsRow,
  VariantRow,
} from '@/lib/database.types'

/* ------------------------------------------------------------------ *
 * Modelos de apresentação
 * ------------------------------------------------------------------ */

export interface ProdutoResumo {
  id: string
  slug: string
  nome: string
  ref: string
  preco: number
  precoComparativo: number | null
  selo: string | null
  cores: { nome: string; hex: string }[]
  foto: string | null
  fotos: string[]
  videos: string[]
  temVideo: boolean
  estoque: number
  prontaEntrega: boolean
  categoriaSlug: string | null
  categoriaNome: string | null
}

export interface ProdutoDetalhe extends ProdutoResumo {
  tecido: string | null
  descricao: string | null
  medidas: string | null
  peso: number | null
  fornecedor: string | null
  aceitaEncomenda: boolean
  prazoEncomendaDias: number
  medidasTabela: MedidaPorTamanho[]
  variantes: VariantRow[]
  categoriaId: string | null
  criadoEm: string
}

/** Uma linha da tabela de medidas, em centímetros. */
export interface MedidaPorTamanho {
  tamanho: string
  busto?: string
  cintura?: string
  quadril?: string
  comprimento?: string
}

export interface CategoriaComContagem extends CategoryRow {
  contagem: number
}

const CAMPOS_PRODUTO =
  'id, slug, nome, ref, preco, preco_comparativo, selo, fotos, videos, medidas_tabela, status, destaque, criado_em, category_id, tecido, descricao, medidas, peso, fornecedor, aceita_encomenda, prazo_encomenda_dias'

type LinhaProduto = Pick<
  ProductRow,
  | 'id' | 'slug' | 'nome' | 'ref' | 'preco' | 'preco_comparativo' | 'selo' | 'fotos'
  | 'status' | 'destaque' | 'criado_em' | 'category_id' | 'tecido' | 'descricao'
  | 'medidas' | 'peso' | 'fornecedor' | 'aceita_encomenda' | 'prazo_encomenda_dias'
  | 'videos' | 'medidas_tabela'
> & {
  categories?: { slug: string; nome: string } | null
  variants?: VariantRow[] | null
}

function fotosDe(fotos: unknown): string[] {
  return Array.isArray(fotos) ? (fotos.filter((f) => typeof f === 'string') as string[]) : []
}

function medidasDe(bruto: unknown): MedidaPorTamanho[] {
  if (!Array.isArray(bruto)) return []
  return bruto
    .filter((l): l is Record<string, unknown> => typeof l === 'object' && l !== null && typeof l.tamanho === 'string')
    .map((l) => ({
      tamanho: String(l.tamanho),
      busto: l.busto ? String(l.busto) : undefined,
      cintura: l.cintura ? String(l.cintura) : undefined,
      quadril: l.quadril ? String(l.quadril) : undefined,
      comprimento: l.comprimento ? String(l.comprimento) : undefined,
    }))
}

function coresDe(variantes: VariantRow[] | null | undefined) {
  const vistas = new Map<string, string>()
  for (const v of [...(variantes ?? [])].sort((a, b) => a.ordem - b.ordem)) {
    if (!vistas.has(v.cor_nome)) vistas.set(v.cor_nome, v.cor_hex)
  }
  return [...vistas].map(([nome, hex]) => ({ nome, hex }))
}

/**
 * O que pode aparecer na vitrine: peça com estoque E com pelo menos uma foto
 * ou vídeo. Sem mídia, o cartão vira uma tarja listrada que não vende nada e
 * faz a loja parecer um catálogo de mentira.
 */
export function ehVendavel(p: ProdutoResumo): boolean {
  // Preço zero é peça sem preço definido, não peça de graça. Ela não pode
  // chegar à vitrine: alguém fecharia o pedido sem pagar nada.
  return p.preco > 0 && p.prontaEntrega && (p.foto !== null || p.temVideo)
}

export function apenasVendaveis(lista: ProdutoResumo[]): ProdutoResumo[] {
  return lista.filter(ehVendavel)
}

export function paraResumo(p: LinhaProduto): ProdutoResumo {
  const fotos = fotosDe(p.fotos)
  const videos = fotosDe(p.videos)
  const estoque = (p.variants ?? []).reduce((s, v) => s + v.estoque, 0)
  return {
    id: p.id,
    slug: p.slug,
    nome: p.nome,
    ref: p.ref,
    preco: Number(p.preco),
    precoComparativo: p.preco_comparativo === null ? null : Number(p.preco_comparativo),
    selo: p.selo,
    cores: coresDe(p.variants),
    foto: fotos[0] ?? null,
    fotos,
    videos,
    temVideo: videos.length > 0,
    estoque,
    prontaEntrega: estoque > 0,
    categoriaSlug: p.categories?.slug ?? null,
    categoriaNome: p.categories?.nome ?? null,
  }
}

function paraDetalhe(p: LinhaProduto): ProdutoDetalhe {
  return {
    ...paraResumo(p),
    tecido: p.tecido,
    descricao: p.descricao,
    medidas: p.medidas,
    peso: p.peso === null ? null : Number(p.peso),
    fornecedor: p.fornecedor,
    aceitaEncomenda: p.aceita_encomenda,
    prazoEncomendaDias: p.prazo_encomenda_dias,
    medidasTabela: medidasDe(p.medidas_tabela),
    variantes: [...(p.variants ?? [])].sort(
      (a, b) => a.ordem - b.ordem || a.cor_nome.localeCompare(b.cor_nome),
    ),
    categoriaId: p.category_id,
    criadoEm: p.criado_em,
  }
}

/* ------------------------------------------------------------------ *
 * Configuração e conteúdo
 * ------------------------------------------------------------------ */

export const getSettings = cache(async (): Promise<StoreSettingsRow> => {
  const supabase = await createClient()
  const { data } = await supabase.from('store_settings').select('*').eq('id', true).maybeSingle()
  return (
    data ?? {
      id: true,
      nome_loja: 'Ozzi Moda Feminina',
      localizacao: 'Centro, Várzea Alegre - CE',
      whatsapp: '(88) 99999-0000',
      instagram: '@ozzimodafeminina',
      cnpj: '00.000.000/0001-00',
      email: 'contato@ozzi.com.br',
      promo_bar_ativa: true,
      frete_gratis_acima: 249,
      desconto_avista: 0.05,
      parcelas_max: 6,
    }
  )
})

export const getNotices = cache(async (): Promise<NoticeRow[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('notices')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true })
  return data ?? []
})

export const getMenuCategories = cache(async (): Promise<CategoryRow[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('ativo', true)
    .eq('no_menu', true)
    .order('ordem', { ascending: true })
  return data ?? []
})

export const getCategories = cache(async (): Promise<CategoryRow[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true })
  return data ?? []
})

/** Categorias com a contagem real de peças ativas — a grade da home. */
export const getCategoriesWithCounts = cache(async (): Promise<CategoriaComContagem[]> => {
  const supabase = await createClient()
  const [{ data: cats }, { data: prods }] = await Promise.all([
    supabase.from('categories').select('*').eq('ativo', true).order('ordem', { ascending: true }),
    supabase
      .from('products')
      .select(`${CAMPOS_PRODUTO}, categories(slug, nome), variants(*)`)
      .eq('status', 'ativo'),
  ])

  // A contagem tem que usar o MESMO critério da vitrine: prometer 9 vestidos
  // e entregar uma grade vazia é pior do que mostrar 1.
  const contagem = new Map<string, number>()
  for (const linha of (prods ?? []) as unknown as LinhaProduto[]) {
    if (!linha.category_id) continue
    if (!ehVendavel(paraResumo(linha))) continue
    contagem.set(linha.category_id, (contagem.get(linha.category_id) ?? 0) + 1)
  }
  return (cats ?? []).map((c) => ({ ...c, contagem: contagem.get(c.id) ?? 0 }))
})

export const getBanner = cache(async (tipo: BannerRow['tipo'], slug?: string): Promise<BannerRow | null> => {
  const supabase = await createClient()
  let q = supabase.from('banners').select('*').eq('tipo', tipo).eq('ativo', true)
  if (slug) q = q.eq('slug', slug)
  const { data } = await q.order('ordem', { ascending: true }).limit(1).maybeSingle()
  return data ?? null
})

export const getShippingMethods = cache(async (): Promise<ShippingMethodRow[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('shipping_methods')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true })
  return data ?? []
})

export const getPaymentOptions = cache(async (): Promise<PaymentOptionRow[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('payment_options')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true })
  return data ?? []
})

/* ------------------------------------------------------------------ *
 * Catálogo
 * ------------------------------------------------------------------ */

export const getDestaques = cache(async (limite = 4): Promise<ProdutoResumo[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select(`${CAMPOS_PRODUTO}, categories(slug, nome), variants(*)`)
    .eq('status', 'ativo')
    .eq('destaque', true)
    .order('criado_em', { ascending: false })
    .limit(limite)
  return apenasVendaveis(((data ?? []) as unknown as LinhaProduto[]).map(paraResumo))
})

export type Ordenacao = 'relevancia' | 'menor-preco' | 'maior-preco' | 'novidades'

export const getProdutosDaCategoria = cache(
  async (slug: string, ordenacao: Ordenacao = 'relevancia'): Promise<ProdutoResumo[]> => {
    const supabase = await createClient()
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', slug).maybeSingle()
    if (!cat) return []

    let q = supabase
      .from('products')
      .select(`${CAMPOS_PRODUTO}, categories(slug, nome), variants(*)`)
      .eq('status', 'ativo')
      .eq('category_id', cat.id)

    if (ordenacao === 'menor-preco') q = q.order('preco', { ascending: true })
    else if (ordenacao === 'maior-preco') q = q.order('preco', { ascending: false })
    else if (ordenacao === 'novidades') q = q.order('criado_em', { ascending: false })
    else q = q.order('destaque', { ascending: false }).order('criado_em', { ascending: false })

    const { data } = await q
    return apenasVendaveis(((data ?? []) as unknown as LinhaProduto[]).map(paraResumo))
  },
)

export const getCategoria = cache(async (slug: string): Promise<CategoryRow | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('ativo', true)
    .maybeSingle()
  // Falha de consulta não é "categoria não existe": deixar passar viraria um 404,
  // que para o Google é sinal permanente e desindexa a página. Melhor estourar 500.
  if (error) throw new Error(`Falha ao buscar a categoria ${slug}: ${error.message}`)
  return data ?? null
})

export const getProduto = cache(async (slug: string): Promise<ProdutoDetalhe | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(`${CAMPOS_PRODUTO}, categories(slug, nome), variants(*)`)
    .eq('slug', slug)
    .neq('status', 'rascunho')
    .maybeSingle()
  // Mesma razão da categoria: banco fora do ar não pode virar 404.
  if (error) throw new Error(`Falha ao buscar o produto ${slug}: ${error.message}`)
  return data ? paraDetalhe(data as unknown as LinhaProduto) : null
})

export const getCombinaCom = cache(
  async (categoriaId: string | null, excluirId: string, limite = 4): Promise<ProdutoResumo[]> => {
    const supabase = await createClient()
    let q = supabase
      .from('products')
      .select(`${CAMPOS_PRODUTO}, categories(slug, nome), variants(*)`)
      .eq('status', 'ativo')
      .neq('id', excluirId)
    if (categoriaId) q = q.neq('category_id', categoriaId)
    const { data } = await q.order('destaque', { ascending: false }).limit(limite)
    return apenasVendaveis(((data ?? []) as unknown as LinhaProduto[]).map(paraResumo))
  },
)

export async function buscarProdutos(termo: string, limite = 24): Promise<ProdutoResumo[]> {
  const q = termo.trim()
  if (!q) return []
  const supabase = await createClient()
  const padrao = `%${q}%`
  const { data } = await supabase
    .from('products')
    .select(`${CAMPOS_PRODUTO}, categories(slug, nome), variants(*)`)
    .eq('status', 'ativo')
    .or(`nome.ilike.${padrao},descricao.ilike.${padrao},tecido.ilike.${padrao},ref.ilike.${padrao}`)
    .limit(limite)
  return apenasVendaveis(((data ?? []) as unknown as LinhaProduto[]).map(paraResumo))
}

/** Todos os produtos ativos — usado pela grade "Ver tudo". */
export const getTodosProdutos = cache(async (ordenacao: Ordenacao = 'relevancia'): Promise<ProdutoResumo[]> => {
  const supabase = await createClient()
  let q = supabase
    .from('products')
    .select(`${CAMPOS_PRODUTO}, categories(slug, nome), variants(*)`)
    .eq('status', 'ativo')

  if (ordenacao === 'menor-preco') q = q.order('preco', { ascending: true })
  else if (ordenacao === 'maior-preco') q = q.order('preco', { ascending: false })
  else if (ordenacao === 'novidades') q = q.order('criado_em', { ascending: false })
  else q = q.order('destaque', { ascending: false }).order('criado_em', { ascending: false })

  const { data } = await q
  return apenasVendaveis(((data ?? []) as unknown as LinhaProduto[]).map(paraResumo))
})

/* ------------------------------------------------------------------ *
 * Sessão
 * ------------------------------------------------------------------ */

export const getUsuario = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  return { user, profile }
})
