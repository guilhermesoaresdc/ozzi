'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Logo } from '@/components/ui/Logo'

export interface ItemNav {
  href: string
  rotulo: string
  badge?: number
}

export function Sidebar({
  itens,
  nome,
  email,
}: {
  itens: ItemNav[]
  nome: string
  email: string
}) {
  const pathname = usePathname()
  const [aberta, setAberta] = useState(false)

  useEffect(() => {
    setAberta(false)
  }, [pathname])

  const ativo = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  const conteudo = (
    <>
      <div className="border-b px-5 py-[18px]" style={{ borderColor: '#3A3730' }}>
        <Link href="/admin" className="flex items-center gap-[10px]">
          <Logo size={36} wordmark={18} tagline={false} invertida />
          <span className="sr-only">Painel da loja</span>
        </Link>
        <span
          className="mt-[6px] block uppercase"
          style={{ fontSize: 7.5, letterSpacing: '.2em', color: '#8F8A7E' }}
        >
          PAINEL DA LOJA
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-[2px] px-3 py-4" aria-label="Painel">
        {itens.map((i) => {
          const sel = ativo(i.href)
          return (
            <Link
              key={i.href}
              href={i.href}
              aria-current={sel ? 'page' : undefined}
              className="flex items-center justify-between px-3 py-[11px] transition-colors"
              style={{
                fontSize: 13.5,
                color: sel ? '#F2EEE7' : '#8F8A7E',
                background: sel ? '#312E28' : 'transparent',
              }}
            >
              {i.rotulo}
              {i.badge ? (
                <span
                  className="oz-pill inline-flex items-center justify-center px-[7px]"
                  style={{ background: '#8A6A4F', color: '#F2EEE7', fontSize: 10, minHeight: 17 }}
                >
                  {i.badge}
                </span>
              ) : null}
            </Link>
          )
        })}
      </nav>

      <div className="border-t px-5 py-[18px]" style={{ borderColor: '#3A3730' }}>
        <p style={{ fontSize: 13, color: '#F2EEE7' }}>{nome}</p>
        <p style={{ fontSize: 11, color: '#8F8A7E' }}>Administrador · {email}</p>
        <div className="mt-3 flex gap-4">
          <Link href="/" style={{ fontSize: 11, color: '#8F8A7E' }} className="hover:!text-[#F2EEE7]">
            Ver a loja
          </Link>
          <form action="/auth/sair" method="post">
            <button type="submit" style={{ fontSize: 11, color: '#8F8A7E' }} className="cursor-pointer hover:text-[#F2EEE7]">
              Sair
            </button>
          </form>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Barra de topo só no mobile: a sidebar vira menu deslizante */}
      <div
        className="sticky top-0 z-70 flex items-center justify-between px-5 py-3 lg:hidden"
        style={{ background: '#232320', color: '#F2EEE7' }}
      >
        <Link href="/admin" className="flex items-center">
          <Logo size={28} wordmark={15} tagline={false} invertida />
        </Link>
        <button
          type="button"
          onClick={() => setAberta((v) => !v)}
          aria-expanded={aberta}
          aria-controls="nav-painel"
          className="cursor-pointer uppercase"
          style={{ fontSize: 11, letterSpacing: '.16em' }}
        >
          {aberta ? 'Fechar' : 'Menu'}
        </button>
      </div>

      {aberta && (
        <div
          id="nav-painel"
          className="sticky top-[46px] z-70 flex w-full flex-col lg:hidden"
          style={{ background: '#232320', color: '#F2EEE7' }}
        >
          {conteudo}
        </div>
      )}

      <aside
        className="sticky top-0 hidden h-screen shrink-0 flex-col lg:flex"
        style={{ width: 238, background: '#232320', color: '#F2EEE7' }}
      >
        {conteudo}
      </aside>
    </>
  )
}
