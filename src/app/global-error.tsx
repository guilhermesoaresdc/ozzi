'use client'

/** Última rede de proteção: pega erro no próprio layout raiz, sem depender dele. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: 24,
          padding: '0 28px',
          background: '#F2EEE7',
          color: '#232320',
          fontFamily: 'Jost, Helvetica, Arial, sans-serif',
        }}
      >
        <span style={{ fontSize: 10.5, letterSpacing: '.26em', textTransform: 'uppercase', color: '#8A6A4F' }}>
          Ozzi
        </span>
        <h1 style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: 46, fontWeight: 300, lineHeight: 1.05 }}>
          A loja saiu do ar por um instante
        </h1>
        <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.72, color: '#5C574D', maxWidth: 460 }}>
          Já estamos sabendo. Recarregue a página em alguns segundos.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            background: '#232320',
            color: '#F2EEE7',
            border: 'none',
            padding: '16px 32px',
            fontSize: 11.5,
            letterSpacing: '.16em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Recarregar
        </button>
        {error.digest && (
          <p style={{ margin: 0, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 11, color: '#9A9385' }}>
            referência {error.digest}
          </p>
        )}
      </body>
    </html>
  )
}
