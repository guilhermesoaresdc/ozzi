'use client'

import { brl } from '@/lib/format'
import { calcularFrete, rotuloFrete } from '@/lib/pricing'
import type { DeliveryMethod } from '@/lib/database.types'

/** Uma linha da tabela `shipping_methods`, já com o preço como número. */
export interface MetodoEntrega {
  chave: DeliveryMethod
  nome: string
  detalhe: string
  preco: number
}

/** Só os Correios entram na regra de frete grátis (handoff §5.5). */
const CORREIOS: DeliveryMethod[] = ['pac', 'sedex']

export function OpcoesEntrega({
  metodos,
  escolhido,
  subtotal,
  precos,
  freteGratisAcima,
  aoEscolher,
}: {
  metodos: MetodoEntrega[]
  escolhido: DeliveryMethod
  subtotal: number
  precos: Partial<Record<DeliveryMethod, number>>
  freteGratisAcima: number
  aoEscolher: (chave: DeliveryMethod) => void
}) {
  return (
    <fieldset style={{ border: 0, margin: '0 0 20px', padding: 0, minWidth: 0 }}>
      <legend
        className="uppercase"
        style={{ fontSize: 11, letterSpacing: '.16em', fontWeight: 500, padding: 0, marginBottom: 10 }}
      >
        Entrega
      </legend>

      <div className="flex flex-col" style={{ gap: 8 }}>
        {metodos.map((metodo) => {
          const valor = calcularFrete(metodo.chave, subtotal, precos, freteGratisAcima)
          const selecionado = metodo.chave === escolhido
          // O aviso do frete grátis só faz sentido enquanto ele ainda não valeu.
          const avisoGratis = CORREIOS.includes(metodo.chave) && subtotal < freteGratisAcima

          return (
            <label
              key={metodo.chave}
              className="flex cursor-pointer items-center justify-between has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#232320]"
              style={{
                gap: 12,
                padding: '12px 14px',
                fontSize: 13,
                border: `1px solid ${selecionado ? '#232320' : '#DFD8CB'}`,
                background: selecionado ? '#E9E3D9' : 'transparent',
              }}
            >
              <input
                type="radio"
                name="entrega"
                value={metodo.chave}
                checked={selecionado}
                onChange={() => aoEscolher(metodo.chave)}
                className="sr-only"
              />
              <span className="flex min-w-0 flex-col" style={{ gap: 3 }}>
                <span>{metodo.nome}</span>
                <span style={{ fontSize: 11.5, color: '#8A8375', lineHeight: 1.5 }}>
                  {metodo.detalhe}
                  {avisoGratis ? ` · grátis acima de ${brl(freteGratisAcima)}` : ''}
                </span>
              </span>
              <span className="shrink-0">{rotuloFrete(valor)}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
