'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { CartCount } from '@/components/loja/CartCount'

interface Item {
  label: string
  href: string
}

export function HeaderNav({
  menu,
  autenticado,
  admin,
}: {
  menu: Item[]
  autenticado: boolean
  admin: boolean
}) {
  const [aberto, setAberto] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setAberto(false)
  }, [pathname])

  const acoes = (
    <>
      <Link href="/busca" className="oz-nav-link">
        Buscar
      </Link>
      <Link href={autenticado ? '/conta/pedidos' : '/entrar'} className="oz-nav-link">
        Conta
      </Link>
      {admin && (
        <Link href="/admin" className="oz-nav-link" style={{ color: '#8A6A4F' }}>
          Painel
        </Link>
      )}
      <Link href="/sacola" className="oz-nav-link inline-flex items-center gap-2">
        Sacola
        <CartCount />
      </Link>
    </>
  )

  return (
    <>
      {/* Desktop */}
      <nav className="hidden flex-wrap gap-6 md:flex" aria-label="Navegação principal">
        {menu.map((m) => (
          <Link key={m.href} href={m.href} className="oz-nav-link">
            {m.label}
          </Link>
        ))}
      </nav>
      <div className="hidden flex-wrap items-center gap-6 md:flex">{acoes}</div>

      {/* Mobile */}
      <div className="flex items-center gap-5 md:hidden">
        <Link href="/sacola" className="oz-nav-link inline-flex items-center gap-2">
          Sacola
          <CartCount />
        </Link>
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          aria-controls="menu-mobile"
          className="oz-nav-link cursor-pointer"
        >
          {aberto ? 'Fechar' : 'Menu'}
        </button>
      </div>

      {aberto && (
        <div id="menu-mobile" className="w-full border-t border-line pt-4 pb-2 md:hidden">
          <nav className="flex flex-col gap-4" aria-label="Navegação principal">
            {menu.map((m) => (
              <Link key={m.href} href={m.href} className="oz-nav-link self-start">
                {m.label}
              </Link>
            ))}
            <span className="mt-2 flex flex-col gap-4 border-t border-line pt-4">{acoes}</span>
          </nav>
        </div>
      )}
    </>
  )
}
