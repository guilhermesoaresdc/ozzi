import Link from 'next/link'

/** O botão do handoff: 9px 15px, 11px, .14em, raio zero. */
const BOTAO = {
  fontSize: 11,
  letterSpacing: '.14em',
  padding: '9px 15px',
  lineHeight: 1,
} as const

/** Primeira, última e a vizinhança da página atual — o resto vira reticência. */
function paginasVisiveis(atual: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const numeros = [...new Set([1, atual - 1, atual, atual + 1, total])]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b)

  const saida: (number | '…')[] = []
  numeros.forEach((n, i) => {
    const anterior = numeros[i - 1]
    if (i > 0 && anterior !== undefined && n - anterior > 1) saida.push('…')
    saida.push(n)
  })
  return saida
}

export function Paginacao({
  aba,
  pagina,
  totalPaginas,
  mostrando,
  total,
}: {
  aba: string
  pagina: number
  totalPaginas: number
  /** Quantas peças aparecem nesta página. */
  mostrando: number
  /** Quantas peças a aba tem no total. */
  total: number
}) {
  const href = (n: number) => `/admin/produtos?aba=${aba}&pagina=${n}`
  const paginas = paginasVisiveis(pagina, totalPaginas)

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line px-5 py-4">
      <span style={{ fontSize: 12, color: '#8A8375' }}>
        Mostrando {mostrando} de {total} produtos
      </span>

      {totalPaginas > 1 && (
        <nav aria-label="Paginação de produtos" className="flex flex-wrap items-center gap-[6px]">
          {pagina > 1 ? (
            <Link href={href(pagina - 1)} className="oz-btn oz-btn-tertiary" style={BOTAO}>
              Anterior
            </Link>
          ) : (
            <span
              className="oz-btn"
              style={{ ...BOTAO, borderColor: '#E4DDD1', color: '#A79C89', cursor: 'default' }}
            >
              Anterior
            </span>
          )}

          {paginas.map((n, i) =>
            n === '…' ? (
              <span key={`corte-${i}`} className="oz-btn" style={{ ...BOTAO, color: '#8A8375', cursor: 'default' }} aria-hidden="true">
                …
              </span>
            ) : n === pagina ? (
              <span
                key={n}
                aria-current="page"
                className="oz-btn"
                style={{ ...BOTAO, background: '#232320', borderColor: '#232320', color: '#F2EEE7', cursor: 'default' }}
              >
                {n}
              </span>
            ) : (
              <Link
                key={n}
                href={href(n)}
                aria-label={`Página ${n}`}
                className="oz-btn oz-btn-tertiary"
                style={BOTAO}
              >
                {n}
              </Link>
            ),
          )}

          {pagina < totalPaginas ? (
            <Link href={href(pagina + 1)} className="oz-btn oz-btn-tertiary" style={BOTAO}>
              Próxima
            </Link>
          ) : (
            <span
              className="oz-btn"
              style={{ ...BOTAO, borderColor: '#E4DDD1', color: '#A79C89', cursor: 'default' }}
            >
              Próxima
            </span>
          )}
        </nav>
      )}
    </div>
  )
}
