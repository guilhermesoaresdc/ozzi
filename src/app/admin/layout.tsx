import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSettings, getUsuario } from '@/lib/queries'
import { Sidebar, type ItemNav } from '@/components/admin/Sidebar'

export const metadata = {
  title: 'Painel da loja',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sessao = await getUsuario()
  // O middleware já barra quem não é admin; esta é a segunda tranca.
  if (!sessao?.user) redirect('/entrar?proximo=/admin')
  if (sessao.profile?.role !== 'admin') redirect('/')

  const supabase = await createClient()
  const [{ count: abertos }, { count: banners }, settings] = await Promise.all([
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .in('status', ['aguardando_pagamento', 'pago', 'em_separacao', 'sob_encomenda']),
    supabase.from('banners').select('id', { count: 'exact', head: true }).eq('ativo', true),
    getSettings(),
  ])

  const itens: ItemNav[] = [
    { href: '/admin', rotulo: 'Visão geral' },
    { href: '/admin/pedidos', rotulo: 'Pedidos', badge: abertos ?? 0 },
    { href: '/admin/produtos', rotulo: 'Produtos' },
    { href: '/admin/produtos/novo', rotulo: 'Novo produto' },
    { href: '/admin/banners', rotulo: 'Banners e avisos', badge: banners ?? 0 },
    { href: '/admin/email', rotulo: 'E-mail marketing' },
    { href: '/admin/clientes', rotulo: 'Clientes' },
    { href: '/admin/configuracoes', rotulo: 'Configurações' },
  ]

  const dominio = settings.email.split('@')[1] ?? 'ozzi.com.br'

  return (
    <div className="flex min-h-screen flex-col items-stretch lg:flex-row">
      <Sidebar itens={itens} nome={sessao.profile?.nome || 'Administrador'} email={dominio} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  )
}
