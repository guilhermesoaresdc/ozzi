'use client'

import { CheckSquare } from '@/components/ui/Checkbox'
import { ProvaEmCasa } from './ProvaEmCasa'
import { totalSelecionado, type ChaveFiltro, type GrupoFiltro, type Selecao } from './facetas'

export function FiltrosSidebar({
  filtros,
  selecao,
  aoAlternar,
  aoLimpar,
}: {
  filtros: GrupoFiltro[]
  selecao: Selecao
  aoAlternar: (chave: ChaveFiltro, valor: string) => void
  aoLimpar: () => void
}) {
  const escolhidos = totalSelecionado(selecao)

  return (
    <aside className="flex flex-col gap-7" style={{ maxWidth: 250 }}>
      {escolhidos > 0 && (
        <div className="flex items-baseline justify-between gap-3">
          <span className="oz-label">
            {escolhidos} {escolhidos === 1 ? 'filtro' : 'filtros'}
          </span>
          <button
            type="button"
            onClick={aoLimpar}
            className="cursor-pointer bg-transparent p-0 uppercase"
            style={{
              fontSize: 10.5,
              letterSpacing: '.14em',
              border: 'none',
              borderBottom: '1px solid #232320',
              paddingBottom: 2,
            }}
          >
            Limpar
          </button>
        </div>
      )}

      {filtros.map((grupo) => (
        <div key={grupo.chave}>
          <h2
            className="uppercase border-b border-line"
            style={{
              fontSize: 11,
              letterSpacing: '.16em',
              fontWeight: 500,
              marginBottom: 13,
              paddingBottom: 10,
            }}
          >
            {grupo.titulo}
          </h2>
          <div className="flex flex-col gap-[10px]">
            {grupo.opcoes.map((opcao) => {
              const id = `filtro-${grupo.chave}-${opcao.valor.replace(/\W+/g, '-').toLowerCase()}`
              const marcado = selecao[grupo.chave].includes(opcao.valor)
              return (
                <label
                  key={opcao.valor}
                  htmlFor={id}
                  className="flex cursor-pointer items-center gap-[10px] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-ink"
                  style={{ fontSize: 13.5, color: '#3E3B34' }}
                >
                  <input
                    id={id}
                    type="checkbox"
                    className="sr-only"
                    checked={marcado}
                    onChange={() => aoAlternar(grupo.chave, opcao.valor)}
                  />
                  <CheckSquare checked={marcado} />
                  <span className="flex-1">{opcao.rotulo}</span>
                  <span aria-hidden style={{ fontSize: 10.5, color: '#9A9385' }}>
                    {opcao.contagem}
                  </span>
                  <span className="sr-only">
                    {opcao.contagem} {opcao.contagem === 1 ? 'peça' : 'peças'}
                  </span>
                </label>
              )
            })}
          </div>
        </div>
      ))}

      <ProvaEmCasa />
    </aside>
  )
}
