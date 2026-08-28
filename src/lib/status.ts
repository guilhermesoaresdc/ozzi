import type { OrderStatus, ProductStatus, CampaignStatus, DeliveryMethod, PaymentMethod } from '@/lib/database.types'

export const STATUS_PEDIDO: Record<OrderStatus, { rotulo: string; cor: string }> = {
  aguardando_pagamento: { rotulo: 'Aguardando pagamento', cor: '#A0533F' },
  pago: { rotulo: 'Pago', cor: '#5C7A5E' },
  em_separacao: { rotulo: 'Em separação', cor: '#8A6A4F' },
  pronto: { rotulo: 'Pronto', cor: '#5C7A5E' },
  postado: { rotulo: 'Postado', cor: '#5C574D' },
  entregue: { rotulo: 'Entregue', cor: '#5C574D' },
  sob_encomenda: { rotulo: 'Sob encomenda', cor: '#8A6A4F' },
  cancelado: { rotulo: 'Cancelado', cor: '#A0533F' },
}

export const STATUS_PRODUTO: Record<ProductStatus, { rotulo: string; cor: string }> = {
  ativo: { rotulo: 'Ativo', cor: '#5C7A5E' },
  oculto: { rotulo: 'Oculto', cor: '#8A8375' },
  rascunho: { rotulo: 'Rascunho', cor: '#8A8375' },
}

export const STATUS_CAMPANHA: Record<CampaignStatus, { rotulo: string; cor: string }> = {
  rascunho: { rotulo: 'Rascunho', cor: '#8A8375' },
  agendada: { rotulo: 'Agendada', cor: '#8A6A4F' },
  enviada: { rotulo: 'Enviada', cor: '#5C574D' },
  ativa: { rotulo: 'Ativa', cor: '#5C7A5E' },
}

export const ENTREGA: Record<DeliveryMethod, string> = {
  retirada: 'Retirada no Centro',
  motoboy: 'Entrega local · motoboy',
  pac: 'Correios · PAC',
  sedex: 'Correios · SEDEX',
}

export const PAGAMENTO: Record<PaymentMethod, string> = {
  pix: 'PIX',
  cartao: 'Cartão de crédito',
  whatsapp: 'Combinar no WhatsApp',
  na_retirada: 'Pagar na retirada',
}

/** Cor da quantidade em estoque, por severidade (handoff §6.4). */
export function corEstoque(qtd: number): string {
  if (qtd === 0) return '#A0533F'
  if (qtd <= 5) return '#8A6A4F'
  return '#5C574D'
}
