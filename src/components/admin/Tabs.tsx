import Link from 'next/link'

export interface Aba {
  chave: string
  rotulo: string
  contagem?: number
}

/** Abas do painel: ativa com fundo escuro, inativa com contorno. */
export function Tabs({ abas, ativa, base }: { abas: Aba[]; ativa: string; base: string }) {
  return (
    <div className="flex flex-wrap gap-[10px]">
      {abas.map((a) => {
        const selecionada = a.chave === ativa
        return (
          <Link
            key={a.chave}
            href={a.chave ? `${base}?aba=${a.chave}` : base}
            aria-current={selecionada ? 'page' : undefined}
            className="inline-flex items-center gap-2 px-[15px] py-[9px] uppercase transition-colors"
            style={{
              fontSize: 11,
              letterSpacing: '.14em',
              background: selecionada ? '#232320' : 'transparent',
              color: selecionada ? '#F2EEE7' : '#232320',
              border: `1px solid ${selecionada ? '#232320' : '#C9C0B1'}`,
            }}
          >
            {a.rotulo}
            {a.contagem !== undefined && (
              <span style={{ color: selecionada ? '#B3ADA0' : '#8A8375' }}>{a.contagem}</span>
            )}
          </Link>
        )
      })}
    </div>
  )
}
