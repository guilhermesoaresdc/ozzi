import { ProductCard } from '@/components/loja/ProductCard'
import { SectionHeader } from '@/components/loja/SectionHeader'
import { getCombinaCom } from '@/lib/queries'

const GRADE = {
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))',
  gap: '22px 16px',
} as const

const SIZES = '(max-width: 640px) 100vw, (max-width: 1100px) 33vw, 25vw'

/** Vitrine cruzada: peças de outras categorias, em cartão reduzido. */
export async function CombinaCom({
  categoriaId,
  excluirId,
  limite = 4,
}: {
  categoriaId: string | null
  excluirId: string
  limite?: number
}) {
  const lista = await getCombinaCom(categoriaId, excluirId, limite)
  if (lista.length === 0) return null

  return (
    <section style={{ paddingTop: 76 }}>
      <div style={{ marginBottom: 24 }}>
        <SectionHeader titulo="Combina com" tamanhoTitulo={34} />
      </div>
      <div className="grid" style={GRADE}>
        {lista.map((p) => (
          <ProductCard key={p.id} produto={p} reduzido sizes={SIZES} />
        ))}
      </div>
    </section>
  )
}

/** Enquanto a consulta cruzada não volta — mesma caixa, sem salto de layout. */
export function CombinaComSkeleton({ quantidade = 4 }: { quantidade?: number }) {
  return (
    <section style={{ paddingTop: 76 }} role="status" aria-live="polite">
      <span className="sr-only">Carregando peças que combinam</span>
      <div className="animate-pulse" aria-hidden="true">
        <div
          className="bg-surface-sunken"
          style={{ width: 210, height: 30, maxWidth: '100%', marginBottom: 24 }}
        />
        <div className="grid" style={GRADE}>
          {Array.from({ length: quantidade }, (_, i) => (
            <div key={i} className="flex flex-col">
              <div style={{ aspectRatio: '3/4', background: '#FAF7F2', boxShadow: '0 0 0 1px #DFD8CB' }} />
              <div className="flex flex-col gap-[9px]" style={{ padding: '13px 2px 0' }}>
                <div className="bg-surface-sunken" style={{ height: 11, width: '62%' }} />
                <div className="bg-surface-sunken" style={{ height: 14, width: '34%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
