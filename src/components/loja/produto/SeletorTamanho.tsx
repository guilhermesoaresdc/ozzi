'use client'

import type { TamanhoOpcao } from '@/components/loja/produto/grade'

/**
 * Grade de numeração. O tamanho esgotado continua clicável — é por ele que a
 * cliente chega ao caminho da encomenda (handoff §5.3).
 */
export function SeletorTamanho({
  tamanhos,
  selecionado,
  aoEscolher,
  aoVerMedidas,
}: {
  tamanhos: TamanhoOpcao[]
  selecionado: string
  aoEscolher: (tamanho: string) => void
  aoVerMedidas: () => void
}) {
  return (
    <>
      <div
        className="flex flex-wrap items-baseline justify-between"
        style={{ marginBottom: 12, gap: 14 }}
      >
        <span className="uppercase" style={{ fontSize: 11, letterSpacing: '.16em', fontWeight: 500 }}>
          Tamanho
        </span>
        <button
          type="button"
          onClick={aoVerMedidas}
          className="cursor-pointer bg-transparent"
          style={{
            fontSize: 11.5,
            color: '#8A6A4F',
            border: 'none',
            borderBottom: '1px solid #C4A88B',
            padding: 0,
          }}
        >
          Tabela de medidas
        </button>
      </div>

      <div role="group" aria-label="Tamanho" className="flex flex-wrap" style={{ gap: 8, marginBottom: 10 }}>
        {tamanhos.map((t) => {
          const ativo = t.tamanho === selecionado
          const esgotado = t.estoque === 0
          return (
            <button
              key={t.variantId}
              type="button"
              aria-pressed={ativo}
              aria-label={esgotado ? `Tamanho ${t.rotulo} · esgotado no estoque` : `Tamanho ${t.rotulo}`}
              onClick={() => aoEscolher(t.tamanho)}
              className="cursor-pointer"
              style={{
                minWidth: 52,
                padding: '13px 6px',
                textAlign: 'center',
                fontSize: 13,
                letterSpacing: '.06em',
                border: `1px solid ${ativo ? '#232320' : '#C9C0B1'}`,
                background: ativo ? '#232320' : esgotado ? '#E9E3D9' : 'transparent',
                color: ativo ? '#F2EEE7' : esgotado ? '#A79C89' : '#232320',
              }}
            >
              {t.rotulo}
            </button>
          )
        })}
      </div>
    </>
  )
}
