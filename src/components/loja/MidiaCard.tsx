'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Placeholder } from '@/components/ui/Placeholder'

const INTERVALO = 900

/**
 * Mídia do cartão de produto.
 *
 * Parado, mostra a capa. Com o mouse em cima: se a peça tem vídeo, vai direto
 * para ele, tocando sozinho e mudo; se não tem, passa as outras fotos em
 * carrossel. Tirou o mouse, volta para a capa.
 *
 * Em toque não existe hover: o cartão fica na capa e a pessoa vê o resto na
 * página da peça — piscar mídia sozinho no celular só atrapalha a rolagem.
 */
export function MidiaCard({
  fotos,
  videos,
  nome,
  legenda,
  sizes,
  priority = false,
  ratio = '3/4',
}: {
  fotos: string[]
  videos: string[]
  nome: string
  legenda: string
  sizes?: string
  priority?: boolean
  ratio?: string
}) {
  const [ativo, setAtivo] = useState(false)
  const [indice, setIndice] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  const temVideo = videos.length > 0
  const capa = fotos[0] ?? null

  // Carrossel só quando há mais de uma foto e a peça não tem vídeo
  useEffect(() => {
    if (!ativo || temVideo || fotos.length < 2) return
    const id = setInterval(() => setIndice((i) => (i + 1) % fotos.length), INTERVALO)
    return () => clearInterval(id)
  }, [ativo, temVideo, fotos.length])

  useEffect(() => {
    if (!ativo) setIndice(0)
  }, [ativo])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (ativo) void v.play().catch(() => undefined)
    else {
      v.pause()
      v.currentTime = 0
    }
  }, [ativo])

  const semMidia = !capa && !temVideo

  return (
    <div
      className="relative overflow-hidden"
      style={{ aspectRatio: ratio, background: '#E9E3D9' }}
      onMouseEnter={() => setAtivo(true)}
      onMouseLeave={() => setAtivo(false)}
    >
      {semMidia ? (
        <Placeholder label={legenda} ratio={ratio} sizes={sizes} />
      ) : (
        <>
          {capa && (
            <Image
              src={fotos[ativo && !temVideo ? indice : 0] ?? capa}
              alt={nome}
              fill
              sizes={sizes}
              priority={priority}
              className="object-cover transition-[filter] duration-200"
              style={{ filter: ativo ? 'brightness(.965)' : undefined }}
            />
          )}

          {temVideo && (
            <video
              ref={videoRef}
              src={videos[0]}
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden
              tabIndex={-1}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
              style={{ opacity: ativo ? 1 : 0 }}
            />
          )}

          {/* Marca discreta de que existe vídeo, para quem ainda não passou o mouse */}
          {temVideo && !ativo && (
            <span
              className="absolute uppercase"
              style={{
                bottom: 13,
                right: 13,
                background: 'rgba(242,238,231,.92)',
                color: '#232320',
                fontSize: 9,
                letterSpacing: '.16em',
                padding: '5px 8px',
              }}
            >
              Vídeo
            </span>
          )}

          {/* Fio de posição do carrossel de fotos */}
          {ativo && !temVideo && fotos.length > 1 && (
            <span className="absolute inset-x-3 bottom-3 flex gap-[3px]" aria-hidden>
              {fotos.map((f, i) => (
                <span
                  key={f}
                  className="h-[2px] flex-1"
                  style={{ background: i === indice ? '#F2EEE7' : 'rgba(242,238,231,.4)' }}
                />
              ))}
            </span>
          )}
        </>
      )}
    </div>
  )
}
