'use client'

import type { RefObject } from 'react'

/**
 * O campo da busca (handoff §5.4): input sem borda dentro de um contêiner com
 * fio inferior escuro, e a contagem de resultados à direita.
 */
export function CampoBusca({
  termo,
  contagem,
  ocupado,
  campoRef,
  aoMudar,
  aoEnviar,
}: {
  termo: string
  /** Já formatada: "18 peças", "Buscando…" ou vazia. */
  contagem: string
  ocupado: boolean
  campoRef: RefObject<HTMLInputElement | null>
  aoMudar: (valor: string) => void
  aoEnviar: () => void
}) {
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        aoEnviar()
      }}
    >
      <h1 className="font-display" style={{ fontWeight: 300, fontSize: 'clamp(34px, 4vw, 46px)', marginBottom: 22 }}>
        <label htmlFor="busca-termo">O que você procura?</label>
      </h1>

      <div
        className="flex items-center"
        style={{ gap: 14, borderBottom: '1px solid #232320', paddingBottom: 14, marginBottom: 36 }}
      >
        <input
          id="busca-termo"
          ref={campoRef}
          name="q"
          type="search"
          value={termo}
          onChange={(e) => aoMudar(e.target.value)}
          placeholder="vestido de linho, conjunto alfaiataria..."
          autoComplete="off"
          enterKeyHint="search"
          aria-describedby="busca-contagem"
          aria-busy={ocupado}
          className="min-w-0 flex-1 border-none bg-transparent p-0 placeholder:text-faint"
          style={{ fontSize: 'clamp(20px, 2.4vw, 28px)', fontWeight: 300, lineHeight: 1.3 }}
        />
        <span
          id="busca-contagem"
          role="status"
          aria-live="polite"
          className="shrink-0 uppercase"
          style={{ fontSize: 11.5, letterSpacing: '.14em', color: '#8A8375' }}
        >
          {contagem}
        </span>
      </div>
    </form>
  )
}
