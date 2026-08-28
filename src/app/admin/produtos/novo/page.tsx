import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/admin/PageHeader'
import { ProdutoForm } from '@/components/admin/produtos-form/ProdutoForm'
import { listarCategorias } from '@/lib/admin-queries'

export const metadata: Metadata = { title: 'Novo produto' }

export default async function NovoProdutoPage() {
  const categorias = await listarCategorias()

  return (
    <>
      <PageHeader
        titulo="Novo produto"
        subtitulo="Cadastre a peça, a grade de numeração e as fotos"
        acao={
          <Link
            href="/admin/produtos"
            className="oz-btn oz-btn-tertiary"
            style={{ padding: '13px 22px', fontSize: 11, letterSpacing: '.14em' }}
          >
            Todos os produtos
          </Link>
        }
      />

      <main style={{ padding: '26px 30px 60px' }}>
        <ProdutoForm categorias={categorias.map((c) => ({ id: c.id, nome: c.nome }))} />
      </main>
    </>
  )
}
