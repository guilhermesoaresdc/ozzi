'use client'

import { useId, useRef, useState } from 'react'
import { Placeholder } from '@/components/ui/Placeholder'
import { VideoOzzi } from '@/components/loja/VideoOzzi'
import {
  aceitaDoTipo,
  ehVideo,
  enviarArquivo,
  MAX_IMAGEM_BYTES,
  MAX_VIDEO_BYTES,
  type TipoMidia,
} from '@/lib/storage'

const ESTILO_CAMPO: React.CSSProperties = {
  width: '100%',
  border: '1px solid #C9C0B1',
  background: '#FAF7F2',
  padding: '11px 13px',
  fontSize: 13.5,
}

export interface UploadMidiaProps {
  valor: string[]
  onChange: (lista: string[]) => void
  /** Pasta dentro do bucket, ex. "produtos/OZ-1042" ou "banners". */
  pasta: string
  tipo?: TipoMidia
  max?: number
  /** Rótulo do primeiro item, quando ele tem papel especial. */
  rotuloPrimeiro?: string
  singular?: string
  plural?: string
  ratio?: string
}

/**
 * Envio de mídia a partir do dispositivo, com arrastar e soltar, seleção
 * múltipla, reordenação e — como saída de emergência — colar um endereço.
 */
export function UploadMidia({
  valor,
  onChange,
  pasta,
  tipo = 'imagem',
  max = 12,
  rotuloPrimeiro,
  singular = 'arquivo',
  plural = 'arquivos',
  ratio = '3/4',
}: UploadMidiaProps) {
  const [enviando, setEnviando] = useState(false)
  const [progresso, setProgresso] = useState<{ feitos: number; total: number } | null>(null)
  const [avisos, setAvisos] = useState<string[]>([])
  const [sobre, setSobre] = useState(false)
  const [url, setUrl] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const campoId = useId()
  const urlId = useId()

  const cheio = valor.length >= max
  const rotuloTipo = tipo === 'video' ? 'vídeo' : tipo === 'ambos' ? 'foto ou vídeo' : 'foto'

  async function receber(arquivos: FileList | File[]) {
    const lista = Array.from(arquivos)
    if (lista.length === 0) return

    const espaco = max - valor.length
    const problemas: string[] = []
    if (lista.length > espaco) {
      problemas.push(`Cabem mais ${espaco} ${espaco === 1 ? singular : plural}; o resto ficou de fora.`)
    }

    setEnviando(true)
    setAvisos([])
    const aceitos = lista.slice(0, Math.max(0, espaco))
    setProgresso({ feitos: 0, total: aceitos.length })

    const novos: string[] = []
    for (const [i, file] of aceitos.entries()) {
      const { url: enviado, erro } = await enviarArquivo(file, pasta, tipo)
      if (erro) problemas.push(erro)
      else if (enviado) novos.push(enviado)
      setProgresso({ feitos: i + 1, total: aceitos.length })
    }

    if (novos.length) onChange([...valor, ...novos])
    setAvisos(problemas)
    setEnviando(false)
    setProgresso(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  function adicionarPorUrl() {
    const endereco = url.trim()
    if (!endereco) return setAvisos(['Cole um endereço para adicionar.'])
    if (!/^https:\/\/\S+$/i.test(endereco) && !endereco.startsWith('/'))
      return setAvisos(['O endereço precisa começar com https://.'])
    if (valor.includes(endereco)) return setAvisos(['Este arquivo já está na lista.'])
    if (cheio) return setAvisos([`São no máximo ${max} ${plural}.`])
    onChange([...valor, endereco])
    setUrl('')
    setAvisos([])
  }

  function mover(indice: number, direcao: -1 | 1) {
    const destino = indice + direcao
    if (destino < 0 || destino >= valor.length) return
    const lista = [...valor]
    ;[lista[indice], lista[destino]] = [lista[destino], lista[indice]]
    onChange(lista)
  }

  function remover(indice: number) {
    onChange(valor.filter((_, i) => i !== indice))
  }

  return (
    <div className="flex flex-col gap-[14px]">
      <div className="grid gap-[12px]" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))' }}>
        {valor.map((item, i) => (
          <figure key={item} className="flex min-w-0 flex-col gap-[6px]">
            {ehVideo(item) ? (
              <VideoOzzi src={item} alt={`Vídeo ${i + 1}`} ratio={ratio} autoPlay={false} />
            ) : (
              <Placeholder ratio={ratio} densidade="denso" sizes="120px" src={item} alt={`${singular} ${i + 1}`} />
            )}
            <figcaption className="flex items-center justify-between gap-2" style={{ fontSize: 11, color: '#8A8375' }}>
              <span>{i === 0 && rotuloPrimeiro ? rotuloPrimeiro : `${i + 1}`}</span>
              <span className="flex items-center gap-[8px]">
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => mover(i, -1)}
                    aria-label={`Mover ${singular} ${i + 1} para antes`}
                    className="cursor-pointer"
                  >
                    ←
                  </button>
                )}
                {i < valor.length - 1 && (
                  <button
                    type="button"
                    onClick={() => mover(i, 1)}
                    aria-label={`Mover ${singular} ${i + 1} para depois`}
                    className="cursor-pointer"
                  >
                    →
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remover(i)}
                  aria-label={`Remover ${singular} ${i + 1}`}
                  className="cursor-pointer"
                  style={{ color: '#A0533F' }}
                >
                  Remover
                </button>
              </span>
            </figcaption>
          </figure>
        ))}

        {!cheio && (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setSobre(true)
            }}
            onDragLeave={() => setSobre(false)}
            onDrop={(e) => {
              e.preventDefault()
              setSobre(false)
              if (e.dataTransfer.files?.length) void receber(e.dataTransfer.files)
            }}
            style={{ aspectRatio: ratio }}
          >
            <label
              htmlFor={campoId}
              className="flex h-full cursor-pointer flex-col items-center justify-center gap-[6px] text-center transition-colors"
              style={{
                border: `1px dashed ${sobre ? '#232320' : '#B8AE9C'}`,
                background: sobre ? '#EFE9DF' : 'transparent',
                color: sobre ? '#232320' : '#8A8375',
                padding: 12,
                fontSize: 12.5,
              }}
            >
              {enviando ? (
                <>
                  <span>Enviando…</span>
                  {progresso && (
                    <span style={{ fontSize: 11 }}>
                      {progresso.feitos} de {progresso.total}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span style={{ fontSize: 18, lineHeight: 1 }} aria-hidden>
                    +
                  </span>
                  <span>Escolher {rotuloTipo}</span>
                  <span style={{ fontSize: 10.5 }}>ou arraste aqui</span>
                </>
              )}
            </label>
            <input
              ref={inputRef}
              id={campoId}
              type="file"
              multiple
              accept={aceitaDoTipo(tipo)}
              disabled={enviando}
              className="sr-only"
              onChange={(e) => {
                if (e.target.files?.length) void receber(e.target.files)
              }}
            />
          </div>
        )}
      </div>

      <p style={{ fontSize: 11.5, color: '#8A8375', lineHeight: 1.6 }}>
        Selecione do computador ou do celular, ou arraste os arquivos.{' '}
        {tipo !== 'video' && `Imagem em JPG, PNG, WebP ou AVIF, até ${MAX_IMAGEM_BYTES / 1024 / 1024} MB. `}
        {tipo !== 'imagem' && `Vídeo em MP4, WebM ou MOV, até ${MAX_VIDEO_BYTES / 1024 / 1024} MB. `}
        Até {max} {plural}
        {rotuloPrimeiro ? `; o primeiro é ${rotuloPrimeiro.toLowerCase()}` : ''}.
      </p>

      {avisos.length > 0 && (
        <ul role="alert" className="flex flex-col gap-[4px]">
          {avisos.map((a) => (
            <li key={a} style={{ fontSize: 12, color: '#A0533F' }}>
              {a}
            </li>
          ))}
        </ul>
      )}

      <details>
        <summary className="cursor-pointer" style={{ fontSize: 11.5, color: '#8A8375' }}>
          Usar o endereço de um arquivo já publicado
        </summary>
        <div className="mt-[10px] flex flex-wrap items-end gap-[10px]">
          <span className="flex min-w-[240px] flex-1 flex-col gap-[6px]">
            <label htmlFor={urlId} className="oz-label">
              Endereço do arquivo
            </label>
            <input
              id={urlId}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              style={ESTILO_CAMPO}
            />
          </span>
          <button type="button" onClick={adicionarPorUrl} className="oz-btn oz-btn-tertiary">
            Adicionar
          </button>
        </div>
      </details>
    </div>
  )
}
