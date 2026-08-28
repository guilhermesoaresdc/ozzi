'use client'

import { useActionState, useId, useState } from 'react'
import { Card } from '@/components/admin/Card'
import { Toggle } from '@/components/ui/Toggle'
import { salvarAvisos, type EstadoAcao } from '@/app/admin/banners/actions'
import type { NoticeRow } from '@/lib/database.types'
import { AJUDA, BOTAO, BotaoTracejado, CAMPO, Recado } from './Pecas'
import { normalizarPeriodo, PERIODOS, type PeriodoAviso } from './periodo'

interface Linha {
  chave: string
  id: string | null
  texto: string
  periodo: PeriodoAviso
  ativo: boolean
}

const INICIAL: EstadoAcao = {}

const SETA = {
  width: 22,
  height: 20,
  fontSize: 11,
  lineHeight: 1,
  border: '1px solid #C9C0B1',
  background: 'transparent',
  color: '#5C574D',
  cursor: 'pointer',
} as const

function paraLinhas(avisos: NoticeRow[]): Linha[] {
  return avisos.map((a) => ({
    chave: a.id,
    id: a.id,
    texto: a.texto,
    periodo: normalizarPeriodo(a.periodo),
    ativo: a.ativo,
  }))
}

/** Assinatura do conteúdo: compara o que está na tela com o que veio do banco. */
function assinar(faixa: boolean, linhas: Linha[]): string {
  return JSON.stringify([faixa, linhas.map((l) => [l.id, l.texto, l.periodo, l.ativo])])
}

export function AvisosBarra({ avisos, faixaAtiva }: { avisos: NoticeRow[]; faixaAtiva: boolean }) {
  const doBanco = assinar(faixaAtiva, paraLinhas(avisos))

  const [origem, setOrigem] = useState(doBanco)
  const [linhas, setLinhas] = useState<Linha[]>(() => paraLinhas(avisos))
  const [faixa, setFaixa] = useState(faixaAtiva)
  const [criadas, setCriadas] = useState(0)

  // O banco mudou (salvamos, ou outra aba mexeu): a tela volta a espelhá-lo.
  if (doBanco !== origem) {
    setOrigem(doBanco)
    setLinhas(paraLinhas(avisos))
    setFaixa(faixaAtiva)
  }

  const [estado, acao, salvando] = useActionState(salvarAvisos, INICIAL)
  const base = useId()

  const sujo = assinar(faixa, linhas) !== origem

  const alterar = (i: number, mudanca: Partial<Linha>) =>
    setLinhas((atual) => atual.map((l, j) => (j === i ? { ...l, ...mudanca } : l)))

  const mover = (i: number, passo: -1 | 1) =>
    setLinhas((atual) => {
      const destino = i + passo
      if (destino < 0 || destino >= atual.length) return atual
      const copia = [...atual]
      const [movida] = copia.splice(i, 1)
      copia.splice(destino, 0, movida)
      return copia
    })

  const remover = (i: number) => setLinhas((atual) => atual.filter((_, j) => j !== i))

  const adicionar = () => {
    setLinhas((atual) => [
      ...atual,
      { chave: `nova-${criadas}`, id: null, texto: '', periodo: 'sempre', ativo: true },
    ])
    setCriadas((n) => n + 1)
  }

  const carga = linhas.map((l) => ({ id: l.id, texto: l.texto, periodo: l.periodo, ativo: l.ativo }))

  return (
    <form action={acao}>
      <input type="hidden" name="faixaAtiva" value={faixa ? '1' : '0'} />
      <input type="hidden" name="avisos" value={JSON.stringify(carga)} />

      <Card
        titulo="Avisos da barra superior"
        acao={
          <span className="flex items-center gap-[10px]">
            <span className="oz-label">Faixa ativa</span>
            <Toggle
              checked={faixa}
              onChange={setFaixa}
              label="Mostrar a faixa de avisos no topo da loja"
            />
          </span>
        }
        semPadding
      >
        {linhas.length === 0 ? (
          <p className="px-[22px] py-[26px]" style={{ fontSize: 13, color: '#8A8375' }}>
            Nenhum aviso na faixa. Sem aviso ligado, a barra some do topo da loja.
          </p>
        ) : (
          <ul>
            {linhas.map((linha, i) => {
              const nome = linha.texto.trim() || `aviso ${i + 1}`
              const posicao = `${i + 1}º de ${linhas.length}`
              return (
                <li
                  key={linha.chave}
                  className="flex flex-wrap items-center gap-x-[14px] gap-y-3 px-[22px] py-[14px]"
                  style={{ borderBottom: '1px solid #E4DDD1' }}
                >
                  {/* Marca visual da alça. A reordenação de verdade é pelos botões ao lado. */}
                  <span aria-hidden style={{ fontSize: 15, lineHeight: 1, color: '#A79C89' }}>
                    ⠿
                  </span>

                  <span className="flex gap-[4px]">
                    <button
                      type="button"
                      onClick={() => mover(i, -1)}
                      disabled={i === 0}
                      aria-label={`Subir “${nome}” na faixa — agora é o ${posicao}`}
                      style={{ ...SETA, opacity: i === 0 ? 0.4 : 1 }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => mover(i, 1)}
                      disabled={i === linhas.length - 1}
                      aria-label={`Descer “${nome}” na faixa — agora é o ${posicao}`}
                      style={{ ...SETA, opacity: i === linhas.length - 1 ? 0.4 : 1 }}
                    >
                      ↓
                    </button>
                  </span>

                  <label htmlFor={`${base}-texto-${i}`} className="sr-only">
                    Texto do aviso {i + 1}
                  </label>
                  <input
                    id={`${base}-texto-${i}`}
                    value={linha.texto}
                    onChange={(e) => alterar(i, { texto: e.target.value })}
                    placeholder="Ex.: Frete grátis acima de R$ 249"
                    maxLength={120}
                    className="oz-input"
                    style={{ ...CAMPO, flex: '1 1 280px' }}
                  />

                  <label htmlFor={`${base}-periodo-${i}`} className="sr-only">
                    Período do aviso {i + 1}
                  </label>
                  <select
                    id={`${base}-periodo-${i}`}
                    value={linha.periodo}
                    onChange={(e) => alterar(i, { periodo: normalizarPeriodo(e.target.value) })}
                    className="oz-input"
                    style={{ ...CAMPO, width: 172, flex: '0 0 auto' }}
                  >
                    {PERIODOS.map((p) => (
                      <option key={p.valor} value={p.valor}>
                        {p.rotulo}
                      </option>
                    ))}
                  </select>

                  <Toggle
                    checked={linha.ativo}
                    onChange={(v) => alterar(i, { ativo: v })}
                    label={`Mostrar “${nome}” na faixa`}
                  />

                  <button
                    type="button"
                    onClick={() => remover(i)}
                    aria-label={`Remover “${nome}” da faixa`}
                    style={{
                      fontSize: 12,
                      color: '#A0533F',
                      background: 'none',
                      border: 0,
                      padding: 0,
                      cursor: 'pointer',
                    }}
                  >
                    Remover
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-[22px] py-[18px]">
          <BotaoTracejado onClick={adicionar}>+ Novo aviso</BotaoTracejado>

          <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {sujo && <span style={AJUDA}>Alterações ainda não salvas</span>}
            <button
              type="submit"
              disabled={salvando}
              className="oz-btn oz-btn-primary"
              style={{ ...BOTAO, padding: '13px 22px' }}
            >
              {salvando ? 'Salvando…' : 'Salvar avisos'}
            </button>
          </span>
        </div>

        {(estado.erro || estado.ok) && (
          <div className="px-[22px] pb-[18px]">
            <Recado estado={estado} />
          </div>
        )}
      </Card>
    </form>
  )
}
