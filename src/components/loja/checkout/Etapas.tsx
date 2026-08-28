import Link from 'next/link'

const ETAPAS = [
  { numero: 1, rotulo: 'Sacola', href: '/sacola' },
  { numero: 2, rotulo: 'Entrega e pagamento', href: '/checkout' },
  { numero: 3, rotulo: 'Confirmação', href: null },
] as const

/**
 * Indicador de etapas do checkout (handoff §5.6): numeral em círculo de 22px
 * com fio de 1px da mesma cor do texto.
 */
export function Etapas({ atual, linkarAnteriores = false }: { atual: 2 | 3; linkarAnteriores?: boolean }) {
  return (
    <nav
      aria-label="Etapas do checkout"
      className="border-b border-line"
      style={{ paddingBottom: 20, marginBottom: 28 }}
    >
      <ol className="flex flex-wrap items-center" style={{ gap: '10px 26px' }}>
        {ETAPAS.map((etapa) => {
          const ativa = etapa.numero === atual
          const cor = ativa ? '#232320' : '#8A8375'
          const conteudo = (
            <>
              <span
                aria-hidden
                className="inline-flex shrink-0 items-center justify-center"
                style={{ width: 22, height: 22, border: `1px solid ${cor}`, fontSize: 11 }}
              >
                {etapa.numero}
              </span>
              <span className="uppercase" style={{ fontSize: 11.5, letterSpacing: '.14em' }}>
                {etapa.rotulo}
              </span>
            </>
          )

          const voltar = linkarAnteriores && etapa.href && etapa.numero < atual

          return (
            <li key={etapa.numero} style={{ color: cor }}>
              {voltar && etapa.href ? (
                <Link
                  href={etapa.href}
                  className="flex items-center"
                  style={{ gap: 10, color: cor }}
                  aria-label={`Voltar para a etapa ${etapa.numero}, ${etapa.rotulo}`}
                >
                  {conteudo}
                </Link>
              ) : (
                <span
                  className="flex items-center"
                  style={{ gap: 10 }}
                  aria-current={ativa ? 'step' : undefined}
                >
                  {conteudo}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
