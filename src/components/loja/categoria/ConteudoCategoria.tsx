import Link from 'next/link'
import { getProdutosDaCategoria, getSettings, type Ordenacao, type ProdutoResumo } from '@/lib/queries'
import { createClient } from '@/lib/supabase/server'
import { CabecalhoCategoria } from './CabecalhoCategoria'
import { EstadoVazio } from './EstadoVazio'
import { VitrineCategoria } from './VitrineCategoria'
import { montarFiltros, ordenarTamanhos, subtituloDaCategoria, type ProdutoNaGrade } from './facetas'

/**
 * Numerações e aceite de encomenda por peça — o que a barra de filtros precisa
 * e o resumo da categoria não traz. Consulta própria, sem tocar em queries.ts.
 */
async function detalhesDasPecas(ids: string[]) {
  const supabase = await createClient()
  const [{ data: variantes }, { data: produtos }] = await Promise.all([
    supabase.from('variants').select('product_id, tamanho, estoque').in('product_id', ids),
    supabase.from('products').select('id, aceita_encomenda').in('id', ids),
  ])

  const numeracoes = new Map<string, { todas: Set<string>; emEstoque: Set<string> }>()
  for (const v of variantes ?? []) {
    const atual = numeracoes.get(v.product_id) ?? { todas: new Set<string>(), emEstoque: new Set<string>() }
    atual.todas.add(v.tamanho)
    if (v.estoque > 0) atual.emEstoque.add(v.tamanho)
    numeracoes.set(v.product_id, atual)
  }

  const encomenda = new Map<string, boolean>(
    (produtos ?? []).map((p) => [p.id, p.aceita_encomenda] as const),
  )
  return { numeracoes, encomenda }
}

async function montarGrade(produtos: ProdutoResumo[]): Promise<ProdutoNaGrade[]> {
  if (produtos.length === 0) return []
  const { numeracoes, encomenda } = await detalhesDasPecas(produtos.map((p) => p.id))

  return produtos.map((produto) => {
    const n = numeracoes.get(produto.id)
    return {
      produto,
      tamanhos: ordenarTamanhos(n?.todas ?? []),
      tamanhosEmEstoque: ordenarTamanhos(n?.emEstoque ?? []),
      cores: produto.cores.map((c) => c.nome),
      prontaEntrega: produto.prontaEntrega,
      aceitaEncomenda: encomenda.get(produto.id) ?? false,
    }
  })
}

export async function ConteudoCategoria({
  slug,
  nome,
  ordenacao,
}: {
  slug: string
  nome: string
  ordenacao: Ordenacao
}) {
  const [produtos, settings] = await Promise.all([
    getProdutosDaCategoria(slug, ordenacao),
    getSettings(),
  ])
  const itens = await montarGrade(produtos)
  const filtros = montarFiltros(itens)

  return (
    <>
      <CabecalhoCategoria nome={nome} subtitulo={subtituloDaCategoria(itens)} ordenacao={ordenacao} />

      {itens.length === 0 ? (
        <EstadoVazio
          chapeu="Estamos repondo"
          titulo={`Nenhuma peça de ${nome.toLowerCase()} no site agora`}
          texto="A reposição chega toda semana e o que aparece aqui já está no estoque da loja. Enquanto isso, dá uma olhada nas novidades ou fale com a gente para encomendar."
        >
          <Link href="/novidades" className="oz-btn oz-btn-primary">
            Ver novidades
          </Link>
          <Link href="/sobre" className="oz-btn oz-btn-outline">
            Falar com a Ozzi
          </Link>
        </EstadoVazio>
      ) : (
        <VitrineCategoria itens={itens} filtros={filtros} parcelas={settings.parcelas_max} />
      )}
    </>
  )
}
