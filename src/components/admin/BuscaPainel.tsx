'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export function BuscaPainel() {
  const router = useRouter()
  const params = useSearchParams()
  const [termo, setTermo] = useState(params.get('q') ?? '')

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        const q = termo.trim()
        router.push(q ? `/admin/busca?q=${encodeURIComponent(q)}` : '/admin/busca')
      }}
    >
      <label htmlFor="busca-painel" className="sr-only">
        Buscar pedido, produto ou cliente
      </label>
      <input
        id="busca-painel"
        type="search"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        placeholder="Buscar pedido, produto ou cliente"
        className="oz-input"
        style={{ width: 270, padding: '11px 13px', fontSize: 13 }}
      />
    </form>
  )
}
