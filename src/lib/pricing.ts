import { brl } from '@/lib/format'
import type { DeliveryMethod, PaymentMethod } from '@/lib/database.types'

/** Regras de negócio da loja (handoff §10). Os valores default espelham o seed. */
export const REGRAS = {
  descontoAVista: 0.10,
  freteGratisAcima: 249,
  parcelasMax: 2,
  motoboy: 12,
  pac: 24.9,
  sedex: 39.9,
} as const

export function arredonda(v: number): number {
  return Math.round((v + Number.EPSILON) * 100) / 100
}

/** O frete cobrado, já com a regra de grátis acima de R$ 249 nos Correios. */
export function calcularFrete(
  metodo: DeliveryMethod,
  subtotal: number,
  precos: Partial<Record<DeliveryMethod, number>> = {},
  freteGratisAcima: number = REGRAS.freteGratisAcima,
): number {
  if (metodo === 'retirada') return 0
  if (metodo === 'motoboy') return precos.motoboy ?? REGRAS.motoboy
  if (subtotal >= freteGratisAcima) return 0
  return metodo === 'sedex' ? (precos.sedex ?? REGRAS.sedex) : (precos.pac ?? REGRAS.pac)
}

/** Rótulo do frete no resumo: "Grátis" ou o valor formatado. */
export function rotuloFrete(valor: number): string {
  return valor === 0 ? 'Grátis' : brl(valor)
}

export function descontoAVista(subtotal: number, taxa: number = REGRAS.descontoAVista): number {
  return arredonda(subtotal * taxa)
}

export interface Totais {
  subtotal: number
  frete: number
  desconto: number
  total: number
  /** Total sem o desconto do PIX — usado na linha "ou X em até 6x". */
  totalCartao: number
  parcela: number
  parcelas: number
}

export function calcularTotais(opts: {
  subtotal: number
  metodoEntrega: DeliveryMethod
  metodoPagamento?: PaymentMethod
  precosFrete?: Partial<Record<DeliveryMethod, number>>
  freteGratisAcima?: number
  taxaAVista?: number
  parcelas?: number
  descontoCupom?: number
}): Totais {
  const {
    subtotal,
    metodoEntrega,
    metodoPagamento = 'pix',
    precosFrete = {},
    freteGratisAcima = REGRAS.freteGratisAcima,
    taxaAVista = REGRAS.descontoAVista,
    parcelas = REGRAS.parcelasMax,
    descontoCupom = 0,
  } = opts

  const frete = calcularFrete(metodoEntrega, subtotal, precosFrete, freteGratisAcima)
  // O desconto à vista incide só no subtotal. Vale para PIX e para dinheiro
  // na retirada — cartão fica de fora porque a maquininha cobra taxa.
  const avista = ehAVista(metodoPagamento) ? descontoAVista(subtotal, taxaAVista) : 0
  const desconto = arredonda(avista + descontoCupom)
  const total = arredonda(Math.max(0, subtotal + frete - desconto))
  const totalCartao = arredonda(Math.max(0, subtotal + frete - descontoCupom))

  return {
    subtotal: arredonda(subtotal),
    frete: arredonda(frete),
    desconto,
    total,
    totalCartao,
    parcelas,
    parcela: arredonda(totalCartao / parcelas),
  }
}

/** Formas que contam como pagamento à vista. */
export function ehAVista(metodo: PaymentMethod): boolean {
  return metodo === 'pix' || metodo === 'na_retirada'
}

/** Preço à vista de uma peça isolada — a linha da página de produto. */
export function precoAVista(preco: number, taxa: number = REGRAS.descontoAVista): number {
  return arredonda(preco * (1 - taxa))
}

export function valorParcela(preco: number, parcelas: number = REGRAS.parcelasMax): number {
  return arredonda(preco / parcelas)
}
