import type { ProdutoResumo } from '@/lib/queries'

/** Uma peça da grade com tudo o que a barra de filtros precisa saber. */
export interface ProdutoNaGrade {
  produto: ProdutoResumo
  /** Numerações que a peça tem cadastradas. */
  tamanhos: string[]
  /** Numerações com peça no estoque agora. */
  tamanhosEmEstoque: string[]
  cores: string[]
  prontaEntrega: boolean
  aceitaEncomenda: boolean
}

export type ChaveFiltro = 'tamanho' | 'cor' | 'preco' | 'disponibilidade'
export type Selecao = Record<ChaveFiltro, string[]>

export interface OpcaoFiltro {
  valor: string
  rotulo: string
  contagem: number
}

export interface GrupoFiltro {
  chave: ChaveFiltro
  titulo: string
  opcoes: OpcaoFiltro[]
}

export const SELECAO_VAZIA: Selecao = { tamanho: [], cor: [], preco: [], disponibilidade: [] }

const ORDEM_TAMANHO = ['P', 'M', 'G', 'GG', 'U']

function posicao(tamanho: string): number {
  const i = ORDEM_TAMANHO.indexOf(tamanho)
  return i === -1 ? ORDEM_TAMANHO.length : i
}

export function ordenarTamanhos(tamanhos: Iterable<string>): string[] {
  return [...new Set(tamanhos)].sort(
    (a, b) => posicao(a) - posicao(b) || a.localeCompare(b, 'pt-BR'),
  )
}

export function rotuloTamanho(tamanho: string): string {
  return tamanho === 'U' ? 'Único' : tamanho
}

interface Faixa {
  valor: string
  rotulo: string
  min: number
  max: number
}

const FAIXAS: Faixa[] = [
  { valor: 'ate-150', rotulo: 'Até R$ 150', min: 0, max: 150 },
  { valor: '150-250', rotulo: 'R$ 150 a R$ 250', min: 150, max: 250 },
  { valor: '250-350', rotulo: 'R$ 250 a R$ 350', min: 250, max: 350 },
  { valor: 'acima-350', rotulo: 'Acima de R$ 350', min: 350, max: Number.POSITIVE_INFINITY },
]

function faixaDe(preco: number): string {
  return (FAIXAS.find((f) => preco >= f.min && preco < f.max) ?? FAIXAS[FAIXAS.length - 1]).valor
}

const DISPONIBILIDADE: { valor: string; rotulo: string }[] = [
  { valor: 'pronta', rotulo: 'Pronta entrega' },
  { valor: 'encomenda', rotulo: 'Sob encomenda' },
]

function atende(item: ProdutoNaGrade, chave: ChaveFiltro, valor: string): boolean {
  switch (chave) {
    case 'tamanho':
      return item.tamanhos.includes(valor)
    case 'cor':
      return item.cores.includes(valor)
    case 'preco':
      return faixaDe(item.produto.preco) === valor
    case 'disponibilidade':
      return valor === 'pronta'
        ? item.prontaEntrega
        : !item.prontaEntrega && item.aceitaEncomenda
  }
}

/** Dentro do grupo, OU; entre grupos, E. */
export function aplicarFiltros(itens: ProdutoNaGrade[], selecao: Selecao): ProdutoNaGrade[] {
  const grupos = Object.entries(selecao) as [ChaveFiltro, string[]][]
  return itens.filter((item) =>
    grupos.every(
      ([chave, valores]) => valores.length === 0 || valores.some((v) => atende(item, chave, v)),
    ),
  )
}

export function totalSelecionado(selecao: Selecao): number {
  return Object.values(selecao).reduce((soma, valores) => soma + valores.length, 0)
}

/**
 * As contagens da barra lateral saem dos produtos e variantes reais da
 * categoria: cada número é exatamente quantas peças a opção devolve.
 */
export function montarFiltros(itens: ProdutoNaGrade[]): GrupoFiltro[] {
  const contar = (chave: ChaveFiltro, valor: string) =>
    itens.filter((item) => atende(item, chave, valor)).length

  const grupos: GrupoFiltro[] = [
    {
      chave: 'tamanho',
      titulo: 'Tamanho',
      opcoes: ordenarTamanhos(itens.flatMap((i) => i.tamanhos)).map((t) => ({
        valor: t,
        rotulo: rotuloTamanho(t),
        contagem: contar('tamanho', t),
      })),
    },
    {
      chave: 'cor',
      titulo: 'Cor',
      opcoes: [...new Set(itens.flatMap((i) => i.cores))]
        .map((c) => ({ valor: c, rotulo: c, contagem: contar('cor', c) }))
        .sort((a, b) => b.contagem - a.contagem || a.rotulo.localeCompare(b.rotulo, 'pt-BR')),
    },
    {
      chave: 'preco',
      titulo: 'Preço',
      opcoes: FAIXAS.map((f) => ({
        valor: f.valor,
        rotulo: f.rotulo,
        contagem: contar('preco', f.valor),
      })),
    },
    {
      chave: 'disponibilidade',
      titulo: 'Disponibilidade',
      opcoes: DISPONIBILIDADE.map((d) => ({ ...d, contagem: contar('disponibilidade', d.valor) })),
    },
  ]

  // Opção sem peça não aparece; grupo com uma opção só não filtra nada.
  return grupos
    .map((g) => ({ ...g, opcoes: g.opcoes.filter((o) => o.contagem > 0) }))
    .filter((g) => g.opcoes.length > 1)
}

function peca(n: number): string {
  return `${n} ${n === 1 ? 'peça' : 'peças'}`
}

export function descreverNumeracao(tamanhos: string[]): string {
  const numerados = tamanhos.filter((t) => t !== 'U')
  if (numerados.length === 0) return tamanhos.includes('U') ? 'tamanho único' : ''
  if (numerados.length === 1) return `numeração ${numerados[0]}`
  return `numeração ${numerados[0]} ao ${numerados[numerados.length - 1]}`
}

/** "8 peças em pronta entrega · numeração P ao GG" — sempre do banco. */
export function subtituloDaCategoria(itens: ProdutoNaGrade[]): string {
  if (itens.length === 0) return 'Nenhuma peça publicada nesta categoria por enquanto'

  const pronta = itens.filter((i) => i.prontaEntrega)
  if (pronta.length === 0) {
    const encomenda = itens.filter((i) => i.aceitaEncomenda).length
    return encomenda > 0
      ? `${peca(encomenda)} sob encomenda · costuramos em até 10 dias úteis`
      : `${peca(itens.length)} nesta categoria`
  }

  const numeracao = descreverNumeracao(ordenarTamanhos(pronta.flatMap((i) => i.tamanhosEmEstoque)))
  const base = `${peca(pronta.length)} em pronta entrega`
  return numeracao ? `${base} · ${numeracao}` : base
}
