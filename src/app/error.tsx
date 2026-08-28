'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="shell flex flex-1 flex-col items-start justify-center gap-6 py-24">
      <span className="oz-eyebrow">Algo saiu do lugar</span>
      <h1 className="font-display" style={{ fontSize: 46, fontWeight: 300, lineHeight: 1.05, maxWidth: 620 }}>
        Não conseguimos carregar esta página
      </h1>
      <p style={{ fontSize: 15.5, lineHeight: 1.72, color: '#5C574D', maxWidth: 460 }}>
        Foi um problema nosso, não seu. Tente de novo em um instante — se continuar, a gente resolve pelo
        WhatsApp na hora.
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="oz-btn oz-btn-primary">
          Tentar de novo
        </button>
        <Link href="/" className="oz-btn oz-btn-outline">
          Voltar para a loja
        </Link>
      </div>
      {error.digest && (
        <p className="font-mono" style={{ fontSize: 11, color: '#9A9385' }}>
          referência {error.digest}
        </p>
      )}
    </div>
  )
}
