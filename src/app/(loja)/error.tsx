'use client'

import Link from 'next/link'
import { useEffect } from 'react'

/**
 * Fronteira de erro da loja. Aparece quando uma consulta ao banco falha —
 * situação em que devolver 404 seria pior, porque o Google trata 404 como
 * sinal permanente e tira a página do índice.
 */
export default function ErroDaLoja({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Erro na loja:', error)
  }, [error])

  return (
    <div className="shell flex flex-1 flex-col items-start justify-center py-24">
      <span className="oz-eyebrow">Algo saiu do lugar</span>
      <h1
        className="font-display mt-5"
        style={{ fontSize: 'clamp(34px, 4vw, 46px)', fontWeight: 300, lineHeight: 1.05 }}
      >
        Não conseguimos carregar esta página
      </h1>
      <p className="mt-4 max-w-[480px]" style={{ fontSize: 15.5, lineHeight: 1.72, color: '#5C574D' }}>
        Foi uma falha nossa, não sua — as peças continuam no lugar. Tente de novo em
        instantes, ou fale com a gente no WhatsApp que a venda sai do mesmo jeito.
      </p>

      <div className="mt-9 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="oz-btn oz-btn-primary">
          Tentar novamente
        </button>
        <Link href="/" className="oz-btn oz-btn-outline">
          Voltar para o início
        </Link>
      </div>

      {error.digest && (
        <p className="mt-8" style={{ fontSize: 11.5, color: '#8A8375' }}>
          Código do erro: {error.digest}
        </p>
      )}
    </div>
  )
}
