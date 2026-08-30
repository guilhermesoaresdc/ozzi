'use client'

import { useState } from 'react'
import { Placeholder } from '@/components/ui/Placeholder'
import { VideoOzzi } from '@/components/loja/VideoOzzi'
import { Lightbox, type ItemMidia } from '@/components/loja/Lightbox'

/** As quatro tomadas do handoff §5.3, usadas enquanto não há foto real. */
const TOMADAS = [
  { legenda: 'produto · frente · 900×1200', alt: 'frente' },
  { legenda: 'produto · costas · 900×1200', alt: 'costas' },
  { legenda: 'detalhe do tecido · 900×1200', alt: 'detalhe do tecido' },
  { legenda: 'look completo · 900×1200', alt: 'look completo' },
]

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

  // A galeria em tela cheia segue a mesma ordem da grade: vídeo primeiro.
  const midias: ItemMidia[] = [
    ...videos.map((src, i) => ({ src, alt: `${nome} — vídeo ${i + 1}, mostrando o caimento da peça` })),
    ...fotos.map((src, i) => ({
      src,
      alt: `${nome}${TOMADAS[i] ? ` — ${TOMADAS[i].alt}` : ` — foto ${i + 1}`}`,
    })),
  ]

  const semMidia = midias.length === 0
  // As tomadas de exemplo só entram quando não há mídia nenhuma. Com vídeo e
  // sem foto, encher a grade de tarjas listradas piora o que já está bom.
  const itens: (string | null)[] =
    fotos.length > 0 ? fotos : videos.length > 0 ? [] : new Array(TOMADAS.length).fill(null)

  return (
    <>
      <div className="grid grid-cols-2" style={{ gap: 10, minWidth: 0 }}>
        {/* O vídeo vem primeiro e já entra tocando: é o que mostra o caimento. */}
        {videos.map((video, i) => (
          <button
            key={video}
            type="button"
            onClick={() => setAberta(i)}
            aria-label={`Ampliar o vídeo ${i + 1} de ${nome}`}
            className="block w-full cursor-zoom-in text-left"
          >
            <VideoOzzi
              src={video}
              poster={fotos[0] ?? null}
              alt={`${nome} — vídeo ${i + 1}, mostrando o caimento da peça`}
              ratio="3/4"
            />
          </button>
        ))}

        {itens.map((foto: string | null, i: number) => {
          const conteudo = (
            <Placeholder
              label={foto ? undefined : (TOMADAS[i]?.legenda ?? 'produto · 900×1200')}
              src={foto}
              alt={`${nome}${TOMADAS[i] ? ` — ${TOMADAS[i].alt}` : ` — foto ${i + 1}`}`}
              ratio="3/4"
              densidade="denso"
              sizes="(max-width: 900px) 50vw, 30vw"
              priority={i === 0 && videos.length === 0}
            />
          )

          if (!foto) return <div key={TOMADAS[i]?.legenda ?? i}>{conteudo}</div>

          return (
            <button
              key={foto}
              type="button"
              onClick={() => setAberta(videos.length + i)}
              aria-label={`Ampliar a foto ${i + 1} de ${nome}`}
              className="block w-full cursor-zoom-in text-left transition-[filter] hover:brightness-[.97]"
            >
              {conteudo}
            </button>
          )
        })}
      </div>

      {aberta !== null && !semMidia && (
        <Lightbox itens={midias} indiceInicial={aberta} aoFechar={() => setAberta(null)} />
      )}
    </>
  )
}
