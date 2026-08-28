'use client'

/** Termos do handoff §5.4 — conteúdo editorial, não vem do banco. */
export const MAIS_BUSCADOS = [
  'vestido de linho',
  'conjunto alfaiataria',
  'blusa cropped',
  'saia midi',
  'sandália',
  'moda praia',
]

export function ChipsSugestoes({
  ativo,
  aoEscolher,
}: {
  /** Termo em exibição, para marcar o chip correspondente. */
  ativo: string
  aoEscolher: (termo: string) => void
}) {
  return (
    <div className="flex flex-wrap" style={{ gap: 26, marginBottom: 44 }}>
      <div style={{ flex: '1 1 220px' }}>
        <h2
          className="uppercase"
          style={{
            fontSize: 11,
            letterSpacing: '.16em',
            fontWeight: 500,
            color: '#8A8375',
            marginBottom: 14,
          }}
        >
          Mais buscados
        </h2>
        <div className="flex flex-wrap" style={{ gap: 8 }}>
          {MAIS_BUSCADOS.map((termo) => {
            const marcado = termo === ativo
            return (
              <button
                key={termo}
                type="button"
                aria-pressed={marcado}
                onClick={() => aoEscolher(termo)}
                className={`cursor-pointer border ${
                  marcado
                    ? 'border-ink bg-surface-sunken'
                    : 'border-line-input bg-transparent hover:border-ink hover:bg-surface-sunken'
                }`}
                style={{ padding: '9px 15px', fontSize: 12.5 }}
              >
                {termo}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
