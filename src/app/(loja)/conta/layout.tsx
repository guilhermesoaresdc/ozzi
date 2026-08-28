import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getUsuario } from '@/lib/queries'
import { MenuConta } from '@/components/loja/conta/MenuConta'

export const metadata: Metadata = {
  // A conta é pessoal: fora do índice, como a sacola e o checkout.
  robots: { index: false, follow: false },
}

export default async function ContaLayout({ children }: { children: React.ReactNode }) {
  // O middleware já barra quem não entrou; esta é a segunda tranca, no servidor.
  const sessao = await getUsuario()
  if (!sessao?.user) redirect('/entrar?proximo=/conta/pedidos')

  const nome = sessao.profile?.nome?.trim() || (sessao.user.email ?? '').split('@')[0] || 'você'

  return (
    <div style={{ width: '100%', maxWidth: 1180, margin: '0 auto', padding: '44px 28px 92px' }}>
      <div
        className="grid items-start"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: 44,
        }}
      >
        <aside style={{ maxWidth: 230 }}>
          <div style={{ paddingBottom: 20, borderBottom: '1px solid #DFD8CB', marginBottom: 20 }}>
            <p
              className="uppercase"
              style={{ fontSize: 11, letterSpacing: '.14em', color: '#8A8375', marginBottom: 6 }}
            >
              Olá,
            </p>
            <p className="font-display" style={{ fontSize: 26, lineHeight: 1.14 }}>
              {nome}
            </p>
          </div>

          <MenuConta />
        </aside>

        <div style={{ gridColumn: 'span 3', minWidth: 0 }}>{children}</div>
      </div>
    </div>
  )
}
