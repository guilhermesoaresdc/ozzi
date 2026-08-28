import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getUsuario } from '@/lib/queries'
import { ClubeOzzi } from '@/components/loja/entrar/ClubeOzzi'
import { PainelAcesso } from '@/components/loja/entrar/PainelAcesso'
import { destinoSeguro } from '@/components/loja/entrar/acesso'

type Busca = Promise<{ [chave: string]: string | string[] | undefined }>

export const metadata: Metadata = {
  title: 'Entrar',
  description:
    'Entre na sua conta Ozzi para acompanhar pedidos, salvar favoritos e finalizar a compra mais rápido.',
  alternates: { canonical: '/entrar' },
  // Tela de sessão: fora do índice, como a sacola.
  robots: { index: false, follow: true },
}

export default async function EntrarPage({ searchParams }: { searchParams: Busca }) {
  const [parametros, sessao] = await Promise.all([searchParams, getUsuario()])

  // O middleware manda para cá com ?proximo=/conta/pedidos.
  const bruto = parametros.proximo
  const destino = destinoSeguro(Array.isArray(bruto) ? bruto[0] : bruto)

  // Já autenticada: segue direto para onde o middleware queria levar.
  if (sessao?.user) redirect(destino)

  return (
    <div style={{ width: '100%', maxWidth: 1180, margin: '0 auto', padding: '52px 28px 92px' }}>
      <div
        className="grid items-start"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: 'clamp(28px, 4vw, 60px)',
        }}
      >
        <PainelAcesso proximo={destino} />
        <ClubeOzzi />
      </div>
    </div>
  )
}
