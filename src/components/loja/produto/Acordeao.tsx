'use client'

import type { RefObject } from 'react'

export interface ItemAcordeao {
  titulo: string
  corpo: string
}

/**
 * Acordeão controlado: um item aberto por vez, com o sinal −/+ do handoff.
 * O índice aberto mora no painel de compra porque o link "Tabela de medidas"
 * também abre o item de medidas.
 */
export function Acordeao({
  itens,
  aberto,
  aoAlternar,
  containerRef,
  idBase = 'acordeao',
}: {
  itens: ItemAcordeao[]
  aberto: number
  aoAlternar: (indice: number) => void
  containerRef?: RefObject<HTMLDivElement | null>
  idBase?: string
}) {
  if (itens.length === 0) return null

  return (
    <div ref={containerRef} style={{ borderTop: '1px solid #DFD8CB', marginTop: 26 }}>
      {itens.map((item, i) => {
        const estaAberto = i === aberto
        return (
          <div key={item.titulo} style={{ borderBottom: '1px solid #DFD8CB', padding: '18px 0' }}>
            <h3 style={{ margin: 0 }}>
              <button
                type="button"
                id={`${idBase}-titulo-${i}`}
                aria-expanded={estaAberto}
                aria-controls={`${idBase}-corpo-${i}`}
                onClick={() => aoAlternar(i)}
                className="flex w-full cursor-pointer items-center justify-between bg-transparent uppercase"
                style={{
                  gap: 16,
                  border: 'none',
                  padding: 0,
                  fontSize: 11.5,
                  letterSpacing: '.14em',
                  fontWeight: 500,
                  textAlign: 'left',
                  color: '#232320',
                }}
              >
                {item.titulo}
                <span aria-hidden="true" style={{ fontSize: 16, color: '#8A8375', lineHeight: 1 }}>
                  {estaAberto ? '−' : '+'}
                </span>
              </button>
            </h3>
            <div
              id={`${idBase}-corpo-${i}`}
              role="region"
              aria-labelledby={`${idBase}-titulo-${i}`}
              hidden={!estaAberto}
            >
              <p
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.7,
                  color: '#5C574D',
                  margin: '12px 0 0',
                  textWrap: 'pretty',
                }}
              >
                {item.corpo}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
