import type { Metadata } from 'next'
import { PageHeader } from '@/components/admin/PageHeader'
import { Tabs, type Aba } from '@/components/admin/Tabs'
import { TabelaProdutos } from '@/components/admin/produtos/TabelaProdutos'
import { Paginacao } from '@/components/admin/produtos/Paginacao'
import {
  ABAS_PRODUTO,
  contarProdutosPorAba,
  listarProdutos,
  resumoEstoque,
  type AbaProduto,
  type ProdutoAdmin,
} from '@/lib/admin-queries'
import { num } from '@/lib/format'

export const metadata: Metadata = { title: 'Produtos' }

type Busca = Promise<{ [chave: string]: string | string[] | undefined }>

const POR_PAGINA = 8

const ROTULOS: Record<AbaProduto, string> = {
  todos: 'Todos',
  ativos: 'Ativos',
  encomenda: 'Sob encomenda',
  rascunhos: 'Rascunhos',
}

const VAZIOS: Record<AbaProduto, string> = {
  todos: 'Nenhuma peça cadastrada ainda.',
  ativos: 'Nenhuma peça ativa na vitrine agora.',
  encomenda: 'Nenhuma peça sob encomenda — todas as grades têm numeração disponível.',
  rascunhos: 'Nenhum rascunho aberto.',
}

const CHAVES = Object.keys(ABAS_PRODUTO) as AbaProduto[]

function lerAba(valor: string | string[] | undefined): AbaProduto {
  const bruto = Array.isArray(valor) ? valor[0] : valor
  return CHAVES.find((c) => c === bruto) ?? 'todos'
}

function lerPagina(valor: string | string[] | undefined, totalPaginas: number): number {
  const bruto = Array.isArray(valor) ? valor[0] : valor
  const n = Number.parseInt(bruto ?? '', 10)
  if (!Number.isFinite(n)) return 1
  return Math.min(Math.max(n, 1), totalPaginas)
}

/** Peças que a cliente pode vender hoje: ativas e com pelo menos uma numeração em estoque. */
function contarProntaEntrega(produtos: ProdutoAdmin[]): number {
  return produtos.filter((p) => p.status === 'ativo' && resumoEstoque(p.variants ?? []).total > 0).length
}

export default async function ProdutosPage({ searchParams }: { searchParams: Busca }) {
  const { aba, pagina } = await searchParams
  const atual = lerAba(aba)

  const [contagens, produtos] = await Promise.all([contarProdutosPorAba(), listarProdutos(atual)])
  const catalogo = atual === 'todos' ? produtos : await listarProdutos('todos')

  const total = produtos.length
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA))
  const paginaAtual = lerPagina(pagina, totalPaginas)
  const inicio = (paginaAtual - 1) * POR_PAGINA
  const daPagina = produtos.slice(inicio, inicio + POR_PAGINA)

  const abas: Aba[] = CHAVES.map((chave) => ({
    chave,
    rotulo: ROTULOS[chave],
    contagem: contagens[chave],
  }))

  return (
    <>
      <PageHeader
        titulo="Produtos"
        subtitulo={`${num(contagens.todos)} peças cadastradas · ${num(contarProntaEntrega(catalogo))} em pronta entrega`}
      />

      <main style={{ padding: '26px 30px 60px' }}>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3" style={{ marginBottom: 20 }}>
          <Tabs abas={abas} ativa={atual} base="/admin/produtos" />
          <span className="uppercase" style={{ fontSize: 11, letterSpacing: '.14em', color: '#8A8375' }}>
            Filtro: {ROTULOS[atual]}
          </span>
        </div>

        <div className="oz-card">
          <TabelaProdutos produtos={daPagina} vazio={VAZIOS[atual]} />
          {total > 0 && (
            <Paginacao
              aba={atual}
              pagina={paginaAtual}
              totalPaginas={totalPaginas}
              mostrando={daPagina.length}
              total={total}
            />
          )}
        </div>
      </main>
    </>
  )
}
