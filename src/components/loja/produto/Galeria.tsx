'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Placeholder } from '@/components/ui/Placeholder'
import { VideoOzzi } from '@/components/loja/VideoOzzi'
import { Lightbox, type ItemMidia } from '@/components/loja/Lightbox'
import { ehVideo } from '@/lib/storage'

/** As quatro tomadas do handoff §5.3, usadas enquanto não há mídia real. */
const TOMADAS = [
  { legenda: 'produto · frente · 900×1200', alt: 'frente' },
  { legenda: 'produto · costas · 900×1200', alt: 'costas' },
  { legenda: 'detalhe do tecido · 900×1200', alt: 'detalhe do tecido' },
  { legenda: 'look completo · 900×1200', alt: 'look completo' },
]

const ZOOM = 2.1

/**
 * Galeria da peça: um palco de altura limitada e uma trilha de miniaturas.
 *
 * A grade que empilhava as fotos crescia com o catálogo — três fotos já
 * empurravam o preço para fora da tela, e dez tornariam a página inútil.
 * Aqui a altura é sempre a mesma, com dez fotos ou com duas.
 *
 * Na foto, o ponteiro amplia onde está olhando; o clique abre a tela cheia.
 */
export function Galeria({
  nome,
  fotos,
  videos = [],
}: {
  nome: string
  fotos: string[]
  videos?: string[]
}) {
  const [aberta, setAberta] = useState<number | null>(null)
  const [indice, setIndice] = useState(0)
  const [ampliando, setAmpliando] = useState(false)
  const [origem, setOrigem] = useState({ x: 50, y: 50 })
  const trilhoRef = useRef<HTMLUListElement>(null)
  const [podeAmpliar, setPodeAmpliar] = useState(false)

  // Zoom no ponteiro só faz sentido onde existe ponteiro.
  useEffect(() => {
    setPodeAmpliar(window.matchMedia('(hover: hover) and (pointer: fine)').matches)
  }, [])

  // Vídeo primeiro: é o que mostra o caimento.
  const midias: ItemMidia[] = [
    ...videos.map((src, i) => ({ src, alt: `${nome} — vídeo ${i + 1}, mostrando o caimento da peça` })),
    ...fotos.map((src, i) => ({
      src,
      alt: `${nome}${TOMADAS[i] ? ` — ${TOMADAS[i].alt}` : ` — foto ${i + 1}`}`,
    })),
  ]

  const irPara = useCallback((i: number) => {
    const el = trilhoRef.current
    if (!el) return
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }, [])

  function aoRolar() {
    const el = trilhoRef.current
    if (!el) return
    const novo = Math.round(el.scrollLeft / el.clientWidth)
    if (novo !== indice) {
      setIndice(novo)
      setAmpliando(false)
    }
  }

  // Sem mídia nenhuma, as tomadas do design seguram o lugar.
  if (midias.length === 0) {
    return (
      <div className="grid grid-cols-2" style={{ gap: 10, minWidth: 0 }}>
        {TOMADAS.map((t) => (
          <Placeholder key={t.legenda} label={t.legenda} ratio="3/4" densidade="denso" sizes="30vw" />
        ))}
      </div>
    )
  }

  const total = midias.length
  const atual = midias[indice]

  return (
    <>
      <div className="flex flex-col gap-3" style={{ minWidth: 0 }}>
        {/* Palco: altura fixa, com dez fotos ou com duas */}
        <div className="relative">
          <ul
            ref={trilhoRef}
            onScroll={aoRolar}
            className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {midias.map((m, i) => (
              <li
                key={m.src}
                className="aspect-[3/4] w-full shrink-0 snap-center lg:aspect-auto lg:h-[min(74vh,780px)]"
                style={{ scrollSnapAlign: 'center', background: '#E9E3D9' }}
              >
                {ehVideo(m.src) ? (
                  <VideoOzzi
                    src={m.src}
                    poster={fotos[0] ?? null}
                    alt={m.alt}
                    autoPlay={i === 0}
                    cinema
                    fundo="#E9E3D9"
                    className="h-full w-full"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setAberta(i)}
                    onMouseEnter={() => podeAmpliar && setAmpliando(true)}
                    onMouseLeave={() => setAmpliando(false)}
                    onMouseMove={(e) => {
                      if (!podeAmpliar) return
                      const r = e.currentTarget.getBoundingClientRect()
                      setOrigem({
                        x: ((e.clientX - r.left) / r.width) * 100,
                        y: ((e.clientY - r.top) / r.height) * 100,
                      })
                    }}
                    aria-label={`Ampliar ${m.alt}`}
                    className="relative block h-full w-full cursor-zoom-in overflow-hidden"
                  >
                    <Image
                      src={m.src}
                      alt={m.alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      priority={i === 0}
                      className="object-cover"
                      style={{
                        transform: ampliando && i === indice ? `scale(${ZOOM})` : 'scale(1)',
                        transformOrigin: `${origem.x}% ${origem.y}%`,
                        transition: ampliando && i === indice ? 'transform 180ms ease-out' : 'transform 300ms ease',
                      }}
                    />
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Setas: aparecem no ponteiro, ficam fora do caminho no toque */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={() => irPara(Math.max(0, indice - 1))}
                disabled={indice === 0}
                aria-label="Mídia anterior"
                className="absolute top-1/2 left-3 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center transition-opacity disabled:cursor-default disabled:opacity-0 lg:flex"
                style={{ background: 'rgba(242,238,231,.92)', color: '#232320', fontSize: 15 }}
              >
                <span aria-hidden>←</span>
              </button>
              <button
                type="button"
                onClick={() => irPara(Math.min(total - 1, indice + 1))}
                disabled={indice === total - 1}
                aria-label="Próxima mídia"
                className="absolute top-1/2 right-3 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center transition-opacity disabled:cursor-default disabled:opacity-0 lg:flex"
                style={{ background: 'rgba(242,238,231,.92)', color: '#232320', fontSize: 15 }}
              >
                <span aria-hidden>→</span>
              </button>
            </>
          )}

          {/* Convite ao zoom, discreto e só onde ele existe */}
          {podeAmpliar && atual && !ehVideo(atual.src) && !ampliando && (
            <span
              className="pointer-events-none absolute uppercase"
              style={{
                bottom: 13,
                right: 13,
                background: 'rgba(242,238,231,.92)',
                color: '#232320',
                fontSize: 9,
                letterSpacing: '.16em',
                padding: '6px 9px',
              }}
            >
              Passe para ampliar · clique para tela cheia
            </span>
          )}
        </div>

        {/* Trilha de miniaturas — some quando há uma peça só */}
        {total > 1 && (
          <div className="flex items-center gap-3">
            <span className="oz-label tabular-nums shrink-0 lg:hidden">
              {String(indice + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>

            <ul className="flex flex-1 gap-[6px] overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {midias.map((m, i) => (
                <li key={m.src} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => irPara(i)}
                    aria-label={`Ver ${m.alt}`}
                    aria-current={i === indice ? 'true' : undefined}
                    className="block cursor-pointer overflow-hidden transition-opacity duration-200"
                    style={{
                      width: 56,
                      height: 74,
                      opacity: i === indice ? 1 : 0.45,
                      outline: i === indice ? '1px solid #232320' : '1px solid #DFD8CB',
                      outlineOffset: -1,
                      background: '#E9E3D9',
                    }}
                  >
                    {ehVideo(m.src) ? (
                      <video src={m.src} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                    ) : (
                      <Image src={m.src} alt="" width={112} height={148} className="h-full w-full object-cover" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {aberta !== null && <Lightbox itens={midias} indiceInicial={aberta} aoFechar={() => setAberta(null)} />}
    </>
  )
}
