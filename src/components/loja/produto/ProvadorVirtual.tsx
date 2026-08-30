'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useActionState, useId, useRef, useState } from 'react'
import { provar, type EstadoProva } from '@/app/(loja)/provador/actions'

const INICIAL: EstadoProva = {}

/**
 * Provador virtual: a pessoa envia uma foto dela e recebe a imagem vestindo
 * a peça. A cota não é anunciada de antemão — só aparece ao ser atingida.
 */
export function ProvadorVirtual({
  productId,
  variantId,
  nomePeca,
}: {
  productId: string
  variantId: string | null
  nomePeca: string
}) {
  const [estado, acao, enviando] = useActionState(provar, INICIAL)
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const campoId = useId()

  return (
    <section style={{ borderTop: '1px solid #DFD8CB', marginTop: 26, paddingTop: 22 }}>
      <h2 className="font-display" style={{ fontSize: 24, fontWeight: 400 }}>
        Provar em mim
      </h2>
      <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#5C574D', marginTop: 6 }}>
        Envie uma foto sua de corpo inteiro e veja como a {nomePeca.toLowerCase()} fica em você,
        antes de decidir a numeração.
      </p>

      <form action={acao} className="mt-[18px] flex flex-col gap-[14px]">
        <input type="hidden" name="product_id" value={productId} />
        <input type="hidden" name="variant_id" value={variantId ?? ''} />

        <label
          htmlFor={campoId}
          className="flex cursor-pointer flex-col items-center justify-center gap-[6px] text-center"
          style={{
            border: '1px dashed #B8AE9C',
            padding: '26px 20px',
            color: '#8A8375',
            fontSize: 13,
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }} aria-hidden>
            +
          </span>
          <span>{nomeArquivo ?? 'Escolher uma foto sua'}</span>
          <span style={{ fontSize: 11 }}>do computador ou do celular · JPG, PNG ou WebP</span>
        </label>
        <input
          ref={inputRef}
          id={campoId}
          type="file"
          name="foto"
          accept="image/jpeg,image/png,image/webp"
          capture="user"
          required
          className="sr-only"
          onChange={(e) => setNomeArquivo(e.target.files?.[0]?.name ?? null)}
        />

        <button type="submit" disabled={enviando} className="oz-btn oz-btn-primary" style={{ padding: '15px 28px' }}>
          {enviando ? 'Provando…' : 'Ver em mim'}
        </button>
      </form>

      {enviando && (
        <p role="status" style={{ fontSize: 12.5, color: '#8A8375', marginTop: 12 }}>
          Isso leva alguns segundos. Não feche a página.
        </p>
      )}

      {estado.limite && (
        <p role="status" style={{ fontSize: 13, color: '#8A6A4F', marginTop: 14, lineHeight: 1.6 }}>
          {estado.limite}{' '}
          <Link href="/entrar" style={{ borderBottom: '1px solid #C4A88B' }}>
            Criar minha conta
          </Link>
        </p>
      )}

      {estado.erro && (
        <p role="alert" style={{ fontSize: 13, color: '#A0533F', marginTop: 14, lineHeight: 1.6 }}>
          {estado.erro}
        </p>
      )}

      {estado.imagem && (
        <figure className="mt-[18px]">
          <Image
            src={estado.imagem}
            alt={`Você vestindo ${nomePeca}`}
            width={520}
            height={690}
            unoptimized
            style={{ width: '100%', height: 'auto', background: '#E9E3D9' }}
          />
          <figcaption className="mt-[10px] flex flex-wrap items-center gap-x-4 gap-y-2" style={{ fontSize: 12, color: '#8A8375' }}>
            <span>Imagem gerada por IA · pode não refletir o caimento real.</span>
            <Link href="/provador" style={{ borderBottom: '1px solid #C9C0B1' }}>
              Ver minhas provas
            </Link>
          </figcaption>
        </figure>
      )}
    </section>
  )
}
