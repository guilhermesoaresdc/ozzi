import { ProductCard } from '@/components/loja/ProductCard'
import { EstadoVazio } from '@/components/loja/home/EstadoVazio'
import type { ProdutoResumo } from '@/lib/queries'

/** Grade de produto compartilhada pela home e por /novidades (handoff §5.1 e §5.2). */
export function GradeProdutos({
  produtos,
  parcelas = 6,
  minimo = 230,
  espacamento = '22px 16px',
  sizes,
  prioritarios = 0,
  vazio,
}: {
  produtos: ProdutoResumo[]
  parcelas?: number
  /** Largura mínima do card — o minmax de cada grade do handoff. */
  minimo?: number
  espacamento?: string
  sizes?: string
  /** Quantos cards recebem `priority` na imagem. */
  prioritarios?: number
  vazio?: { titulo: string; texto: string; acao?: { href: string; label: string } }
}) {
  if (produtos.length === 0) {
    return (
      <EstadoVazio
        titulo={vazio?.titulo ?? 'Nenhuma peça por aqui'}
        texto={vazio?.texto ?? 'Estamos repondo o estoque. Volte em instantes ou veja as outras categorias.'}
        acao={vazio?.acao}
      />
    )
  }

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${minimo}px), 1fr))`,
        gap: espacamento,
      }}
    >
      {produtos.map((p, i) => (
        <ProductCard
          key={p.id}
          produto={p}
          parcelas={parcelas}
          sizes={sizes}
          priority={i < prioritarios}
        />
      ))}
    </div>
  )
}
