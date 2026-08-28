import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCategoria, type Ordenacao } from '@/lib/queries'
import { ConteudoCategoria } from '@/components/loja/categoria/ConteudoCategoria'
import { EsqueletoCategoria } from '@/components/loja/categoria/EsqueletoCategoria'

type Params = Promise<{ categoria: string }>
type Busca = Promise<{ [chave: string]: string | string[] | undefined }>

const ORDENACOES: Ordenacao[] = ['relevancia', 'menor-preco', 'maior-preco', 'novidades']

function lerOrdem(valor: string | string[] | undefined): Ordenacao {
  const bruto = Array.isArray(valor) ? valor[0] : valor
  return ORDENACOES.find((o) => o === bruto) ?? 'relevancia'
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { categoria } = await params
  const cat = await getCategoria(categoria)
  if (!cat) return { title: 'Categoria não encontrada' }

  const descricao = `${cat.nome} em pronta entrega na Ozzi, no Centro de Várzea Alegre. Retirada combinada em até 2 horas, motoboy local e Correios para todo o Brasil.`
  return {
    title: cat.nome,
    description: descricao,
    alternates: { canonical: `/${cat.slug}` },
    openGraph: { title: `${cat.nome} · Ozzi`, description: descricao, type: 'website' },
  }
}

export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: Busca
}) {
  const { categoria } = await params
  const { ordem } = await searchParams
  const cat = await getCategoria(categoria)
  if (!cat) notFound()

  const ordenacao = lerOrdem(ordem)

  return (
    <div className="shell" style={{ paddingTop: 24, paddingBottom: 92 }}>
      <nav
        aria-label="Trilha de navegação"
        className="uppercase"
        style={{ fontSize: 11, letterSpacing: '.1em', color: '#8A8375', marginBottom: 24 }}
      >
        <Link href="/" className="text-muted hover:text-accent">
          Início
        </Link>
        <span aria-hidden style={{ padding: '0 7px' }}>
          /
        </span>
        <span aria-current="page" className="text-ink">
          {cat.nome}
        </span>
      </nav>

      {/* Sem `key`: ao reordenar, a grade atual fica na tela e os filtros escolhidos continuam de pé. */}
      <Suspense fallback={<EsqueletoCategoria nome={cat.nome} />}>
        <ConteudoCategoria slug={cat.slug} nome={cat.nome} ordenacao={ordenacao} />
      </Suspense>
    </div>
  )
}
