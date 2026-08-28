import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/admin/PageHeader'
import { ProdutoForm } from '@/components/admin/produtos-form/ProdutoForm'
import { listarCategorias, resumoEstoque } from '@/lib/admin-queries'
import type { ProductRow, VariantRow } from '@/lib/database.types'
import { num } from '@/lib/format'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Editar produto' }

const UUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

type Parametros = Promise<{ id: string }>

type ProdutoParaEditar = ProductRow & {
  categories: { nome: string } | null
  variants: VariantRow[]
}

export default async function EditarProdutoPage({ params }: { params: Parametros }) {
  const { id } = await params
  if (!UUID.test(id)) notFound()

  const supabase = await createClient()
  const [{ data }, categorias] = await Promise.all([
    supabase.from('products').select('*, categories(nome), variants(*)').eq('id', id).maybeSingle(),
    listarCategorias(),
  ])
  if (!data) notFound()

  const { categories, variants, ...produto } = data as unknown as ProdutoParaEditar
  const variantes = variants ?? []
  const resumo = resumoEstoque(variantes)
  const estoque =
    resumo.total > 0 ? `${num(resumo.total)} ${resumo.total === 1 ? 'peça' : 'peças'} em estoque` : 'grade zerada'

  return (
    <>
      <PageHeader
        titulo={produto.nome}
        subtitulo={`${produto.ref} · ${categories?.nome ?? 'Sem categoria'} · ${estoque}`}
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
        <ProdutoForm
          categorias={categorias.map((c) => ({ id: c.id, nome: c.nome }))}
          produto={produto}
          variantes={variantes}
        />
      </main>
    </>
  )
}
