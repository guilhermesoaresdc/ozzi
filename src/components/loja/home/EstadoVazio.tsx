import Link from 'next/link'

/** Estado vazio / sem resultado — mesma linguagem visual do handoff §7. */
export function EstadoVazio({
  titulo,
  texto,
  acao,
}: {
  titulo: string
  texto: string
  acao?: { href: string; label: string }
}) {
  return (
    <div
      className="flex flex-col items-center gap-[14px] border border-line text-center"
      style={{ background: '#FAF7F2', padding: '64px 28px' }}
    >
      <p className="font-display" style={{ fontSize: 26, fontWeight: 400, lineHeight: 1.15 }}>
        {titulo}
      </p>
      <p className="text-pretty" style={{ fontSize: 13.5, lineHeight: 1.65, color: '#8A8375', maxWidth: 420 }}>
        {texto}
      </p>
      {acao && (
        <Link href={acao.href} className="oz-btn oz-btn-outline mt-2">
          {acao.label}
        </Link>
      )}
    </div>
  )
}
