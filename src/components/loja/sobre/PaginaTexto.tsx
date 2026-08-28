import Link from 'next/link'

export interface TabelaTexto {
  cabecalho: string[]
  linhas: string[][]
}

export interface SecaoTexto {
  titulo: string
  paragrafos?: string[]
  itens?: string[]
  tabela?: TabelaTexto
}

function Tabela({ tabela, rotulo }: { tabela: TabelaTexto; rotulo: string }) {
  return (
    // A tabela rola dentro do próprio contêiner; a página nunca rola na horizontal.
    <div className="overflow-x-auto" style={{ marginTop: 20, border: '1px solid #DFD8CB' }}>
      <table
        style={{ borderCollapse: 'collapse', width: '100%', minWidth: 420, background: '#FAF7F2' }}
      >
        <caption className="sr-only">{rotulo}</caption>
        <thead>
          <tr>
            {tabela.cabecalho.map((c) => (
              <th
                key={c}
                scope="col"
                className="oz-label text-left"
                style={{ padding: '12px 14px', borderBottom: '1px solid #DFD8CB', fontWeight: 400 }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tabela.linhas.map((linha) => (
            <tr key={linha.join('|')}>
              {linha.map((celula, i) => (
                <td
                  key={`${linha[0]}-${i}`}
                  style={{
                    padding: '13px 14px',
                    borderTop: '1px solid #E4DDD1',
                    fontSize: 13.5,
                    lineHeight: 1.6,
                    color: i === 0 ? '#232320' : '#5C574D',
                    whiteSpace: i === 0 ? 'nowrap' : undefined,
                  }}
                >
                  {celula}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Layout de leitura das páginas de ajuda (handoff §5.9): coluna de 720px,
 * H1 em Cormorant e corpo de 15px.
 */
export function PaginaTexto({
  chapeu,
  titulo,
  resumo,
  secoes,
  children,
}: {
  chapeu: string
  titulo: string
  resumo: string
  secoes: SecaoTexto[]
  children?: React.ReactNode
}) {
  return (
    <div
      className="w-full"
      style={{ maxWidth: 776, margin: '0 auto', padding: '24px 28px 92px' }}
    >
      <nav
        aria-label="Trilha de navegação"
        className="uppercase"
        style={{ fontSize: 11, letterSpacing: '.1em', color: '#8A8375', marginBottom: 30 }}
      >
        <Link href="/" className="text-muted hover:text-accent">
          Início
        </Link>
        <span aria-hidden style={{ padding: '0 7px' }}>
          /
        </span>
        <span aria-current="page" className="text-ink">
          {titulo}
        </span>
      </nav>

      <article>
        <span className="oz-eyebrow block" style={{ marginBottom: 18 }}>
          {chapeu}
        </span>

        <h1
          className="font-display text-balance"
          style={{
            fontWeight: 300,
            fontSize: 'clamp(34px, 4.4vw, 52px)',
            lineHeight: 1.06,
            letterSpacing: '-.015em',
            marginBottom: 18,
          }}
        >
          {titulo}
        </h1>

        <p
          className="text-pretty"
          style={{ fontSize: 15.5, lineHeight: 1.72, color: '#5C574D' }}
        >
          {resumo}
        </p>

        {secoes.map((s) => (
          <section
            key={s.titulo}
            style={{ marginTop: 34, paddingTop: 30, borderTop: '1px solid #DFD8CB' }}
          >
            <h2
              className="font-display"
              style={{ fontSize: 24, fontWeight: 400, lineHeight: 1.2, marginBottom: 12 }}
            >
              {s.titulo}
            </h2>

            {s.paragrafos?.map((p) => (
              <p
                key={p}
                className="text-pretty"
                style={{ fontSize: 15, lineHeight: 1.72, color: '#5C574D', marginTop: 10 }}
              >
                {p}
              </p>
            ))}

            {s.itens && (
              <ul className="flex flex-col" style={{ gap: 10, marginTop: 16 }}>
                {s.itens.map((item) => (
                  <li key={item} className="flex" style={{ gap: 12 }}>
                    <span aria-hidden style={{ color: '#8A6A4F', lineHeight: 1.72 }}>
                      ·
                    </span>
                    <span
                      className="text-pretty"
                      style={{ fontSize: 15, lineHeight: 1.72, color: '#5C574D' }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {s.tabela && <Tabela tabela={s.tabela} rotulo={s.titulo} />}
          </section>
        ))}
      </article>

      {children}
    </div>
  )
}
