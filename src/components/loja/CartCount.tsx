'use client'

import { useCart } from '@/lib/cart'

export function CartCount() {
  const { quantidade, carregado } = useCart()
  if (!carregado || quantidade === 0) return null

  return (
    <span
      className="oz-pill inline-flex items-center justify-center px-[5px]"
      style={{ minWidth: 19, height: 19, background: '#232320', color: '#F2EEE7', fontSize: 10 }}
      aria-label={`${quantidade} ${quantidade === 1 ? 'item' : 'itens'} na sacola`}
    >
      {quantidade}
    </span>
  )
}
