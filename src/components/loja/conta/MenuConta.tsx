'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/** A navegação vertical da conta (handoff §5.8), na ordem do protótipo. */
const ITENS = [
  { href: '/conta/pedidos', rotulo: 'Meus pedidos' },
  { href: '/conta/dados', rotulo: 'Meus dados' },
  { href: '/conta/enderecos', rotulo: 'Endereços' },
  { href: '/conta/favoritos', rotulo: 'Favoritos' },
  { href: '/conta/trocas', rotulo: 'Trocas e devoluções' },
]

const TIPOGRAFIA = { fontSize: 13, letterSpacing: '.06em' } as const

export function MenuConta() {
  const pathname = usePathname()

  return (
    <nav aria-label="Minha conta" className="flex flex-col" style={{ gap: 13 }}>
      {ITENS.map((item) => {
        // O detalhe do pedido continua sendo "Meus pedidos".
        const ativo = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={ativo ? 'page' : undefined}
            className={
              ativo
                ? 'self-start text-[#232320]'
                : 'self-start text-[#6B665C] hover:text-[#8A6A4F]'
            }
            style={TIPOGRAFIA}
          >
            {item.rotulo}
          </Link>
        )
      })}

      {/* Sair encerra a sessão — POST, nunca um link visitável. */}
      <form action="/auth/sair" method="post">
        <button
          type="submit"
          className="cursor-pointer bg-transparent p-0 text-left text-[#6B665C] hover:text-[#8A6A4F]"
          style={{ ...TIPOGRAFIA, border: 'none' }}
        >
          Sair
        </button>
      </form>
    </nav>
  )
}
