import { Placeholder } from '@/components/ui/Placeholder'

/** As quatro tomadas da peça (handoff §5.3). As fotos reais entram por `fotos`. */
const TOMADAS = [
  { legenda: 'produto · frente · 900×1200', alt: 'frente' },
  { legenda: 'produto · costas · 900×1200', alt: 'costas' },
  { legenda: 'detalhe do tecido · 900×1200', alt: 'detalhe do tecido' },
  { legenda: 'look completo · 900×1200', alt: 'look completo' },
]

export function Galeria({ nome, fotos }: { nome: string; fotos: string[] }) {
  return (
    <div className="grid grid-cols-2" style={{ gap: 10, minWidth: 0 }}>
      {TOMADAS.map((t, i) => (
        <Placeholder
          key={t.legenda}
          label={t.legenda}
          src={fotos[i] ?? null}
          alt={`${nome} — ${t.alt}`}
          ratio="3/4"
          densidade="denso"
          sizes="(max-width: 900px) 50vw, 30vw"
          priority={i === 0}
        />
      ))}
    </div>
  )
}
