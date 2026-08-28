'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart, type CartItem } from '@/lib/cart'

const ESPERA_RETORNO = 2600

/**
 * Sacola, compra direta e WhatsApp. O retorno de "Adicionado" fica alguns
 * segundos no próprio botão e é anunciado por uma região viva.
 */
export function AcoesCompra({
  item,
  disponivel,
  hrefWhatsapp,
}: {
  /** null quando a peça não tem grade cadastrada. */
  item: Omit<CartItem, 'quantidade'> | null
  /** false quando a numeração está esgotada e a peça não aceita encomenda. */
  disponivel: boolean
  hrefWhatsapp: string
}) {
  const { adicionar } = useCart()
  const router = useRouter()
  const [adicionado, setAdicionado] = useState(false)
  const [navegando, setNavegando] = useState(false)
  const relogio = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (relogio.current) clearTimeout(relogio.current)
    }
  }, [])

  const bloqueado = !item || !disponivel || navegando

  function paraSacola() {
    if (bloqueado || !item) return
    adicionar(item)
    setAdicionado(true)
    if (relogio.current) clearTimeout(relogio.current)
    relogio.current = setTimeout(() => setAdicionado(false), ESPERA_RETORNO)
  }

  function comprarAgora() {
    if (bloqueado || !item) return
    adicionar(item)
    setNavegando(true)
    router.push('/checkout')
  }

  return (
    <div>
      <div className="flex flex-wrap" style={{ gap: 10, marginBottom: 14 }}>
        <button
          type="button"
          onClick={paraSacola}
          disabled={bloqueado}
          className="oz-btn oz-btn-primary"
          style={{ flex: '1 1 220px', padding: '18px 24px' }}
        >
          {adicionado ? 'Adicionado' : 'Adicionar à sacola'}
        </button>
        <button
          type="button"
          onClick={comprarAgora}
          disabled={bloqueado}
          className="oz-btn oz-btn-outline"
          style={{ flex: '1 1 140px', padding: '18px 24px' }}
        >
          Comprar agora
        </button>
      </div>

      <a
        href={hrefWhatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="oz-btn oz-btn-tertiary"
        style={{ width: '100%', padding: 14, letterSpacing: '.14em' }}
      >
        Tirar dúvida no WhatsApp
      </a>

      <p role="status" aria-live="polite" className="sr-only">
        {adicionado && item ? `${item.nome}, ${item.cor}, tamanho ${item.tamanho}, adicionado à sacola.` : ''}
      </p>
    </div>
  )
}
