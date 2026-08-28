'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export interface CartItem {
  variantId: string
  productId: string
  slug: string
  nome: string
  ref: string
  cor: string
  corHex: string
  tamanho: string
  preco: number
  quantidade: number
  foto: string | null
  /** false quando a peça saiu por encomenda (numeração esgotada) */
  prontaEntrega: boolean
}

interface CartState {
  itens: CartItem[]
  carregado: boolean
  quantidade: number
  subtotal: number
  adicionar: (item: Omit<CartItem, 'quantidade'>, quantidade?: number) => void
  definirQuantidade: (variantId: string, quantidade: number) => void
  remover: (variantId: string) => void
  limpar: () => void
}

const CHAVE = 'ozzi:sacola:v1'
const CartContext = createContext<CartState | null>(null)

function ler(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const bruto = window.localStorage.getItem(CHAVE)
    if (!bruto) return []
    const dados = JSON.parse(bruto)
    return Array.isArray(dados) ? (dados as CartItem[]) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [itens, setItens] = useState<CartItem[]>([])
  const [carregado, setCarregado] = useState(false)

  useEffect(() => {
    setItens(ler())
    setCarregado(true)
  }, [])

  useEffect(() => {
    if (!carregado) return
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify(itens))
    } catch {
      // Sem espaço ou storage bloqueado: a sacola vale só para esta navegação.
    }
  }, [itens, carregado])

  // Mantém a sacola em sincronia entre abas
  useEffect(() => {
    function aoMudar(e: StorageEvent) {
      if (e.key === CHAVE) setItens(ler())
    }
    window.addEventListener('storage', aoMudar)
    return () => window.removeEventListener('storage', aoMudar)
  }, [])

  const adicionar = useCallback((item: Omit<CartItem, 'quantidade'>, quantidade = 1) => {
    setItens((atual) => {
      const i = atual.findIndex((x) => x.variantId === item.variantId)
      if (i === -1) return [...atual, { ...item, quantidade }]
      const copia = [...atual]
      copia[i] = { ...copia[i], quantidade: copia[i].quantidade + quantidade }
      return copia
    })
  }, [])

  const definirQuantidade = useCallback((variantId: string, quantidade: number) => {
    setItens((atual) =>
      atual.map((x) => (x.variantId === variantId ? { ...x, quantidade: Math.max(1, quantidade) } : x)),
    )
  }, [])

  const remover = useCallback((variantId: string) => {
    setItens((atual) => atual.filter((x) => x.variantId !== variantId))
  }, [])

  const limpar = useCallback(() => setItens([]), [])

  const valor = useMemo<CartState>(() => {
    const quantidade = itens.reduce((s, i) => s + i.quantidade, 0)
    const subtotal = itens.reduce((s, i) => s + i.preco * i.quantidade, 0)
    return { itens, carregado, quantidade, subtotal, adicionar, definirQuantidade, remover, limpar }
  }, [itens, carregado, adicionar, definirQuantidade, remover, limpar])

  return <CartContext.Provider value={valor}>{children}</CartContext.Provider>
}

export function useCart(): CartState {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart precisa estar dentro de <CartProvider>')
  return ctx
}
