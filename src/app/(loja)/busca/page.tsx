import type { Metadata } from 'next'
import { buscarProdutos, type ProdutoResumo } from '@/lib/queries'
import { PainelBusca } from '@/components/loja/busca/PainelBusca'

type Busca = Promise<{ [chave: string]: string | string[] | undefined }>

export const metadata: Metadata = {
  title: 'Busca',
  description:
    'Procure por peça, cor ou referência no estoque da Ozzi. Tudo que aparece aqui está em pronta entrega no Centro de Várzea Alegre.',
  alternates: { canonical: '/busca' },
  // Página de resultado não entra no índice; os produtos já estão no sitemap.
  robots: { index: false, follow: true },
}

/** Mesma limpeza da rota /api/busca: vírgula e parêntese quebram o filtro do PostgREST. */
function limparTermo(bruto: string): string {
  return bruto
    .replace(/[,()"\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60)
}

export default async function BuscaPage({ searchParams }: { searchParams: Busca }) {
  const { q } = await searchParams
  const termo = limparTermo(Array.isArray(q) ? (q[0] ?? '') : (q ?? ''))

  // `null` avisa o painel de que o servidor não conseguiu buscar — ele refaz
  // a consulta no navegador em vez de mostrar "nada encontrado".
  let produtos: ProdutoResumo[] | null = []
  if (termo) {
    try {
      produtos = await buscarProdutos(termo)
    } catch {
      produtos = null
    }
  }

  return (
    <div
      className="w-full"
      style={{ maxWidth: 1000, margin: '0 auto', padding: '56px 28px 92px' }}
    >
      <PainelBusca termoInicial={termo} resultadosIniciais={produtos} />
    </div>
  )
}
