import Link from 'next/link'
import { Placeholder } from '@/components/ui/Placeholder'
import { brl } from '@/lib/format'
import { valorParcela } from '@/lib/pricing'
import type { ProdutoResumo } from '@/lib/queries'

export function ProductCard({
  produto,
  reduzido = false,
  parcelas = 6,
  mostrarParcelamento = true,
  sizes,
  priority = false,
}: {
  produto: ProdutoResumo
  /** Só nome e preço — usado em "Combina com" e na Busca. */
  reduzido?: boolean
  parcelas?: number
  mostrarParcelamento?: boolean
  sizes?: string
  priority?: boolean
}) {
  const cores = produto.cores.map((c) => c.nome).join(' · ')

  return (
    <Link href={`/produto/${produto.slug}`} className="group block">
      <Placeholder
        label={`produto · ${produto.nome.toLowerCase()} · 520×690`}
        src={produto.foto}
        alt={produto.nome}
        ratio="3/4"
        sizes={sizes}
        priority={priority}
        className="transition-[filter] group-hover:brightness-[.965]"
      >
        {produto.selo && (
          <span
            className="absolute uppercase"
            style={{
              top: 13,
              left: 13,
              background: '#232320',
              color: '#F2EEE7',
              fontSize: 9,
              letterSpacing: '.16em',
              padding: '6px 9px',
            }}
          >
            {produto.selo}
          </span>
        )}
      </Placeholder>

      <div className="flex flex-col gap-[5px] pt-[13px] pr-[2px] pl-[2px]">
        <span style={{ fontSize: 14.5 }}>{produto.nome}</span>
        {!reduzido && cores && (
          <span style={{ fontSize: 11, color: '#8A8375' }}>{cores}</span>
        )}
        <span className="font-display" style={{ fontSize: 21, fontWeight: 400, lineHeight: 1.1 }}>
          {brl(produto.preco)}
        </span>
        {!reduzido && mostrarParcelamento && (
          <span style={{ fontSize: 11, color: '#8A8375' }}>
            {parcelas}x de {brl(valorParcela(produto.preco, parcelas))} sem juros
          </span>
        )}
      </div>
    </Link>
  )
}
