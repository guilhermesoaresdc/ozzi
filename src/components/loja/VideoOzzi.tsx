'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Reprodutor da loja. O controle nativo do navegador é feio e cada sistema
 * desenha o dele — aqui a camada é nossa, com as arestas retas da marca.
 *
 * Toca sozinho e mudo: navegador nenhum deixa começar com som, e som que
 * dispara sem pedir espanta cliente. O botão de som fica visível para quem quiser.
 */
export function VideoOzzi({
  src,
  poster,
  alt,
  ratio = '3/4',
  className = '',
  autoPlay = true,
  className_video,
}: {
  src: string
  poster?: string | null
  alt: string
  ratio?: string
  className?: string
  autoPlay?: boolean
  className_video?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [tocando, setTocando] = useState(autoPlay)
  const [mudo, setMudo] = useState(true)
  const [progresso, setProgresso] = useState(0)
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v || !autoPlay) return

    // Quem pediu menos movimento no sistema não recebe play automático.
    const menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (menosMovimento) {
      setTocando(false)
      return
    }

    v.play()
      .then(() => setTocando(true))
      .catch(() => setTocando(false))
  }, [autoPlay, src])

  function alternar() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      void v.play().then(() => setTocando(true))
    } else {
      v.pause()
      setTocando(false)
    }
  }

  function alternarSom() {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMudo(v.muted)
  }

  return (
    <div className={`group relative overflow-hidden ${className}`} style={{ aspectRatio: ratio, background: '#E9E3D9' }}>
      <video
        ref={videoRef}
        src={src}
        poster={poster ?? undefined}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={alt}
        className={`h-full w-full object-cover ${className_video ?? ''}`}
        onLoadedData={() => setPronto(true)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget
          if (v.duration) setProgresso((v.currentTime / v.duration) * 100)
        }}
        onClick={alternar}
        style={{ cursor: 'pointer' }}
      />

      {/* Camada de controle: discreta, aparece ao passar o mouse ou ao focar */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
        style={{ background: 'linear-gradient(to top, rgba(35,35,32,.55), transparent)' }}
      >
        <button
          type="button"
          onClick={alternar}
          aria-label={tocando ? 'Pausar vídeo' : 'Reproduzir vídeo'}
          className="pointer-events-auto flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center"
          style={{ background: '#F2EEE7', color: '#232320', fontSize: 11, lineHeight: 1 }}
        >
          <span aria-hidden>{tocando ? '❚❚' : '▶'}</span>
        </button>

        <button
          type="button"
          onClick={alternarSom}
          aria-label={mudo ? 'Ativar som' : 'Desativar som'}
          className="pointer-events-auto cursor-pointer px-[10px] py-[6px] uppercase"
          style={{
            background: 'rgba(242,238,231,.92)',
            color: '#232320',
            fontSize: 9.5,
            letterSpacing: '.16em',
          }}
        >
          {mudo ? 'Som' : 'Mudo'}
        </button>
      </div>

      {/* Fio de progresso, na cor de destaque da marca */}
      <div className="absolute inset-x-0 bottom-0 h-[2px]" style={{ background: 'rgba(242,238,231,.25)' }}>
        <div
          className="h-full"
          style={{ width: `${progresso}%`, background: '#C4A88B', transition: 'width 120ms linear' }}
        />
      </div>

      {!pronto && (
        <span className="absolute inset-0 flex items-center justify-center" style={{ fontSize: 11, color: '#8A8375' }}>
          carregando…
        </span>
      )}
    </div>
  )
}
