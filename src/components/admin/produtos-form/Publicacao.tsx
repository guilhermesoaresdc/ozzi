'use client'

import Link from 'next/link'
import type { ProductStatus } from '@/lib/database.types'
import { PUBLICACOES } from './dados'

export function Publicacao({
  status,
  onStatus,
  salvando,
  erro,
}: {
  status: ProductStatus
  onStatus: (status: ProductStatus) => void
  salvando: boolean
  erro?: string
}) {
  return (
    <section className="oz-card" style={{ padding: 22 }}>
      <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
        <legend className="font-display" style={{ fontSize: 20, fontWeight: 400, padding: 0, marginBottom: 16 }}>
          Publicação
        </legend>

        <div className="flex flex-col gap-[9px]">
          {PUBLICACOES.map((opcao) => {
            const selecionada = opcao.chave === status
            return (
              <label
                key={opcao.chave}
                className="flex cursor-pointer flex-col gap-[4px] transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink"
                style={{
                  padding: '13px 15px',
                  border: `1px solid ${selecionada ? '#232320' : '#DFD8CB'}`,
                  background: selecionada ? '#EFE9DF' : 'transparent',
                }}
              >
                <input
                  type="radio"
                  name="status"
                  value={opcao.chave}
                  checked={selecionada}
                  onChange={() => onStatus(opcao.chave)}
                  className="sr-only"
                />
                <span style={{ fontSize: 13.5 }}>{opcao.rotulo}</span>
                <span style={{ fontSize: 11.5, color: '#8A8375' }}>{opcao.dica}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      {erro && (
        <p role="alert" className="mt-4" style={{ fontSize: 12, lineHeight: 1.55, color: '#A0533F' }}>
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={salvando}
        className="oz-btn oz-btn-primary w-full"
        style={{ marginTop: 18, padding: 15, fontSize: 11, letterSpacing: '.16em' }}
      >
        {salvando ? 'Salvando…' : 'Salvar produto'}
      </button>

      <Link
        href="/admin/produtos"
        className="block w-full text-center uppercase"
        style={{ padding: 12, fontSize: 11, letterSpacing: '.14em', color: '#8A8375' }}
      >
        Descartar
      </Link>
    </section>
  )
}
