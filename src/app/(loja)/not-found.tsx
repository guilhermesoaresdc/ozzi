import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Página não encontrada',
  description:
    'O endereço não existe mais na loja da Ozzi. Procure a peça pelo nome ou volte para a vitrine de pronta entrega.',
  robots: { index: false, follow: true },
}

const ATALHOS = [
  {
    href: '/novidades',
    titulo: 'Novidades',
    texto: 'O que entrou na arara essa semana, tudo em pronta entrega.',
  },
  {
    href: '/vestidos',
    titulo: 'Vestidos',
    texto: 'A procura mais antiga da casa, do linho ao midi de festa.',
  },
  {
    href: '/sob-encomenda',
    titulo: 'Sob encomenda',
    texto: 'Numeração esgotada, costurada sob medida em até 10 dias úteis.',
  },
  {
    href: '/sobre#contato',
    titulo: 'Fale com a gente',
    texto: 'WhatsApp, horário de atendimento e como combinar a retirada.',
  },
]

export default function NaoEncontrado() {
  return (
    <div className="shell" style={{ paddingTop: 56, paddingBottom: 92 }}>
      <div style={{ maxWidth: 720 }}>
        <span className="oz-eyebrow block" style={{ marginBottom: 18 }}>
          Erro 404
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
          Essa página saiu da arara
        </h1>

        <p
          className="text-pretty"
          style={{ fontSize: 15.5, lineHeight: 1.72, color: '#5C574D', marginBottom: 34 }}
        >
          O endereço pode ter mudado ou a peça deixou o site. Procure pelo nome da peça — ou volte
          pela vitrine, que continua toda em pronta entrega.
        </p>

        {/* Busca sem JavaScript: navega para /busca?q=… */}
        <form role="search" action="/busca" method="get">
          <label htmlFor="busca-404" className="oz-label block" style={{ marginBottom: 8 }}>
            Buscar no site
          </label>
          <div className="flex flex-wrap" style={{ gap: 10 }}>
            <input
              id="busca-404"
              name="q"
              type="search"
              className="oz-input"
              style={{ flex: '1 1 240px', width: 'auto' }}
              placeholder="vestido de linho, conjunto alfaiataria..."
              autoComplete="off"
              enterKeyHint="search"
            />
            <button type="submit" className="oz-btn oz-btn-primary">
              Buscar
            </button>
          </div>
        </form>
      </div>

      <nav aria-label="Atalhos da loja" style={{ marginTop: 64 }}>
        <h2 className="oz-label" style={{ marginBottom: 16 }}>
          Talvez você queira
        </h2>
        <ul
          className="grid gap-px"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))' }}
        >
          {ATALHOS.map((a) => (
            <li key={a.href}>
              <Link
                href={a.href}
                className="oz-hairline-cell block h-full hover:bg-surface-hover"
                style={{ padding: '28px 24px' }}
              >
                <span
                  className="font-display block"
                  style={{ fontSize: 22, fontWeight: 400, lineHeight: 1.2, marginBottom: 8 }}
                >
                  {a.titulo}
                </span>
                <span
                  className="text-pretty block"
                  style={{ fontSize: 13.5, lineHeight: 1.65, color: '#5C574D' }}
                >
                  {a.texto}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
