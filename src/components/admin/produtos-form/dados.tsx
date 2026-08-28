import type { ProductStatus, SizeCode, VariantRow } from '@/lib/database.types'
import { SUPABASE_URL } from '@/lib/supabase/config'

export type Numeracao = 'grade' | 'unico'

export const TAMANHOS: Record<Numeracao, SizeCode[]> = {
  grade: ['P', 'M', 'G', 'GG'],
  unico: ['U'],
}

export const COR_PADRAO = '#D9CDBA'
export const MAX_FOTOS = 12

export const PUBLICACOES: { chave: ProductStatus; rotulo: string; dica: string }[] = [
  { chave: 'ativo', rotulo: 'Ativo na vitrine', dica: 'Aparece na busca e nas categorias' },
  { chave: 'oculto', rotulo: 'Oculto', dica: 'Só acessível por link direto' },
  { chave: 'rascunho', rotulo: 'Rascunho', dica: 'Não publicado, sem estoque reservado' },
]

export const PRAZOS = [
  { valor: 10, rotulo: 'Até 10 dias úteis' },
  { valor: 7, rotulo: 'Até 7 dias úteis' },
  { valor: 15, rotulo: 'Até 15 dias úteis' },
]

export interface LinhaGrade {
  chave: string
  cor: string
  hex: string
  quantidades: Record<SizeCode, string>
}

export interface LinhaEnviada {
  cor: string
  hex: string
  quantidades: { tamanho: SizeCode; estoque: number }[]
}

const semQuantidades = (): Record<SizeCode, string> => ({ P: '', M: '', G: '', GG: '', U: '' })

let sequencia = 0

export function linhaVazia(): LinhaGrade {
  sequencia += 1
  return { chave: `linha-${sequencia}`, cor: '', hex: COR_PADRAO, quantidades: semQuantidades() }
}

export function inteiro(valor: string): number {
  const n = Number.parseInt(valor.replace(/[^\d]/g, ''), 10)
  return Number.isFinite(n) && n > 0 ? n : 0
}

export function totalDaLinha(linha: LinhaGrade, numeracao: Numeracao): number {
  return TAMANHOS[numeracao].reduce((soma, t) => soma + inteiro(linha.quantidades[t]), 0)
}

/** Monta a grade editável a partir das variantes gravadas, uma linha por cor. */
export function gradeInicial(variantes: VariantRow[]): { linhas: LinhaGrade[]; numeracao: Numeracao } {
  if (variantes.length === 0) return { linhas: [linhaVazia()], numeracao: 'grade' }

  const ordenadas = [...variantes].sort(
    (a, b) => a.ordem - b.ordem || a.cor_nome.localeCompare(b.cor_nome, 'pt-BR'),
  )
  const porCor = new Map<string, LinhaGrade>()
  for (const v of ordenadas) {
    const linha = porCor.get(v.cor_nome) ?? {
      chave: `cor-${porCor.size + 1}`,
      cor: v.cor_nome,
      hex: /^#[0-9a-fA-F]{6}$/.test(v.cor_hex) ? v.cor_hex : COR_PADRAO,
      quantidades: semQuantidades(),
    }
    linha.quantidades[v.tamanho] = String(v.estoque)
    porCor.set(v.cor_nome, linha)
  }

  return {
    linhas: [...porCor.values()],
    numeracao: variantes.every((v) => v.tamanho === 'U') ? 'unico' : 'grade',
  }
}

/** Só as linhas que a pessoa começou a preencher, no formato que a action espera. */
export function linhasParaEnvio(linhas: LinhaGrade[], numeracao: Numeracao): LinhaEnviada[] {
  const tamanhos = TAMANHOS[numeracao]
  return linhas
    .filter((l) => l.cor.trim() !== '' || tamanhos.some((t) => l.quantidades[t].trim() !== ''))
    .map((l) => ({
      cor: l.cor.trim(),
      hex: l.hex,
      quantidades: tamanhos.map((t) => ({ tamanho: t, estoque: inteiro(l.quantidades[t]) })),
    }))
}

export function paraSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** "R$ 1.289,90" e "1289.90" viram 1289.9; texto sem número vira null. */
export function numeroBr(valor: string): number | null {
  const limpo = valor.replace(/[^\d,.]/g, '').trim()
  if (!limpo) return null
  const normalizado = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo
  const n = Number(normalizado)
  return Number.isFinite(n) ? n : null
}

export function textoNumero(valor: number | null | undefined, casas: number): string {
  if (valor === null || valor === undefined) return ''
  return Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: casas })
}

/** As fotos gravadas no jsonb, já filtradas. */
export function fotosDoProduto(fotos: unknown): string[] {
  if (!Array.isArray(fotos)) return []
  return fotos.filter((f): f is string => typeof f === 'string' && f.trim() !== '')
}

export const HOST_IMAGENS = (() => {
  try {
    return new URL(SUPABASE_URL).hostname
  } catch {
    return 'supabase.co'
  }
})()

/** A loja só carrega imagens do domínio liberado em next.config.ts. */
export function podeExibirImagem(url: string): boolean {
  if (url.startsWith('/')) return true
  try {
    return new URL(url).hostname === HOST_IMAGENS
  } catch {
    return false
  }
}
