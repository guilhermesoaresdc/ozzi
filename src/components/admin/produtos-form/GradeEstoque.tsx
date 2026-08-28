'use client'

import { TableScroll } from '@/components/admin/Card'
import { ESTILO_NUMERO } from './Campos'
import {
  TAMANHOS,
  linhaVazia,
  totalDaLinha,
  type LinhaGrade,
  type Numeracao,
} from './dados'
import { num } from '@/lib/format'

const COLUNAS = '1.4fr repeat(4,1fr) 1fr'

const SWATCH = `.oz-swatch::-webkit-color-swatch-wrapper{padding:0}
.oz-swatch::-webkit-color-swatch{border:none}
.oz-swatch::-moz-color-swatch{border:none}`

export function GradeEstoque({
  linhas,
  numeracao,
  aceitaEncomenda,
  onLinhas,
  onNumeracao,
}: {
  linhas: LinhaGrade[]
  numeracao: Numeracao
  aceitaEncomenda: boolean
  onLinhas: (linhas: LinhaGrade[]) => void
  onNumeracao: (numeracao: Numeracao) => void
}) {
  const tamanhos = TAMANHOS[numeracao]
  const total = linhas.reduce((soma, l) => soma + totalDaLinha(l, numeracao), 0)
  const unico = numeracao === 'unico'

  const editar = (chave: string, muda: (linha: LinhaGrade) => LinhaGrade) =>
    onLinhas(linhas.map((l) => (l.chave === chave ? muda(l) : l)))

  return (
    <section className="oz-card" style={{ padding: 24 }}>
      <style>{SWATCH}</style>

      <div className="mb-[18px] flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 400 }}>
          Grade de estoque
        </h2>
        <span style={{ fontSize: 12, color: '#8A8375' }}>
          Zero em uma numeração = vira &ldquo;sob encomenda&rdquo; na loja
        </span>
      </div>

      <label className="mb-[14px] flex flex-wrap items-center gap-[10px]">
        <span className="oz-label">Numeração</span>
        <select
          name="numeracao"
          value={numeracao}
          onChange={(e) => onNumeracao(e.target.value === 'unico' ? 'unico' : 'grade')}
          style={{ ...ESTILO_NUMERO, width: 'auto' }}
        >
          <option value="grade">P · M · G · GG</option>
          <option value="unico">Tamanho único</option>
        </select>
      </label>

      <TableScroll minWidth={560}>
        <div
          className="grid gap-[12px] border-b border-line pb-[10px] uppercase"
          style={{ gridTemplateColumns: COLUNAS, fontSize: 10.5, letterSpacing: '.14em', color: '#8A8375' }}
        >
          <span>Cor</span>
          {unico ? (
            <span style={{ gridColumn: 'span 4' }}>Único</span>
          ) : (
            tamanhos.map((t) => <span key={t}>{t}</span>)
          )}
          <span>Total</span>
        </div>

        {linhas.map((linha, i) => {
          const nome = linha.cor.trim() || `cor ${i + 1}`
          return (
            <div
              key={linha.chave}
              className="grid items-center gap-[12px]"
              style={{ gridTemplateColumns: COLUNAS, padding: '12px 0', borderBottom: '1px solid #E4DDD1' }}
            >
              <span className="flex min-w-0 items-center gap-[10px]">
                <input
                  type="color"
                  className="oz-swatch"
                  aria-label={`Cor do mostruário da ${nome}`}
                  value={linha.hex}
                  onChange={(e) => editar(linha.chave, (l) => ({ ...l, hex: e.target.value }))}
                  style={{
                    width: 22,
                    height: 22,
                    flexShrink: 0,
                    border: '1px solid #C9C0B1',
                    padding: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                />
                <input
                  type="text"
                  aria-label={`Nome da cor da linha ${i + 1}`}
                  placeholder="Nome da cor"
                  value={linha.cor}
                  onChange={(e) => editar(linha.chave, (l) => ({ ...l, cor: e.target.value }))}
                  style={{ ...ESTILO_NUMERO, fontSize: 13.5 }}
                />
              </span>

              {tamanhos.map((t) => (
                <input
                  key={t}
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  aria-label={
                    unico ? `Estoque de ${nome}, tamanho único` : `Estoque de ${nome} no tamanho ${t}`
                  }
                  placeholder="0"
                  value={linha.quantidades[t]}
                  onChange={(e) =>
                    editar(linha.chave, (l) => ({
                      ...l,
                      quantidades: { ...l.quantidades, [t]: e.target.value },
                    }))
                  }
                  style={{ ...ESTILO_NUMERO, gridColumn: unico ? 'span 4' : undefined }}
                />
              ))}

              <span className="flex items-center justify-between gap-2">
                <span style={{ fontSize: 13.5, color: '#5C574D' }}>{totalDaLinha(linha, numeracao)}</span>
                <button
                  type="button"
                  onClick={() => onLinhas(linhas.filter((l) => l.chave !== linha.chave))}
                  aria-label={`Remover a ${nome} da grade`}
                  className="cursor-pointer uppercase text-muted hover:text-danger"
                  style={{ fontSize: 10.5, letterSpacing: '.12em', background: 'none', border: 0, padding: 0 }}
                >
                  Remover
                </button>
              </span>
            </div>
          )
        })}
      </TableScroll>

      <button
        type="button"
        onClick={() => onLinhas([...linhas, linhaVazia()])}
        className="mt-[14px] w-full cursor-pointer border border-dashed border-line-dashed text-muted transition-colors hover:border-ink hover:text-ink"
        style={{ padding: 12, fontSize: 11.5, background: 'transparent' }}
      >
        + Adicionar cor
      </button>

      <p className="mt-[12px]" style={{ fontSize: 12, lineHeight: 1.6, color: '#8A8375' }}>
        {total > 0
          ? `Total na grade: ${num(total)} ${total === 1 ? 'peça' : 'peças'} em ${linhas.length} ${
              linhas.length === 1 ? 'cor' : 'cores'
            }.`
          : aceitaEncomenda
            ? 'Grade zerada: a peça fica como “Sob encomenda” na loja, com o prazo de produção ao lado.'
            : 'Grade zerada e sem encomenda: a peça fica como “Esgotado” e sai da vitrine.'}
      </p>
    </section>
  )
}
