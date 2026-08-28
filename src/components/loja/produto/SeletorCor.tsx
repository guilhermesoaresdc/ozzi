'use client'

import type { CorOpcao } from '@/components/loja/produto/grade'

/**
 * Swatches 46×46 com a cor real do banco. A selecionada ganha um fio escuro e
 * um respiro em linho por dentro — sem raio e sem sombra decorativa.
 */
export function SeletorCor({
  cores,
  selecionada,
  aoEscolher,
}: {
  cores: CorOpcao[]
  selecionada: string
  aoEscolher: (nome: string) => void
}) {
  return (
    <>
      <div className="flex items-baseline justify-between" style={{ marginBottom: 12 }}>
        <span className="uppercase" style={{ fontSize: 11, letterSpacing: '.16em', fontWeight: 500 }}>
          Cor · {selecionada}
        </span>
      </div>

      <div role="group" aria-label="Cor" className="flex flex-wrap" style={{ gap: 10, marginBottom: 26 }}>
        {cores.map((c) => {
          const ativa = c.nome === selecionada
          return (
            <button
              key={c.nome}
              type="button"
              title={c.nome}
              aria-pressed={ativa}
              aria-label={c.estoque === 0 ? `Cor ${c.nome} · esgotada no estoque` : `Cor ${c.nome}`}
              onClick={() => aoEscolher(c.nome)}
              className="block cursor-pointer"
              style={{
                width: 46,
                height: 46,
                padding: 0,
                background: c.hex,
                border: `1px solid ${ativa ? '#232320' : '#C9C0B1'}`,
                boxShadow: ativa ? 'inset 0 0 0 3px #F2EEE7' : undefined,
              }}
            />
          )
        })}
      </div>
    </>
  )
}
