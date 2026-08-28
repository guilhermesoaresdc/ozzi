/**
 * Estados de carregamento (handoff §7): mesma paleta do resto — fundo #FAF7F2,
 * fio #DFD8CB. Sem raio, sem sombra decorativa.
 */

function Bloco({ altura, largura = '100%' }: { altura: number | string; largura?: number | string }) {
  return (
    <div style={{ height: altura, width: largura, background: '#FAF7F2', boxShadow: '0 0 0 1px #DFD8CB' }} />
  )
}

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Carregando…</span>
      <div className="animate-pulse" aria-hidden="true">
        {children}
      </div>
    </div>
  )
}

function CardProdutoSkeleton() {
  return (
    <div className="flex flex-col">
      <div style={{ aspectRatio: '3/4', background: '#FAF7F2', boxShadow: '0 0 0 1px #DFD8CB' }} />
      <div className="flex flex-col gap-[9px]" style={{ padding: '13px 2px 0' }}>
        <Bloco altura={11} largura="62%" />
        <Bloco altura={9} largura="44%" />
        <Bloco altura={14} largura="34%" />
      </div>
    </div>
  )
}

export function GradeProdutosSkeleton({
  quantidade = 4,
  minimo = 230,
  espacamento = '22px 16px',
}: {
  quantidade?: number
  minimo?: number
  espacamento?: string
}) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${minimo}px), 1fr))`,
        gap: espacamento,
      }}
    >
      {Array.from({ length: quantidade }, (_, i) => (
        <CardProdutoSkeleton key={i} />
      ))}
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <Aviso>
      <section className="shell">
        <div
          className="grid border-b border-line"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 330px), 1fr))' }}
        >
          <div
            className="flex flex-col justify-center gap-5"
            style={{
              padding: 'clamp(48px,7vw,92px) clamp(0px,4vw,64px) clamp(48px,7vw,92px) 0',
              minHeight: 520,
            }}
          >
            <Bloco altura={10} largura={190} />
            <div className="flex flex-col gap-3">
              <Bloco altura={46} largura="76%" />
              <Bloco altura={46} largura="60%" />
              <Bloco altura={46} largura="70%" />
            </div>
            <Bloco altura={40} largura={380} />
            <div className="flex flex-wrap gap-3">
              <Bloco altura={45} largura={215} />
              <Bloco altura={45} largura={175} />
            </div>
          </div>
          <div style={{ minHeight: 460, background: '#FAF7F2', boxShadow: '0 0 0 1px #DFD8CB' }} />
        </div>
      </section>
    </Aviso>
  )
}

export function CategoriasSkeleton() {
  return (
    <Aviso>
      <section className="shell" style={{ paddingTop: 60 }}>
        <div style={{ marginBottom: 26 }}>
          <Bloco altura={34} largura={180} />
        </div>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 210px), 1fr))' }}
        >
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex flex-col">
              <div style={{ aspectRatio: '3/4', background: '#FAF7F2', boxShadow: '0 0 0 1px #DFD8CB' }} />
              <div className="flex items-center justify-between gap-3" style={{ padding: '12px 2px 0' }}>
                <Bloco altura={14} largura="55%" />
                <Bloco altura={9} largura={22} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </Aviso>
  )
}

export function FavoritosSkeleton() {
  return (
    <Aviso>
      <section className="shell" style={{ paddingTop: 76 }}>
        <div className="flex flex-col gap-[10px]" style={{ marginBottom: 26 }}>
          <Bloco altura={10} largura={110} />
          <Bloco altura={34} largura={250} />
        </div>
        <GradeProdutosSkeleton />
      </section>
    </Aviso>
  )
}

export function FaixaSkeleton() {
  return (
    <Aviso>
      <section className="shell" style={{ marginTop: 76 }}>
        <div
          className="grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            background: '#232320',
          }}
        >
          <div
            className="flex flex-col gap-5"
            style={{ padding: 'clamp(40px,5vw,64px) clamp(28px,4vw,56px)' }}
          >
            <div style={{ height: 10, width: 150, background: '#3A3730' }} />
            <div style={{ height: 34, width: '80%', background: '#3A3730' }} />
            <div style={{ height: 34, width: '62%', background: '#3A3730' }} />
            <div style={{ height: 46, width: '100%', maxWidth: 420, background: '#2C2A25' }} />
            <div style={{ height: 45, width: 180, background: '#3A3730' }} />
          </div>
          <div
            style={{
              minHeight: 320,
              background: 'repeating-linear-gradient(135deg, #2C2A25 0 9px, #232120 9px 18px)',
            }}
          />
        </div>
      </section>
    </Aviso>
  )
}
