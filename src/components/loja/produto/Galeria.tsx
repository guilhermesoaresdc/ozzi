'use client'

import { useRef, useState } from 'react'
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

/** No desktop a grade do handoff mostra 4; o resto entra pela galeria. */
const NA_GRADE = 4

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
  const [slide, setSlide] = useState(0)
  const trilhoRef = useRef<HTMLUListElement>(null)

  // Vídeo primeiro: é o que mostra o caimento.
  const midias: ItemMidia[] = [
    ...videos.map((src, i) => ({ src, alt: `${nome} — vídeo ${i + 1}, mostrando o caimento da peça` })),
    ...fotos.map((src, i) => ({
      src,
      alt: `${nome}${TOMADAS[i] ? ` — ${TOMADAS[i].alt}` : ` — foto ${i + 1}`}`,
    })),
  ]

  // Sem mídia nenhuma, as tomadas de exemplo do design seguram o lugar.
  const exemplos = midias.length === 0

  function aoRolar() {
    const el = trilhoRef.current
    if (!el) return
    setSlide(Math.round(el.scrollLeft / el.clientWidth))
  }

  function irPara(i: number) {
    const el = trilhoRef.current
    if (!el) return
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  if (exemplos) {
    return (
      <div className="grid grid-cols-2" style={{ gap: 10, minWidth: 0 }}>
        {TOMADAS.map((t) => (
          <Placeholder key={t.legenda} label={t.legenda} ratio="3/4" densidade="denso" sizes="(max-width: 900px) 50vw, 30vw" />
        ))}
      </div>
    )
  }

  const naGrade = midias.slice(0, NA_GRADE)
  const sobrando = midias.length - naGrade.length

  return (
    <>
      {/* MOBILE — uma peça por vez, arrastando de lado.
          Empilhar dez fotos empurraria preço e numeração para fora da tela. */}
      <div className="lg:hidden">
        <ul
          ref={trilhoRef}
          onScroll={aoRolar}
          className="flex snap-x snap-mandatory overflow-x-auto"
          style={{ gap: 8, scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {midias.map((m, i) => (
            <li key={m.src} className="w-full shrink-0 snap-center" style={{ scrollSnapAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setAberta(i)}
                aria-label={`Ampliar ${m.alt}`}
                className="block w-full cursor-zoom-in text-left"
              >
                {ehVideo(m.src) ? (
                  <VideoOzzi src={m.src} poster={fotos[0] ?? null} alt={m.alt} ratio="3/4" autoPlay={i === 0} />
                ) : (
                  <Placeholder src={m.src} alt={m.alt} ratio="3/4" sizes="100vw" priority={i === 0} />
                )}
              </button>
            </li>
          ))}
        </ul>

        {midias.length > 1 && (
          <div className="mt-3 flex items-center justify-between gap-4">
            <span className="oz-label tabular-nums">
              {String(slide + 1).padStart(2, '0')} / {String(midias.length).padStart(2, '0')}
            </span>
            <ul className="flex flex-1 justify-end gap-[5px]">
              {midias.map((m, i) => (
                <li key={m.src}>
                  <button
                    type="button"
                    onClick={() => irPara(i)}
                    aria-label={`Ver ${m.alt}`}
                    aria-current={i === slide ? 'true' : undefined}
                    className="block h-[2px] cursor-pointer"
                    style={{ width: 22, background: i === slide ? '#232320' : '#C9C0B1' }}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* DESKTOP — a grade 2×2 do handoff. O que passar de quatro entra pela
          galeria em tela cheia, em vez de esticar a coluna para baixo. */}
      <div className="hidden grid-cols-2 lg:grid" style={{ gap: 10, minWidth: 0 }}>
        {naGrade.map((m, i) => {
          const ultimo = i === NA_GRADE - 1 && sobrando > 0
          return (
            <button
              key={m.src}
              type="button"
              onClick={() => setAberta(i)}
              aria-label={ultimo ? `Ver todas as ${midias.length} mídias de ${nome}` : `Ampliar ${m.alt}`}
              className="relative block w-full cursor-zoom-in text-left transition-[filter] hover:brightness-[.97]"
            >
              {ehVideo(m.src) ? (
                <VideoOzzi src={m.src} poster={fotos[0] ?? null} alt={m.alt} ratio="3/4" />
              ) : (
                <Placeholder src={m.src} alt={m.alt} ratio="3/4" densidade="denso" sizes="30vw" priority={i === 0} />
              )}

              {ultimo && (
                <span
                  className="absolute inset-0 flex flex-col items-center justify-center gap-1 uppercase"
                  style={{ background: 'rgba(35,35,32,.62)', color: '#F2EEE7' }}
                >
                  <span className="font-display" style={{ fontSize: 30, fontWeight: 300, letterSpacing: 0 }}>
                    +{sobrando}
                  </span>
                  <span style={{ fontSize: 10, letterSpacing: '.2em' }}>ver todas</span>
                </span>
              )}
            </button>
          )
        })}
      </div>

      {aberta !== null && <Lightbox itens={midias} indiceInicial={aberta} aoFechar={() => setAberta(null)} />}
    </>
  )
}
