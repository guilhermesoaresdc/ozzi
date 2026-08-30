'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ehVideo } from '@/lib/storage'

export interface ItemMidia {
  src: string
  alt: string
}

/**
 * Galeria em tela cheia. O desenho é de vitrine de joalheria: fundo profundo,
 * muito ar em volta da peça e nenhum controle competindo com a imagem — a
 * navegação só ganha presença quando o ponteiro se aproxima.
 *
 * Foto amplia com um clique e acompanha o ponteiro. Vídeo toca sozinho e mudo,
 * com o mesmo controle discreto do resto da loja.
 */
export function Lightbox({
  itens,
  indiceInicial,
  aoFechar,
}: {
  itens: ItemMidia[]
  indiceInicial: number
  aoFechar: () => void
}) {
  const [indice, setIndice] = useState(indiceInicial)
  const [ampliada, setAmpliada] = useState(false)
  const [origem, setOrigem] = useState({ x: 50, y: 50 })
  const [entrou, setEntrou] = useState(false)
  const dialogoRef = useRef<HTMLDivElement>(null)
  const focoAnterior = useRef<HTMLElement | null>(null)

  const atual = itens[indice]
  const total = itens.length

  const ir = useCallback(
    (passo: number) => {
      setAmpliada(false)
      setIndice((i) => (i + passo + total) % total)
    },
    [total],
  )

  // Trava a rolagem do fundo e devolve o foco de onde veio
  useEffect(() => {
    focoAnterior.current = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogoRef.current?.focus()
    const t = requestAnimationFrame(() => setEntrou(true))
    return () => {
      document.body.style.overflow = overflow
      cancelAnimationFrame(t)
      focoAnterior.current?.focus?.()
    }
  }, [])

  useEffect(() => {
    function tecla(e: KeyboardEvent) {
      if (e.key === 'Escape') aoFechar()
      else if (e.key === 'ArrowRight') ir(1)
      else if (e.key === 'ArrowLeft') ir(-1)
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [aoFechar, ir])

  if (!atual) return null
  const video = ehVideo(atual.src)

  return (
    <div
      ref={dialogoRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Galeria — ${atual.alt}`}
      tabIndex={-1}
      className="fixed inset-0 z-[200] flex flex-col outline-none"
      style={{
        background: 'rgba(20,20,18,.975)',
        backdropFilter: 'blur(6px)',
        opacity: entrou ? 1 : 0,
        transition: 'opacity 260ms ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) aoFechar()
      }}
    >
      {/* Cabeçalho: contador à esquerda, fechar à direita, nada mais */}
      <header className="flex shrink-0 items-center justify-between px-6 py-5 sm:px-10">
        <span
          className="uppercase tabular-nums"
          style={{ fontSize: 10.5, letterSpacing: '.24em', color: '#8F8A7E' }}
        >
          {String(indice + 1).padStart(2, '0')}
          <span style={{ opacity: 0.4 }}> / </span>
          {String(total).padStart(2, '0')}
        </span>

        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar galeria"
          className="cursor-pointer uppercase transition-colors"
          style={{ fontSize: 10.5, letterSpacing: '.24em', color: '#B3ADA0' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#F2EEE7')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#B3ADA0')}
        >
          Fechar
        </button>
      </header>

      {/* Palco */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-16">
        {total > 1 && (
          <button
            type="button"
            onClick={() => ir(-1)}
            aria-label="Peça anterior"
            className="group absolute left-2 z-10 flex h-16 w-10 cursor-pointer items-center justify-center sm:left-5"
          >
            <span
              className="transition-all duration-200"
              style={{ fontSize: 22, color: '#8F8A7E', lineHeight: 1 }}
              aria-hidden
            >
              ←
            </span>
          </button>
        )}

        <figure
          className="flex h-full max-h-full min-h-0 w-full items-center justify-center"
          style={{
            transform: entrou ? 'scale(1)' : 'scale(.985)',
            transition: 'transform 320ms cubic-bezier(.2,.8,.2,1)',
          }}
        >
          {video ? (
            <video
              key={atual.src}
              src={atual.src}
              autoPlay
              muted
              loop
              playsInline
              controls
              aria-label={atual.alt}
              className="max-h-full max-w-full object-contain"
              style={{ maxHeight: '100%' }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setAmpliada((v) => !v)}
              onMouseMove={(e) => {
                if (!ampliada) return
                const r = e.currentTarget.getBoundingClientRect()
                setOrigem({
                  x: ((e.clientX - r.left) / r.width) * 100,
                  y: ((e.clientY - r.top) / r.height) * 100,
                })
              }}
              aria-label={ampliada ? 'Reduzir a imagem' : 'Ampliar a imagem'}
              className="relative flex h-full max-h-full w-full items-center justify-center overflow-hidden"
              style={{ cursor: ampliada ? 'zoom-out' : 'zoom-in' }}
            >
              <Image
                key={atual.src}
                src={atual.src}
                alt={atual.alt}
                width={1400}
                height={1860}
                unoptimized={atual.src.startsWith('blob:') || atual.src.includes('/storage/v1/object/sign/')}
                priority
                className="max-h-full w-auto object-contain"
                style={{
                  transform: ampliada ? 'scale(2)' : 'scale(1)',
                  transformOrigin: `${origem.x}% ${origem.y}%`,
                  transition: ampliada ? 'transform 260ms ease' : 'transform 320ms ease',
                  maxHeight: '100%',
                }}
              />
            </button>
          )}
        </figure>

        {total > 1 && (
          <button
            type="button"
            onClick={() => ir(1)}
            aria-label="Próxima peça"
            className="group absolute right-2 z-10 flex h-16 w-10 cursor-pointer items-center justify-center sm:right-5"
          >
            <span
              className="transition-all duration-200"
              style={{ fontSize: 22, color: '#8F8A7E', lineHeight: 1 }}
              aria-hidden
            >
              →
            </span>
          </button>
        )}
      </div>

      {/* Rodapé: legenda discreta e a tira de miniaturas */}
      <footer className="flex shrink-0 flex-col items-center gap-4 px-6 pt-4 pb-6 sm:px-10 sm:pb-8">
        <p className="max-w-[520px] text-center" style={{ fontSize: 11.5, color: '#8F8A7E', lineHeight: 1.6 }}>
          {atual.alt}
          {!video && (
            <span style={{ opacity: 0.7 }}>{ampliada ? ' · clique para reduzir' : ' · clique para ampliar'}</span>
          )}
        </p>

        {total > 1 && (
          <ul className="flex flex-wrap justify-center gap-[6px]">
            {itens.map((item, i) => (
              <li key={item.src}>
                <button
                  type="button"
                  onClick={() => {
                    setAmpliada(false)
                    setIndice(i)
                  }}
                  aria-label={`Ver ${item.alt}`}
                  aria-current={i === indice ? 'true' : undefined}
                  className="block cursor-pointer overflow-hidden transition-opacity duration-200"
                  style={{
                    width: 44,
                    height: 58,
                    opacity: i === indice ? 1 : 0.38,
                    outline: i === indice ? '1px solid #C4A88B' : '1px solid transparent',
                    outlineOffset: 2,
                    background: '#2C2A25',
                  }}
                >
                  {ehVideo(item.src) ? (
                    <video src={item.src} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                  ) : (
                    <Image
                      src={item.src}
                      alt=""
                      width={88}
                      height={116}
                      className="h-full w-full object-cover"
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </footer>
    </div>
  )
}
