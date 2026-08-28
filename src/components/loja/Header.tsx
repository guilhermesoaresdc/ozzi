import Link from 'next/link'
import { getMenuCategories, getUsuario } from '@/lib/queries'
import { Logo } from '@/components/ui/Logo'
import { HeaderNav } from '@/components/loja/HeaderNav'

export async function Header() {
  const [categorias, sessao] = await Promise.all([getMenuCategories(), getUsuario()])

  const menu = [
    { label: 'Novidades', href: '/novidades' },
    ...categorias.map((c) => ({ label: c.nome, href: `/${c.slug}` })),
    { label: 'Sobre nós', href: '/sobre' },
  ]

  return (
    <header
      className="sticky top-0 z-60 border-b border-line"
      style={{ background: 'rgba(242,238,231,.93)', backdropFilter: 'blur(14px)' }}
    >
      <div className="shell flex flex-wrap items-center gap-x-[30px] gap-y-3 py-[14px]">
        <Link href="/" className="mr-auto flex items-center" aria-label="Ozzi · página inicial">
          <Logo />
        </Link>
        <HeaderNav menu={menu} autenticado={Boolean(sessao?.user)} admin={sessao?.profile?.role === 'admin'} />
      </div>
    </header>
  )
}
