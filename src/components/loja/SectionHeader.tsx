import Link from 'next/link'

export function SectionHeader({
  chapeu,
  titulo,
  link,
  linkLabel,
  tamanhoTitulo = 36,
}: {
  chapeu?: string
  titulo: string
  link?: string
  linkLabel?: string
  tamanhoTitulo?: number
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
      <div className="flex flex-col gap-[10px]">
        {chapeu && <span className="oz-eyebrow">{chapeu}</span>}
        <h2
          className="font-display"
          style={{ fontSize: tamanhoTitulo, fontWeight: 300, lineHeight: 1.05, letterSpacing: '-.015em' }}
        >
          {titulo}
        </h2>
      </div>
      {link && linkLabel && (
        <Link
          href={link}
          className="uppercase"
          style={{ fontSize: 11.5, letterSpacing: '.14em', borderBottom: '1px solid #232320', paddingBottom: 3 }}
        >
          {linkLabel}
        </Link>
      )}
    </div>
  )
}
