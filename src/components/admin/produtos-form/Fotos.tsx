'use client'

import { UploadMidia } from '@/components/admin/UploadMidia'
import { MAX_FOTOS } from './dados'

export const MAX_VIDEOS = 4

export function Fotos({
  fotos,
  onFotos,
  videos,
  onVideos,
  pasta,
}: {
  fotos: string[]
  onFotos: (fotos: string[]) => void
  videos: string[]
  onVideos: (videos: string[]) => void
  pasta: string
}) {
  return (
    <section className="oz-card flex flex-col gap-[26px]" style={{ padding: 24 }}>
      <div className="flex flex-col gap-[14px]">
        <div>
          <h2 className="font-display" style={{ fontSize: 22, fontWeight: 400 }}>
            Fotos
          </h2>
          <p style={{ fontSize: 12.5, color: '#8A8375', marginTop: 4 }}>
            A primeira é a capa: é ela que aparece na vitrine e na busca.
          </p>
        </div>
        <UploadMidia
          valor={fotos}
          onChange={onFotos}
          pasta={`${pasta}/fotos`}
          tipo="imagem"
          max={MAX_FOTOS}
          rotuloPrimeiro="Capa"
          singular="foto"
          plural="fotos"
        />
      </div>

      <div className="flex flex-col gap-[14px]" style={{ borderTop: '1px solid #E4DDD1', paddingTop: 24 }}>
        <div>
          <h2 className="font-display" style={{ fontSize: 22, fontWeight: 400 }}>
            Vídeos
          </h2>
          <p style={{ fontSize: 12.5, color: '#8A8375', marginTop: 4 }}>
            Um vídeo curto mostrando o caimento vende mais que qualquer foto parada.
          </p>
        </div>
        <UploadMidia
          valor={videos}
          onChange={onVideos}
          pasta={`${pasta}/videos`}
          tipo="video"
          max={MAX_VIDEOS}
          singular="vídeo"
          plural="vídeos"
          ratio="9/16"
        />
      </div>
    </section>
  )
}
