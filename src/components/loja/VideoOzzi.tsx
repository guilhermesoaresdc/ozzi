'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/* Ícones de traço fino, no peso da marca (handoff §9). */
const Play = () => (
  <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden>
    <path d="M4 2.5v11l9-5.5-9-5.5Z" />
  </svg>
)
const Pause = () => (
  <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden>
    <rect x="4" y="2.5" width="2.6" height="11" />
    <rect x="9.4" y="2.5" width="2.6" height="11" />
  </svg>
)
const Som = () => (
  <svg viewBox="0 0 18 18" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden>
    <path d="M3 6.8h2.6L9.4 3.6v10.8L5.6 11.2H3V6.8Z" strokeLinejoin="round" />
    <path d="M12 6.4a3.4 3.4 0 0 1 0 5.2M14 4.4a6.2 6.2 0 0 1 0 9.2" strokeLinecap="round" />
  </svg>
)
const Mudo = () => (
  <svg viewBox="0 0 18 18" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden>
    <path d="M3 6.8h2.6L9.4 3.6v10.8L5.6 11.2H3V6.8Z" strokeLinejoin="round" />
    <path d="m12.2 6.8 3.6 4.4M15.8 6.8l-3.6 4.4" strokeLinecap="round" />
  </svg>
)
const Expandir = () => (
  <svg viewBox="0 0 18 18" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden>
    <path d="M6.6 2.8H2.8v3.8M11.4 2.8h3.8v3.8M15.2 11.4v3.8h-3.8M2.8 11.4v3.8h3.8" strokeLinecap="round" />
  </svg>
)

function relogio(s: number): string {
  if (!Number.isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

/**
 * Reprodutor da loja.
 *
 * O controle nativo é pesado e cada navegador desenha o seu — numa vitrine de
 * moda ele rouba a peça. Aqui a barra é fina, some sozinha durante a reprodução
 * e volta ao menor movimento do ponteiro.
 *
 * Começa mudo porque navegador nenhum permite som automático: com som, o vídeo
 * simplesmente não tocaria.
 */
export function VideoOzzi({
  src,
  poster,
  alt,
  ratio = '3/4',
  className = '',
  autoPlay = true,
  cinema = false,
  fundo = '#1A1A18',
}: {
  src: string
  poster?: string | null
  alt: string
  ratio?: string
  className?: string
  autoPlay?: boolean
  /** Modo galeria: ocupa a altura disponível em vez de seguir a proporção. */
  cinema?: boolean
  /** Fundo atrás do vídeo. Escuro na tela cheia, linho no palco do produto. */
  fundo?: string
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const ociosoRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [tocando, setTocando] = useState(false)
  const [mudo, setMudo] = useState(true)
  const [tempo, setTempo] = useState(0)
  const [duracao, setDuracao] = useState(0)
  const [visivel, setVisivel] = useState(true)
  const [pronto, setPronto] = useState(false)

  const progresso = duracao > 0 ? (tempo / duracao) * 100 : 0

  const acordar = useCallback(() => {
    setVisivel(true)
    if (ociosoRef.current) clearTimeout(ociosoRef.current)
    ociosoRef.current = setTimeout(() => setVisivel(false), 2200)
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v || !autoPlay) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    v.play()
      .then(() => setTocando(true))
      .catch(() => setTocando(false))
  }, [autoPlay, src])

  useEffect(() => () => { if (ociosoRef.current) clearTimeout(ociosoRef.current) }, [])

  function alternar() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) void v.play().then(() => setTocando(true))
    else {
      v.pause()
      setTocando(false)
      setVisivel(true)
    }
  }

  function buscar(e: React.MouseEvent<HTMLDivElement>) {
    const v = videoRef.current
    if (!v || !v.duration) return
    const r = e.currentTarget.getBoundingClientRect()
    v.currentTime = ((e.clientX - r.left) / r.width) * v.duration
  }

  async function telaCheia() {
    const el = wrapRef.current
    if (!el) return
    if (document.fullscreenElement) await document.exitFullscreen()
    else await el.requestFullscreen?.().catch(() => undefined)
  }

  const botao: React.CSSProperties = {
    color: '#F2EEE7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    lineHeight: 1,
  }

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        aspectRatio: cinema ? undefined : ratio,
        height: cinema ? '100%' : undefined,
        background: fundo,
      }}
      onMouseMove={acordar}
      onMouseEnter={acordar}
      onMouseLeave={() => tocando && setVisivel(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster ?? undefined}
        muted={mudo}
        loop
        playsInline
        preload="metadata"
        aria-label={alt}
        onClick={alternar}
        onLoadedMetadata={(e) => {
          setDuracao(e.currentTarget.duration)
          setPronto(true)
        }}
        onTimeUpdate={(e) => setTempo(e.currentTarget.currentTime)}
        onPlay={() => setTocando(true)}
        onPause={() => setTocando(false)}
        className={`h-full w-full ${cinema ? 'object-contain' : 'object-cover'}`}
        style={{ cursor: 'pointer', display: 'block' }}
      />

      {/* Play grande, só quando está parado: convite discreto, sem poluir */}
      {pronto && !tocando && (
        <button
          type="button"
          onClick={alternar}
          aria-label="Reproduzir vídeo"
          className="absolute inset-0 flex cursor-pointer items-center justify-center"
        >
          <span
            className="flex items-center justify-center"
            style={{
              width: 56,
              height: 56,
              background: 'rgba(242,238,231,.92)',
              color: '#232320',
              paddingLeft: 3,
            }}
          >
            <svg viewBox="0 0 16 16" width="17" height="17" fill="currentColor" aria-hidden>
              <path d="M4 2.5v11l9-5.5-9-5.5Z" />
            </svg>
          </span>
        </button>
      )}

      {/* Barra de controle: fina, some sozinha durante a reprodução */}
      <div
        className="absolute inset-x-0 bottom-0 transition-opacity duration-300"
        style={{
          opacity: visivel || !tocando ? 1 : 0,
          pointerEvents: visivel || !tocando ? 'auto' : 'none',
          background: 'linear-gradient(to top, rgba(20,20,18,.78) 0%, rgba(20,20,18,.35) 55%, transparent 100%)',
          paddingTop: 34,
        }}
      >
        {/* Trilha de progresso: alvo de clique alto, fio fino */}
        <div
          role="slider"
          tabIndex={0}
          aria-label="Posição do vídeo"
          aria-valuemin={0}
          aria-valuemax={Math.round(duracao)}
          aria-valuenow={Math.round(tempo)}
          onClick={buscar}
          onKeyDown={(e) => {
            const v = videoRef.current
            if (!v) return
            if (e.key === 'ArrowRight') v.currentTime = Math.min(v.duration, v.currentTime + 2)
            if (e.key === 'ArrowLeft') v.currentTime = Math.max(0, v.currentTime - 2)
          }}
          className="group/trilha cursor-pointer px-4 pb-[6px]"
        >
          <div style={{ height: 2, background: 'rgba(242,238,231,.28)', position: 'relative' }}>
            <div style={{ width: `${progresso}%`, height: '100%', background: '#C4A88B', transition: 'width 100ms linear' }} />
            <span
              className="absolute top-1/2 opacity-0 transition-opacity group-hover/trilha:opacity-100"
              style={{
                left: `${progresso}%`,
                width: 7,
                height: 7,
                marginLeft: -3.5,
                marginTop: -3.5,
                background: '#F2EEE7',
              }}
              aria-hidden
            />
          </div>
        </div>

        <div className="flex items-center gap-4 px-4 pb-[13px]">
          <button type="button" onClick={alternar} aria-label={tocando ? 'Pausar' : 'Reproduzir'} style={botao}>
            {tocando ? <Pause /> : <Play />}
          </button>

          <span className="tabular-nums" style={{ fontSize: 10.5, letterSpacing: '.1em', color: '#B3ADA0' }}>
            {relogio(tempo)}
            <span style={{ opacity: 0.45 }}> / </span>
            {relogio(duracao)}
          </span>

          <span className="flex-1" />

          <button
            type="button"
            onClick={() => setMudo((m) => !m)}
            aria-label={mudo ? 'Ativar som' : 'Desativar som'}
            style={botao}
          >
            {mudo ? <Mudo /> : <Som />}
          </button>

          <button type="button" onClick={telaCheia} aria-label="Tela cheia" style={botao}>
            <Expandir />
          </button>
        </div>
      </div>
    </div>
  )
}
