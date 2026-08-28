import { brl, brlPlain } from '@/lib/format'

/* Regras de cupom que o banco já conhece (coluna `regra` da tabela coupons). */
export const CHAVES_REGRA = ['geral', 'primeira_compra', 'faixa_cep', 'aniversario'] as const

export type RegraCupom = (typeof CHAVES_REGRA)[number]

/** Rótulo curto da regra, escrito para vir logo depois de "10% off, ". */
export const REGRAS_CUPOM: { chave: RegraCupom; rotulo: string }[] = [
  { chave: 'geral', rotulo: 'qualquer compra' },
  { chave: 'primeira_compra', rotulo: 'primeira compra' },
  { chave: 'faixa_cep', rotulo: 'CEPs do Cariri' },
  { chave: 'aniversario', rotulo: 'aniversário, automático' },
]

export function rotuloRegra(regra: string): string {
  return REGRAS_CUPOM.find((r) => r.chave === regra)?.rotulo ?? regra.replace(/_/g, ' ')
}

/** "10% off" ou "R$ 20,00 off" */
export function descontoEmTexto(tipo: string, valor: number): string {
  if (tipo === 'valor') return `${brl(valor)} off`
  return `${Number(valor).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}% off`
}

/** A regra em texto do handoff §6.9: "10% off, primeira compra". */
export function descricaoDoCupom(cupom: { tipo: string; valor: number; regra: string }): string {
  return `${descontoEmTexto(cupom.tipo, cupom.valor)}, ${rotuloRegra(cupom.regra)}`
}

/** "até 31/08" ou "sem prazo" — a coluna de validade da lista de cupons. */
export function validadeEmTexto(validade: string | null): string {
  if (!validade) return 'sem prazo'
  const [ano, mes, dia] = validade.split('-')
  if (!ano || !mes || !dia) return 'sem prazo'
  return `até ${dia}/${mes}`
}

/** 12 → "12,00". O campo de preço mostra o número do jeito que o Brasil escreve. */
export function emReais(valor: number): string {
  return brlPlain(valor)
}

/** 0,05 → "5". A coluna guarda a fração; a tela pergunta em porcentagem. */
export function emPorcento(fracao: number): string {
  return (Number(fracao) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}
