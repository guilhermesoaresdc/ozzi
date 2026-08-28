import Link from 'next/link'

/**
 * Estados que faltavam no protótipo (handoff §7): a sacola carregando do
 * localStorage e a sacola vazia. Mesma linguagem: fundo #FAF7F2, fio #DFD8CB,
 * apoio #8A8375. Sem raio, sem sombra decorativa.
 */

function Bloco({ altura, largura = '100%' }: { altura: number | string; largura?: number | string }) {
  return (
    <div
      style={{ height: altura, width: largura, background: '#FAF7F2', boxShadow: '0 0 0 1px #DFD8CB' }}
    />
  )
}

export function EsqueletoSacola({ quantidade = 3 }: { quantidade?: number }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Carregando sua sacola…</span>
      <div
        className="grid animate-pulse items-start"
        aria-hidden="true"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: 44,
        }}
      >
        <div style={{ gridColumn: 'span 2', minWidth: 0, borderTop: '1px solid #DFD8CB' }}>
          {Array.from({ length: quantidade }, (_, i) => (
            <div
              key={i}
              className="flex flex-wrap"
              style={{ gap: 20, padding: '22px 0', borderBottom: '1px solid #DFD8CB' }}
            >
              <div
                className="w-[108px] shrink-0"
                style={{ aspectRatio: '3/4', background: '#FAF7F2', boxShadow: '0 0 0 1px #DFD8CB' }}
              />
              <div className="flex flex-col" style={{ flex: '1 1 200px', gap: 10, paddingTop: 4 }}>
                <Bloco altura={13} largura="58%" />
                <Bloco altura={10} largura="30%" />
                <Bloco altura={10} largura="38%" />
              </div>
              <div className="flex flex-col items-end" style={{ gap: 12 }}>
                <Bloco altura={18} largura={78} />
                <Bloco altura={33} largura={96} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#FAF7F2', border: '1px solid #DFD8CB', padding: '28px 26px' }}>
          <div style={{ marginBottom: 22 }}>
            <Bloco altura={20} largura={104} />
          </div>
          <div className="flex flex-col" style={{ gap: 13, paddingBottom: 18, borderBottom: '1px solid #DFD8CB' }}>
            <Bloco altura={11} />
            <Bloco altura={11} largura="86%" />
            <Bloco altura={11} largura="72%" />
          </div>
          <div style={{ padding: '18px 0 22px' }}>
            <Bloco altura={26} largura="64%" />
          </div>
          <div className="flex flex-col" style={{ gap: 8, marginBottom: 20 }}>
            <Bloco altura={46} />
            <Bloco altura={46} />
            <Bloco altura={46} />
          </div>
          <Bloco altura={52} />
        </div>
      </div>
    </div>
  )
}

export function SacolaVazia() {
  return (
    <div
      className="oz-card flex flex-col items-center text-center"
      style={{ padding: '56px 28px', gap: 12 }}
    >
      <span className="oz-label">Sacola vazia</span>
      <h2
        className="font-display"
        style={{ fontSize: 26, fontWeight: 300, lineHeight: 1.15, textWrap: 'balance' }}
      >
        Você ainda não separou nenhuma peça
      </h2>
      <p
        className="text-body"
        style={{ fontSize: 13.5, lineHeight: 1.7, maxWidth: 430, textWrap: 'pretty' }}
      >
        O que você guardar aqui fica salvo neste aparelho até a hora de fechar o pedido.
      </p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Link href="/novidades" className="oz-btn oz-btn-primary">
          Ver novidades
        </Link>
        <Link href="/vestidos" className="oz-btn oz-btn-tertiary">
          Ver vestidos
        </Link>
      </div>
    </div>
  )
}
