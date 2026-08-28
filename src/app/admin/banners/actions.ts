'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { SUPABASE_URL } from '@/lib/supabase/config'

/** Estado devolvido às telas: erro ou confirmação, sempre em pt-BR. */
export interface EstadoAcao {
  erro?: string
  ok?: string
}

const ERRO_ENTRADA = 'Não entendi o que salvar nesta tela. Recarregue a página e tente de novo.'
const ERRO_SESSAO = 'Sua sessão não tem permissão para editar a vitrine. Entre de novo no painel.'
const ERRO_SALVAR = 'Não foi possível salvar agora. Tente de novo em instantes.'

const texto = (dado: FormDataEntryValue | null) => (typeof dado === 'string' ? dado : '')

/** Cliente de sessão, já com o papel conferido — o RLS silencioso não avisaria. */
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

/** A vitrine inteira depende deste conteúdo: faixa de avisos, home e categorias. */
function revalidar() {
  revalidatePath('/admin/banners')
  revalidatePath('/admin')
  revalidatePath('/', 'layout')
}

/* ------------------------------------------------------------------ *
 * Imagens
 * ------------------------------------------------------------------ */

const HOST_IMAGENS = (() => {
  try {
    return new URL(SUPABASE_URL).hostname
  } catch {
    return ''
  }
})()

/**
 * O `next/image` só libera o bucket público do Supabase (next.config.ts).
 * Aceitar qualquer domínio aqui quebraria a renderização da loja.
 */
export const AJUDA_IMAGEM =
  'Cole o endereço público do Supabase Storage (https://…/storage/v1/object/public/…) ou um caminho que comece com “/”. Deixe vazio para tirar a foto do ar.'

const ERRO_IMAGEM =
  'Este endereço de imagem não é aceito. Use o link público do Supabase Storage ou um caminho que comece com “/”.'

function lerImagem(valor: string): { ok: true; imagem: string | null } | { ok: false } {
  const v = valor.trim()
  if (!v) return { ok: true, imagem: null }
  if (v.length > 500) return { ok: false }
  if (v.startsWith('/') && !v.startsWith('//')) return { ok: true, imagem: v }
  try {
    const url = new URL(v)
    const liberado =
      url.protocol === 'https:' &&
      url.hostname === HOST_IMAGENS &&
      url.pathname.startsWith('/storage/v1/object/public/')
    if (liberado) return { ok: true, imagem: v }
  } catch {
    // Endereço inválido cai no erro legível abaixo.
  }
  return { ok: false }
}

/* ------------------------------------------------------------------ *
 * Avisos da barra superior
 * ------------------------------------------------------------------ */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const EsquemaAviso = z.object({
  id: z.string().regex(UUID).nullable(),
  texto: z
    .string()
    .trim()
    .min(2, 'Todo aviso precisa de um texto — apague a linha vazia ou escreva algo nela.')
    .max(120, 'Aviso muito longo: a faixa comporta até 120 caracteres.'),
  periodo: z.enum(['sempre', 'ate_31_08', 'agendar']),
  ativo: z.boolean(),
})

const EsquemaAvisos = z.array(EsquemaAviso).max(12, 'A faixa comporta até 12 avisos.')

/**
 * Salva a faixa inteira de uma vez: a ordem da lista vira a coluna `ordem`,
 * e o que sumiu da tela é apagado do banco.
 */
export async function salvarAvisos(_estado: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  let bruto: unknown
  try {
    bruto = JSON.parse(texto(formData.get('avisos')))
  } catch {
    return { erro: ERRO_ENTRADA }
  }

  const entrada = EsquemaAvisos.safeParse(bruto)
  if (!entrada.success) return { erro: entrada.error.issues[0]?.message ?? ERRO_ENTRADA }

  const faixaAtiva = texto(formData.get('faixaAtiva')) === '1'
  const lista = entrada.data

  const supabase = await admin()
  if (!supabase) return { erro: ERRO_SESSAO }

  const { error: erroFaixa } = await supabase
    .from('store_settings')
    .update({ promo_bar_ativa: faixaAtiva })
    .eq('id', true)
  if (erroFaixa) return { erro: ERRO_SALVAR }

  const { data: existentes } = await supabase.from('notices').select('id')
  const mantidos = new Set(lista.map((a) => a.id).filter((id): id is string => !!id))
  const apagar = (existentes ?? []).map((n) => n.id).filter((id) => !mantidos.has(id))

  if (apagar.length > 0) {
    const { error } = await supabase.from('notices').delete().in('id', apagar)
    if (error) {
      revalidar()
      return { erro: ERRO_SALVAR }
    }
  }

  for (const [i, aviso] of lista.entries()) {
    const linha = { texto: aviso.texto, periodo: aviso.periodo, ativo: aviso.ativo, ordem: i + 1 }
    const { error } = aviso.id
      ? await supabase.from('notices').update(linha).eq('id', aviso.id)
      : await supabase.from('notices').insert(linha)
    if (error) {
      revalidar()
      return { erro: `Parei no aviso “${aviso.texto}”. Confira a lista: o que veio antes já foi salvo.` }
    }
  }

  revalidar()

  const ligados = lista.filter((a) => a.ativo).length
  if (!faixaAtiva) return { ok: 'Avisos salvos. A faixa está desligada, então nada aparece na loja.' }
  if (ligados === 0) return { ok: 'Avisos salvos. Nenhum está ligado, então a faixa não aparece na loja.' }
  return { ok: `Avisos salvos. ${ligados} ${ligados === 1 ? 'aviso está' : 'avisos estão'} no ar.` }
}

/* ------------------------------------------------------------------ *
 * Banner principal da home
 * ------------------------------------------------------------------ */

const DATA = /^\d{4}-\d{2}-\d{2}$/

const opcional = (max: number, mensagem: string) => z.string().trim().max(max, mensagem)
const dataOpcional = z
  .string()
  .trim()
  .refine((v) => v === '' || DATA.test(v), 'Data inválida. Use o seletor de data do campo.')

const EsquemaHero = z.object({
  id: z.string().regex(UUID).or(z.literal('')),
  chapeu: opcional(80, 'O chapéu do banner passa de 80 caracteres.'),
  titulo: z
    .string()
    .trim()
    .min(2, 'O banner precisa de um título.')
    .max(160, 'O título do banner passa de 160 caracteres.'),
  textoApoio: opcional(400, 'O texto de apoio passa de 400 caracteres.'),
  textoBotao: opcional(40, 'O texto do botão passa de 40 caracteres.'),
  linkBotao: opcional(200, 'O link do botão passa de 200 caracteres.'),
  inicio: dataOpcional,
  fim: dataOpcional,
})

function lerLink(valor: string): boolean {
  if (!valor) return true
  if (valor.startsWith('/') && !valor.startsWith('//')) return true
  return /^https:\/\/\S+$/.test(valor)
}

/** Publica o banner 'home_hero'. Sem registro no banco, cria um. */
export async function publicarBannerHome(_estado: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const entrada = EsquemaHero.safeParse({
    id: texto(formData.get('id')),
    chapeu: texto(formData.get('chapeu')),
    titulo: texto(formData.get('titulo')),
    textoApoio: texto(formData.get('texto')),
    textoBotao: texto(formData.get('texto_botao')),
    linkBotao: texto(formData.get('link_botao')),
    inicio: texto(formData.get('inicio')),
    fim: texto(formData.get('fim')),
  })
  if (!entrada.success) return { erro: entrada.error.issues[0]?.message ?? ERRO_ENTRADA }

  const d = entrada.data
  if (!lerLink(d.linkBotao))
    return { erro: 'O link do botão precisa começar com “/” (uma página da loja) ou com “https://”.' }
  if (d.inicio && d.fim && d.fim < d.inicio)
    return { erro: 'A data de fim está antes da data de início.' }

  const imagem = lerImagem(texto(formData.get('imagem')))
  if (!imagem.ok) return { erro: ERRO_IMAGEM }

  const supabase = await admin()
  if (!supabase) return { erro: ERRO_SESSAO }

  const linha = {
    imagem: imagem.imagem,
    chapeu: d.chapeu || null,
    titulo: d.titulo,
    texto: d.textoApoio || null,
    texto_botao: d.textoBotao || null,
    link_botao: d.linkBotao || null,
    inicio: d.inicio || null,
    fim: d.fim || null,
    ativo: true,
  }

  const { error } = d.id
    ? await supabase.from('banners').update(linha).eq('id', d.id)
    : await supabase.from('banners').insert({ ...linha, tipo: 'home_hero', ordem: 1 })
  if (error) return { erro: ERRO_SALVAR }

  revalidar()
  return { ok: 'Banner publicado. A home já está com ele.' }
}

/* ------------------------------------------------------------------ *
 * Faixa da coleção
 * ------------------------------------------------------------------ */

const EsquemaFaixa = z.object({
  id: z.string().regex(UUID).or(z.literal('')),
  titulo: z
    .string()
    .trim()
    .min(2, 'A faixa precisa de um título.')
    .max(90, 'O título da faixa passa de 90 caracteres.'),
  textoFaixa: opcional(400, 'O texto da faixa passa de 400 caracteres.'),
})

/** Salva o banner 'faixa_colecao' — o bloco "Prove em casa antes de pagar" da home. */
export async function salvarFaixaColecao(_estado: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const entrada = EsquemaFaixa.safeParse({
    id: texto(formData.get('id')),
    titulo: texto(formData.get('titulo')),
    textoFaixa: texto(formData.get('texto')),
  })
  if (!entrada.success) return { erro: entrada.error.issues[0]?.message ?? ERRO_ENTRADA }

  const d = entrada.data
  const supabase = await admin()
  if (!supabase) return { erro: ERRO_SESSAO }

  const linha = { titulo: d.titulo, texto: d.textoFaixa || null }
  const { error } = d.id
    ? await supabase.from('banners').update(linha).eq('id', d.id)
    : await supabase.from('banners').insert({ ...linha, tipo: 'faixa_colecao', ordem: 1, ativo: true })
  if (error) return { erro: ERRO_SALVAR }

  revalidar()
  return { ok: 'Faixa salva. A home já mostra o texto novo.' }
}

/* ------------------------------------------------------------------ *
 * Banners de categoria
 * ------------------------------------------------------------------ */

const EsquemaImagemCategoria = z.object({ categoria: z.string().regex(UUID) })

export async function salvarImagemCategoria(_estado: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const entrada = EsquemaImagemCategoria.safeParse({ categoria: texto(formData.get('categoria')) })
  if (!entrada.success) return { erro: ERRO_ENTRADA }

  const imagem = lerImagem(texto(formData.get('imagem')))
  if (!imagem.ok) return { erro: ERRO_IMAGEM }

  const supabase = await admin()
  if (!supabase) return { erro: ERRO_SESSAO }

  const { data: categoria } = await supabase
    .from('categories')
    .select('nome')
    .eq('id', entrada.data.categoria)
    .maybeSingle()
  if (!categoria) return { erro: 'Categoria não encontrada. Recarregue a página.' }

  const { error } = await supabase
    .from('categories')
    .update({ imagem_banner: imagem.imagem })
    .eq('id', entrada.data.categoria)
  if (error) return { erro: ERRO_SALVAR }

  revalidar()
  return {
    ok: imagem.imagem
      ? `Imagem de ${categoria.nome} trocada.`
      : `A foto de ${categoria.nome} saiu do ar. A vitrine mostra o placeholder listrado.`,
  }
}

const EsquemaCategoria = z.object({
  nome: z
    .string()
    .trim()
    .min(2, 'A categoria precisa de um nome.')
    .max(40, 'O nome da categoria passa de 40 caracteres.'),
  slug: z
    .string()
    .trim()
    .min(2, 'O endereço da categoria precisa de pelo menos 2 caracteres.')
    .max(40, 'O endereço da categoria passa de 40 caracteres.')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use só letras minúsculas, números e hífen no endereço.'),
})

/** Cria a categoria já ativa; a foto do banner entra depois, em "Trocar imagem". */
export async function criarCategoria(_estado: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  const entrada = EsquemaCategoria.safeParse({
    nome: texto(formData.get('nome')),
    slug: texto(formData.get('slug')),
  })
  if (!entrada.success) return { erro: entrada.error.issues[0]?.message ?? ERRO_ENTRADA }

  const noMenu = texto(formData.get('no_menu')) === 'on'
  const supabase = await admin()
  if (!supabase) return { erro: ERRO_SESSAO }

  const { data: existente } = await supabase
    .from('categories')
    .select('nome')
    .eq('slug', entrada.data.slug)
    .maybeSingle()
  if (existente) return { erro: `O endereço “${entrada.data.slug}” já é da categoria ${existente.nome}.` }

  const { data: ultima } = await supabase
    .from('categories')
    .select('ordem')
    .order('ordem', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase.from('categories').insert({
    nome: entrada.data.nome,
    slug: entrada.data.slug,
    ordem: (ultima?.ordem ?? 0) + 1,
    ativo: true,
    no_menu: noMenu,
  })
  if (error) return { erro: ERRO_SALVAR }

  revalidar()
  return { ok: `Categoria ${entrada.data.nome} criada. Falta a foto do banner.` }
}
