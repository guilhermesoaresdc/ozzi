import Link from 'next/link'

/**
 * Estados que faltavam no protótipo (handoff §7), na linguagem da casa:
 * fundo #FAF7F2, fio #DFD8CB, apoio #8A8375, erro #A0533F.
 */

function Barra({ largura, altura = 12 }: { largura: number | string; altura?: number }) {
  return (
    <span
      aria-hidden
      className="block"
      style={{ width: largura, height: altura, maxWidth: '100%', background: '#E9E3D9' }}
    />
  )
}

export function EsqueletoCheckout() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Carregando a sua sacola…</span>
      <div className="grid animate-pulse lg:grid-cols-3" style={{ gap: 44 }} aria-hidden>
        <div className="min-w-0 lg:col-span-2">
          <Barra largura={200} altura={22} />
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
            style={{ gap: 14, marginTop: 22 }}
          >
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="flex flex-col" style={{ gap: 7 }}>
                <Barra largura="46%" altura={9} />
                <span className="block" style={{ height: 45, border: '1px solid #DFD8CB', background: '#FAF7F2' }} />
              </div>
            ))}
          </div>
          <div className="flex flex-col" style={{ gap: 10, marginTop: 34 }}>
            {Array.from({ length: 4 }, (_, i) => (
              <span key={i} className="block" style={{ height: 62, border: '1px solid #DFD8CB' }} />
            ))}
          </div>
        </div>
        <div style={{ background: '#FAF7F2', border: '1px solid #DFD8CB', padding: '28px 26px' }}>
          <Barra largura={160} altura={20} />
          <div className="flex flex-col" style={{ gap: 14, marginTop: 20 }}>
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex items-center" style={{ gap: 14 }}>
                <span className="block shrink-0" style={{ width: 52, aspectRatio: '3/4', background: '#E9E3D9' }} />
                <Barra largura="60%" altura={11} />
              </div>
            ))}
          </div>
          <span className="block" style={{ height: 52, background: '#E9E3D9', marginTop: 24 }} />
        </div>
      </div>
    </div>
  )
}

/** Entre a resposta da RPC e a tela de confirmação — a sacola já foi limpa. */
export function ConfirmandoPedido() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="oz-card flex flex-col items-center text-center"
      style={{ padding: '56px 28px', gap: 12 }}
    >
      <span className="oz-label">Um instante</span>
      <h2 className="font-display" style={{ fontSize: 26, fontWeight: 300, lineHeight: 1.15 }}>
        Confirmando seu pedido
      </h2>
      <p className="text-body" style={{ fontSize: 13.5, lineHeight: 1.7, maxWidth: 430, textWrap: 'pretty' }}>
        Registramos as peças no estoque e já levamos você para a confirmação.
      </p>
    </div>
  )
}

export function SacolaVazia() {
  return (
    <div className="oz-card flex flex-col items-center text-center" style={{ padding: '56px 28px', gap: 12 }}>
      <span className="oz-label">Sacola vazia</span>
      <h2 className="font-display" style={{ fontSize: 26, fontWeight: 300, lineHeight: 1.15, textWrap: 'balance' }}>
        Não há nada para fechar ainda
      </h2>
      <p className="text-body" style={{ fontSize: 13.5, lineHeight: 1.7, maxWidth: 430, textWrap: 'pretty' }}>
        Sua sacola está vazia — vamos te levar de volta para ela. Escolha as peças e o checkout
        continua de onde parou.
      </p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Link href="/sacola" className="oz-btn oz-btn-outline">
          Ir para a sacola
        </Link>
        <Link href="/novidades" className="oz-btn oz-btn-tertiary">
          Ver novidades
        </Link>
      </div>
    </div>
  )
}

/** Erro geral do checkout: a mensagem do banco já chega em pt-BR. */
export function AvisoErro({
  mensagem,
  mostrarAjusteDaSacola,
}: {
  mensagem: string
  mostrarAjusteDaSacola: boolean
}) {
  return (
    <div
      role="alert"
      tabIndex={-1}
      id="erro-checkout"
      style={{ background: '#FAF7F2', border: '1px solid #A0533F', padding: '18px 20px', marginBottom: 26 }}
    >
      <p className="oz-label" style={{ color: '#A0533F', marginBottom: 7 }}>
        Não deu para fechar o pedido
      </p>
      <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#5C574D' }}>{mensagem}</p>
      {mostrarAjusteDaSacola && (
        <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#5C574D', marginTop: 6 }}>
          O estoque mudou enquanto você preenchia.{' '}
          <Link href="/sacola" style={{ borderBottom: '1px solid #C9C0B1' }}>
            Ajuste a sacola
          </Link>{' '}
          e tente de novo.
        </p>
      )}
    </div>
  )
}
