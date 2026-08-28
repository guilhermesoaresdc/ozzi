'use client'

import { useEffect, useState } from 'react'

/**
 * No desktop os avisos aparecem lado a lado, separados por "/".
 * No mobile isso ocupava três linhas e empurrava a vitrine para baixo, então
 * mostramos um aviso por vez, alternando sozinho. O DOM é o mesmo nos dois
 * casos — só muda o que fica visível — para não duplicar texto no leitor de tela.
 */
export function FaixaAvisos({ avisos }: { avisos: { id: string; texto: string }[] }) {
  const [atual, setAtual] = useState(0)

  useEffect(() => {
    if (avisos.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = window.setInterval(() => {
      setAtual((v) => (v + 1) % avisos.length)
    }, 4500)
    return () => window.clearInterval(id)
  }, [avisos.length])

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-x-[30px] gap-y-2 px-5 py-[9px] text-center sm:px-6 sm:py-[10px]"
      style={{ background: '#232320', color: '#F2EEE7' }}
    >
      {avisos.map((a, i) => (
        <span key={a.id} className="contents">
          {i > 0 && (
            <span aria-hidden className="hidden sm:inline" style={{ opacity: 0.3 }}>
              /
            </span>
          )}
          <span
            className={`uppercase ${i === atual ? 'inline' : 'hidden sm:inline'}`}
            style={{
              fontSize: 10.5,
              letterSpacing: '.14em',
              lineHeight: 1.4,
              transition: 'opacity 300ms ease',
            }}
          >
            {a.texto}
          </span>
        </span>
      ))}
    </div>
  )
}
