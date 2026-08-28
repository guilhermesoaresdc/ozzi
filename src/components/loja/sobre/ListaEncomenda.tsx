import Link from 'next/link'
import { ProductCard } from '@/components/loja/ProductCard'
import { Aviso } from '@/components/loja/sobre/Aviso'
import { paraResumo, type ProdutoResumo } from '@/lib/queries'
import { createClient } from '@/lib/supabase/server'

type LinhaProduto = Parameters<typeof paraResumo>[0]

const CAMPOS =
  'id, slug, nome, ref, preco, preco_comparativo, selo, fotos, status, destaque, criado_em, category_id, tecido, descricao, medidas, peso, fornecedor, aceita_encomenda, prazo_encomenda_dias'

export interface PecaEncomenda extends ProdutoResumo {
  prazoDias: number
}

/**
 * Peças que aceitam encomenda e estão hoje sem nenhuma numeração no estoque.
 * O somatório por variante não dá para filtrar no PostgREST — a conta é feita
 * aqui, sobre as peças ativas que aceitam encomenda.
 */
export async function getPecasSobEncomenda(): Promise<PecaEncomenda[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select(`${CAMPOS}, categories(slug, nome), variants(*)`)
    .eq('status', 'ativo')
    .eq('aceita_encomenda', true)
    .order('nome', { ascending: true })

  const linhas = (data ?? []) as unknown as LinhaProduto[]
  return linhas
    .filter((p) => (p.variants?.length ?? 0) > 0 && (p.variants ?? []).every((v) => v.estoque <= 0))
    .map((p) => ({ ...paraResumo(p), prazoDias: p.prazo_encomenda_dias }))
}

export async function ListaEncomenda() {
  const pecas = await getPecasSobEncomenda()

  if (pecas.length === 0) {
    return (
      <Aviso
        chapeu="Nada em encomenda hoje"
        titulo="Toda a vitrine está em pronta entrega"
        texto="Nenhuma peça está com a grade esgotada neste momento: o que aparece no site sai hoje do estoque da loja."
      >
        <Link href="/novidades" className="oz-btn oz-btn-primary">
          Ver a vitrine
        </Link>
        <Link href="/sobre#contato" className="oz-btn oz-btn-tertiary">
          Falar com a loja
        </Link>
      </Aviso>
    )
  }

  return (
    <>
      <p
        className="uppercase"
        style={{ fontSize: 11.5, letterSpacing: '.14em', color: '#8A8375', marginBottom: 22 }}
      >
        {pecas.length} {pecas.length === 1 ? 'peça' : 'peças'} para encomendar
      </p>

      <ul
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 230px), 1fr))',
          gap: '22px 16px',
        }}
      >
        {pecas.map((p) => (
          <li key={p.id}>
            <ProductCard produto={p} sizes="(max-width: 640px) 100vw, (max-width: 1100px) 33vw, 230px" />
            <p
              className="uppercase"
              style={{
                fontSize: 11.5,
                letterSpacing: '.1em',
                color: '#8A6A4F',
                margin: '6px 2px 0',
              }}
            >
              Encomenda · até {p.prazoDias} dias úteis
            </p>
          </li>
        ))}
      </ul>
    </>
  )
}

/** Carregando a lista (handoff §7). */
export function EsqueletoEncomenda({ quantidade = 4 }: { quantidade?: number }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Carregando as peças em encomenda…</span>
      <div
        className="grid animate-pulse"
        aria-hidden
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 230px), 1fr))',
          gap: '22px 16px',
        }}
      >
        {Array.from({ length: quantidade }, (_, i) => (
          <div key={i} className="flex flex-col" style={{ gap: 10 }}>
            <span
              className="block"
              style={{ aspectRatio: '3/4', background: '#FAF7F2', boxShadow: '0 0 0 1px #DFD8CB' }}
            />
            <span className="block" style={{ height: 12, width: '64%', background: '#E9E3D9' }} />
            <span className="block" style={{ height: 12, width: '38%', background: '#E9E3D9' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
