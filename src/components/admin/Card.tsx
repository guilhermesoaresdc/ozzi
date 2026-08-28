import type { ReactNode } from 'react'

/** Cartão padrão de seção do painel (handoff §6). */
export function Card({
  titulo,
  acao,
  children,
  className = '',
  semPadding = false,
}: {
  titulo?: ReactNode
  acao?: ReactNode
  children: ReactNode
  className?: string
  semPadding?: boolean
}) {
  return (
    <section className={`oz-card flex flex-col ${className}`}>
      {(titulo || acao) && (
        <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-line px-[22px] py-5">
          {typeof titulo === 'string' ? (
            <h2 className="font-display" style={{ fontSize: 20, fontWeight: 400 }}>
              {titulo}
            </h2>
          ) : (
            titulo
          )}
          {acao}
        </header>
      )}
      <div className={semPadding ? '' : 'p-[22px]'}>{children}</div>
    </section>
  )
}

/** Linha de lista dentro de um cartão, com o divisor e o hover do handoff. */
export function CardRow({
  children,
  className = '',
  ultima = false,
}: {
  children: ReactNode
  className?: string
  ultima?: boolean
}) {
  return (
    <div
      className={`oz-table-row flex flex-wrap items-center gap-x-5 gap-y-2 px-[22px] py-[15px] transition-colors ${className}`}
      style={{ borderBottom: ultima ? undefined : '1px solid #E4DDD1' }}
    >
      {children}
    </div>
  )
}

/** Cartão de KPI: label, valor em Cormorant e tendência colorida. */
export function Kpi({
  label,
  valor,
  tendencia,
  cor = '#5C574D',
}: {
  label: string
  valor: string
  tendencia?: string
  cor?: string
}) {
  return (
    <div className="oz-hairline-cell flex flex-col gap-[10px] px-[22px] pt-[22px] pb-5" style={{ background: '#FAF7F2' }}>
      <span className="oz-label">{label}</span>
      <span className="font-display" style={{ fontSize: 36, fontWeight: 400, lineHeight: 1 }}>
        {valor}
      </span>
      {tendencia && (
        <span style={{ fontSize: 12, color: cor }}>{tendencia}</span>
      )}
    </div>
  )
}

/** Container de tabela larga: mantém o min-width e rola na horizontal (handoff §7). */
export function TableScroll({ children, minWidth }: { children: ReactNode; minWidth: number }) {
  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth }}>{children}</div>
    </div>
  )
}
