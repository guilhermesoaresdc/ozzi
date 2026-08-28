'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useCart } from '@/lib/cart'
import { WHATSAPP } from '@/lib/supabase/config'
import type { ItemRecompra } from '@/components/loja/conta/tipos'

/**
 * "Comprar de novo" devolve à sacola as peças do pedido que ainda estão na
 * vitrine e com estoque. Quando não sobra nenhuma, a tela diz isso — não
 * adianta mandar a pessoa para uma sacola vazia.
 */
export function ComprarDeNovo({
  codigo,
  itens,
  estilo,
}: {
  codigo: string
  itens: ItemRecompra[]
  estilo?: React.CSSProperties
}) {
  const { adicionar } = useCart()
  const router = useRouter()
  const [semEstoque, setSemEstoque] = useState(false)

  const parcial = itens.length > 0

  function repetir() {
    if (!parcial) {
      setSemEstoque(true)
      return
    }

    for (const item of itens) {
      const { quantidade, ...peca } = item
      adicionar(peca, quantidade)
    }
    router.push('/sacola')
  }

  const href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
    `Oi! Queria repetir as peças do pedido ${codigo}. Ainda dá para encomendar?`,
  )}`

  return (
    <>
      <button
        type="button"
        onClick={repetir}
        className="oz-btn oz-btn-outline"
        style={estilo}
        aria-label={`Comprar de novo as peças do pedido #${codigo}`}
      >
        Comprar de novo
      </button>

      {semEstoque && (
        <p
          role="status"
          className="basis-full"
          style={{ fontSize: 12.5, lineHeight: 1.6, color: '#8A8375' }}
        >
          As peças deste pedido não estão mais no estoque.{' '}
          <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#8A6A4F' }}>
            Peça uma encomenda no WhatsApp
          </a>
          .
        </p>
      )}
    </>
  )
}
