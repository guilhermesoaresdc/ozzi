import type { VariantRow } from '@/lib/database.types'

/** Ordem canônica da numeração — o banco guarda a grade sem ordenação própria. */
const ORDEM_TAMANHO: Record<string, number> = { P: 0, M: 1, G: 2, GG: 3, U: 4 }

const ROTULO_TAMANHO: Record<string, string> = { U: 'Único' }

export interface TamanhoOpcao {
  variantId: string
  tamanho: string
  rotulo: string
  estoque: number
}

export interface CorOpcao {
  nome: string
  hex: string
  /** Soma da grade desta cor — zero significa "só sob encomenda". */
  estoque: number
  tamanhos: TamanhoOpcao[]
}

/** Agrupa as variantes por cor. A ordem das cores é a do campo `ordem`. */
export function montarGrade(variantes: VariantRow[]): CorOpcao[] {
  const porCor = new Map<string, CorOpcao>()

  for (const v of variantes) {
    let cor = porCor.get(v.cor_nome)
    if (!cor) {
      cor = { nome: v.cor_nome, hex: v.cor_hex, estoque: 0, tamanhos: [] }
      porCor.set(v.cor_nome, cor)
    }
    cor.tamanhos.push({
      variantId: v.id,
      tamanho: v.tamanho,
      rotulo: ROTULO_TAMANHO[v.tamanho] ?? v.tamanho,
      estoque: v.estoque,
    })
    cor.estoque += v.estoque
  }

  for (const cor of porCor.values()) {
    cor.tamanhos.sort((a, b) => (ORDEM_TAMANHO[a.tamanho] ?? 99) - (ORDEM_TAMANHO[b.tamanho] ?? 99))
  }
  return [...porCor.values()]
}

export interface Selecao {
  cor: string
  tamanho: string
}

/** Abre a página já na primeira cor e numeração com peça no estoque. */
export function selecaoInicial(grade: CorOpcao[]): Selecao {
  const cor = grade.find((c) => c.estoque > 0) ?? grade[0]
  if (!cor) return { cor: '', tamanho: '' }
  const tamanho = cor.tamanhos.find((t) => t.estoque > 0) ?? cor.tamanhos[0]
  return { cor: cor.nome, tamanho: tamanho?.tamanho ?? '' }
}

/** Peça de tamanho único (acessórios): não faz sentido desenhar a grade. */
export function tamanhoUnico(grade: CorOpcao[]): boolean {
  return grade.length > 0 && grade.every((c) => c.tamanhos.length === 1 && c.tamanhos[0].tamanho === 'U')
}
