'use client'

import type { RefObject } from 'react'
import type { MedidaPorTamanho } from '@/lib/queries'

export interface ItemAcordeao {
  titulo: string
  corpo: string
  /** Medidas por numeração, exibidas como tabela acima do texto. */
  tabela?: MedidaPorTamanho[]
}

const COLUNAS: { chave: keyof Omit<MedidaPorTamanho, 'tamanho'>; rotulo: string }[] = [
  { chave: 'busto', rotulo: 'Busto' },
  { chave: 'cintura', rotulo: 'Cintura' },
  { chave: 'quadril', rotulo: 'Quadril' },
  { chave: 'comprimento', rotulo: 'Comprimento' },
]

function TabelaDeMedidas({ linhas }: { linhas: MedidaPorTamanho[] }) {
  // Só mostra a coluna que tem pelo menos um valor preenchido.
  const colunas = COLUNAS.filter((c) => linhas.some((l) => l[c.chave]))
  if (colunas.length === 0) return null

  return (
    <div className="overflow-x-auto" style={{ marginBottom: 16 }}>
      <table style={{ width: '100%', minWidth: 320, borderCollapse: 'collapse', fontSize: 13 }}>
        <caption className="sr-only">Medidas da peça por numeração, em centímetros</caption>
        <thead>
          <tr>
            <th scope="col" className="oz-label" style={{ textAlign: 'left', padding: '8px 10px 8px 0' }}>
              Numeração
            </th>
            {colunas.map((c) => (
              <th key={c.chave} scope="col" className="oz-label" style={{ textAlign: 'left', padding: '8px 10px' }}>
                {c.rotulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => (
            <tr key={linha.tamanho} style={{ borderTop: '1px solid #E4DDD1' }}>
              <th scope="row" style={{ textAlign: 'left', padding: '9px 10px 9px 0', fontWeight: 400 }}>
                {linha.tamanho}
              </th>
              {colunas.map((c) => (
                <td key={c.chave} style={{ padding: '9px 10px', color: '#5C574D' }}>
                  {linha[c.chave] ? `${linha[c.chave]} cm` : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
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
              style={{ paddingTop: 12 }}
            >
              {item.tabela && item.tabela.length > 0 && <TabelaDeMedidas linhas={item.tabela} />}
              {item.corpo && (
                <p
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.7,
                    color: '#5C574D',
                    margin: 0,
                    textWrap: 'pretty',
                  }}
                >
                  {item.corpo}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
