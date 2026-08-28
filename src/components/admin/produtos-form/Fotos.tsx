'use client'

import { useId, useState } from 'react'
import { Placeholder } from '@/components/ui/Placeholder'
import { ESTILO_CAMPO } from './Campos'
import { HOST_IMAGENS, MAX_FOTOS, podeExibirImagem } from './dados'

export function Fotos({ fotos, onFotos }: { fotos: string[]; onFotos: (fotos: string[]) => void }) {
  const [url, setUrl] = useState('')
  const [aviso, setAviso] = useState<string | null>(null)
  const campoId = useId()

  function adicionar() {
    const endereco = url.trim()
    if (!endereco) return setAviso('Cole o endereço de uma imagem para adicionar.')
    if (!/^https:\/\/\S+$/i.test(endereco) && !endereco.startsWith('/'))
      return setAviso('O endereço precisa começar com https:// — o navegador não carrega imagens fora disso.')
    if (fotos.includes(endereco)) return setAviso('Esta foto já está na lista.')
    if (fotos.length >= MAX_FOTOS) return setAviso(`São no máximo ${MAX_FOTOS} fotos por peça.`)
    onFotos([...fotos, endereco])
    setUrl('')
    setAviso(null)
  }

  function mover(indice: number) {
    const lista = [...fotos]
    const [foto] = lista.splice(indice, 1)
    lista.splice(indice - 1, 0, foto)
    onFotos(lista)
  }

  const foraDoDominio = fotos.some((f) => !podeExibirImagem(f))

  return (
    <section className="oz-card" style={{ padding: 24 }}>
      <h2 className="font-display" style={{ fontSize: 22, fontWeight: 400, marginBottom: 18 }}>
        Fotos
      </h2>

      <div className="grid gap-[12px]" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))' }}>
        {fotos.map((foto, i) => {
          const exibivel = podeExibirImagem(foto)
          return (
            <figure key={foto} className="flex min-w-0 flex-col gap-[6px]">
              <Placeholder
                ratio="3/4"
                densidade="denso"
                sizes="120px"
                src={exibivel ? foto : null}
                alt={i === 0 ? 'Foto de capa da peça' : `Foto ${i + 1} da peça`}
                label={exibivel ? undefined : 'fora do domínio · não aparece'}
              />
              <figcaption className="flex items-center justify-between gap-2" style={{ fontSize: 11, color: '#8A8375' }}>
                <span>{i === 0 ? 'Capa' : `Foto ${i + 1}`}</span>
                <span className="flex items-center gap-[8px]">
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => mover(i)}
                      aria-label={`Mover a foto ${i + 1} para antes da anterior`}
                      className="cursor-pointer hover:text-ink"
                      style={{ background: 'none', border: 0, padding: 0, fontSize: 12 }}
                    >
                      ←
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onFotos(fotos.filter((f) => f !== foto))}
                    aria-label={`Remover a foto ${i + 1}`}
                    className="cursor-pointer uppercase hover:text-danger"
                    style={{ background: 'none', border: 0, padding: 0, fontSize: 10.5, letterSpacing: '.12em' }}
                  >
                    Remover
                  </button>
                </span>
              </figcaption>
            </figure>
          )
        })}

        <button
          type="button"
          onClick={() => document.getElementById(campoId)?.focus()}
          className="flex cursor-pointer items-center justify-center border border-dashed border-line-dashed text-center text-muted transition-colors hover:border-ink hover:text-ink"
          style={{ aspectRatio: '3/4', padding: 12, fontSize: 11.5, background: 'transparent' }}
        >
          + Adicionar foto
        </button>
      </div>

      <div className="mt-[18px] flex flex-wrap items-end gap-[10px]">
        <label className="flex min-w-[240px] flex-1 flex-col gap-[7px]">
          <span className="oz-label">Endereço da imagem</span>
          <input
            id={campoId}
            type="url"
            value={url}
            placeholder="https://…/vestido-serrote-frente.jpg"
            onChange={(e) => {
              setUrl(e.target.value)
              setAviso(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                adicionar()
              }
            }}
            style={ESTILO_CAMPO}
          />
        </label>
        <button
          type="button"
          onClick={adicionar}
          className="oz-btn oz-btn-tertiary"
          style={{ padding: '12px 22px', fontSize: 11, letterSpacing: '.14em' }}
        >
          Adicionar
        </button>
      </div>

      {aviso && (
        <p role="alert" className="mt-[10px]" style={{ fontSize: 11.5, lineHeight: 1.55, color: '#A0533F' }}>
          {aviso}
        </p>
      )}

      <p className="mt-[10px]" style={{ fontSize: 11.5, lineHeight: 1.6, color: '#8A8375' }}>
        O envio de arquivo entra quando o bucket de storage for configurado. Por enquanto, cole o endereço de
        uma imagem já publicada. A vitrine só exibe imagens em {HOST_IMAGENS}; as demais ficam guardadas no
        cadastro, mas não aparecem na loja.
      </p>

      {foraDoDominio && (
        <p className="mt-[6px]" style={{ fontSize: 11.5, lineHeight: 1.6, color: '#A0533F' }}>
          Há fotos fora de {HOST_IMAGENS} nesta peça — elas aparecem como placeholder na vitrine.
        </p>
      )}
    </section>
  )
}
