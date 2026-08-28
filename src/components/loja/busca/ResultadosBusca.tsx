import { ProductCard } from '@/components/loja/ProductCard'
import type { ProdutoResumo } from '@/lib/queries'

/** Título com fio inferior + grade de cards reduzidos (handoff §5.4). */
export function ResultadosBusca({ termo, produtos }: { termo: string; produtos: ProdutoResumo[] }) {
  return (
    <section aria-label={`Resultados para ${termo}`}>
      <h2
        className="uppercase"
        style={{
          fontSize: 11,
          letterSpacing: '.16em',
          fontWeight: 500,
          color: '#8A8375',
          marginBottom: 18,
          paddingBottom: 12,
          borderBottom: '1px solid #DFD8CB',
        }}
      >
        Resultados para “{termo}”
      </h2>

      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))',
          gap: '24px 16px',
        }}
      >
        {produtos.map((p) => (
          <ProductCard
            key={p.id}
            produto={p}
            reduzido
            sizes="(max-width: 640px) 50vw, (max-width: 1000px) 33vw, 232px"
          />
        ))}
      </div>
    </section>
  )
}
