'use client'

import { useId } from 'react'

export interface LinhaMedida {
  tamanho: string
  busto: string
  cintura: string
  quadril: string
  comprimento: string
}

export const COLUNAS: { chave: keyof Omit<LinhaMedida, 'tamanho'>; rotulo: string }[] = [
  { chave: 'busto', rotulo: 'Busto' },
  { chave: 'cintura', rotulo: 'Cintura' },
  { chave: 'quadril', rotulo: 'Quadril' },
  { chave: 'comprimento', rotulo: 'Comprim.' },
]

export function linhaVazia(tamanho = ''): LinhaMedida {
  return { tamanho, busto: '', cintura: '', quadril: '', comprimento: '' }
}

const ESTILO: React.CSSProperties = {
  width: '100%',
  border: '1px solid #C9C0B1',
  background: '#FAF7F2',
  padding: '9px 10px',
  fontSize: 13,
}

/**
 * Medidas em centímetros por numeração. Alimenta a aba "Medidas e numeração"
 * da página de produto, para a cliente conferir antes de comprar.
 */
export function TabelaMedidas({
  linhas,
  onLinhas,
}: {
  linhas: LinhaMedida[]
  onLinhas: (linhas: LinhaMedida[]) => void
}) {
  const id = useId()

  function editar(indice: number, chave: keyof LinhaMedida, valor: string) {
    onLinhas(linhas.map((l, i) => (i === indice ? { ...l, [chave]: valor } : l)))
  }

  return (
    <section className="oz-card flex flex-col gap-[14px]" style={{ padding: 24 }}>
      <div>
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 400 }}>
          Tabela de medidas
        </h2>
        <p style={{ fontSize: 12.5, color: '#8A8375', marginTop: 4 }}>
          Em centímetros. O que você preencher aqui aparece na peça, no item
          &quot;Medidas e numeração&quot;. Campo em branco não é exibido.
        </p>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: 520 }}>
          <div
            className="grid gap-[10px] pb-[8px]"
            style={{ gridTemplateColumns: '1fr repeat(4, 1fr) 90px', borderBottom: '1px solid #E4DDD1' }}
          >
            <span className="oz-label">Numeração</span>
            {COLUNAS.map((c) => (
              <span key={c.chave} className="oz-label">
                {c.rotulo}
              </span>
            ))}
            <span className="oz-label" />
          </div>

          {linhas.map((linha, i) => (
            <div
              key={i}
              className="grid items-center gap-[10px] py-[10px]"
              style={{ gridTemplateColumns: '1fr repeat(4, 1fr) 90px', borderBottom: '1px solid #E4DDD1' }}
            >
              <span>
                <label htmlFor={`${id}-t-${i}`} className="sr-only">
                  Numeração da linha {i + 1}
                </label>
                <input
                  id={`${id}-t-${i}`}
                  value={linha.tamanho}
                  onChange={(e) => editar(i, 'tamanho', e.target.value)}
                  placeholder="M"
                  style={ESTILO}
                />
              </span>
              {COLUNAS.map((c) => (
                <span key={c.chave}>
                  <label htmlFor={`${id}-${c.chave}-${i}`} className="sr-only">
                    {c.rotulo} do tamanho {linha.tamanho || i + 1}
                  </label>
                  <input
                    id={`${id}-${c.chave}-${i}`}
                    value={linha[c.chave]}
                    onChange={(e) => editar(i, c.chave, e.target.value)}
                    inputMode="decimal"
                    placeholder="—"
                    style={ESTILO}
                  />
                </span>
              ))}
              <button
                type="button"
                onClick={() => onLinhas(linhas.filter((_, x) => x !== i))}
                className="cursor-pointer text-left"
                style={{ fontSize: 11.5, color: '#A0533F' }}
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onLinhas([...linhas, linhaVazia()])}
        className="cursor-pointer self-start"
        style={{ border: '1px dashed #B8AE9C', padding: '10px 16px', fontSize: 12.5, color: '#8A8375' }}
      >
        + Nova numeração
      </button>
    </section>
  )
}
