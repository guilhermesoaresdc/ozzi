'use client'

import { useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { Ordenacao } from '@/lib/queries'

const OPCOES: { valor: Ordenacao; rotulo: string }[] = [
  { valor: 'relevancia', rotulo: 'Relevância' },
  { valor: 'menor-preco', rotulo: 'Menor preço' },
  { valor: 'maior-preco', rotulo: 'Maior preço' },
  { valor: 'novidades', rotulo: 'Novidades' },
]

/** A ordenação vive na URL (`?ordem=`) e é lida pelo servidor. */
export function OrdenacaoSelect({ valor }: { valor: Ordenacao }) {
  const router = useRouter()
  const pathname = usePathname()
  const [pendente, iniciar] = useTransition()

  function trocar(escolha: string) {
    const destino = escolha === 'relevancia' ? pathname : `${pathname}?ordem=${escolha}`
    iniciar(() => router.replace(destino, { scroll: false }))
  }

  return (
    <div
      className="flex items-center gap-[10px] uppercase"
      style={{ fontSize: 11.5, letterSpacing: '.1em' }}
    >
      <label htmlFor="ordenar" className="text-muted">
        Ordenar
      </label>
      <select
        id="ordenar"
        name="ordem"
        value={valor}
        aria-busy={pendente}
        onChange={(e) => trocar(e.target.value)}
        className={`border border-line-input bg-transparent uppercase ${pendente ? 'opacity-60' : ''}`}
        style={{ fontSize: 11.5, letterSpacing: '.08em', padding: '10px 13px' }}
      >
        {OPCOES.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
      <span role="status" className="sr-only">
        {pendente ? 'Reordenando a vitrine' : ''}
      </span>
    </div>
  )
}
