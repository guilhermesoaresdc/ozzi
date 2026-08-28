import type { Ordenacao } from '@/lib/queries'
import { OrdenacaoSelect } from './OrdenacaoSelect'

/**
 * O bloco de título da categoria. `carregando` mantém a mesma caixa enquanto a
 * contagem real e a ordenação ainda estão vindo do banco.
 */
export function CabecalhoCategoria({
  nome,
  subtitulo,
  ordenacao = 'relevancia',
  carregando = false,
}: {
  nome: string
  subtitulo?: string
  ordenacao?: Ordenacao
  carregando?: boolean
}) {
  return (
    <div
      className="flex flex-wrap items-end justify-between gap-x-5 gap-y-4 border-b border-line"
      style={{ paddingBottom: 20, marginBottom: 28 }}
    >
      <div>
        <h1
          className="font-display"
          style={{
            fontWeight: 300,
            fontSize: 'clamp(38px, 4.4vw, 52px)',
            lineHeight: 1.04,
            letterSpacing: '-.015em',
            textWrap: 'balance',
          }}
        >
          {nome}
        </h1>
        {carregando ? (
          <span
            aria-hidden
            className="mt-[11px] block animate-pulse bg-surface-sunken"
            style={{ width: 246, height: 11, maxWidth: '100%' }}
          />
        ) : (
          <p className="text-body" style={{ fontSize: 14, marginTop: 8, textWrap: 'pretty' }}>
            {subtitulo}
          </p>
        )}
      </div>

      {carregando ? (
        <span
          aria-hidden
          className="block animate-pulse border border-line-input bg-surface-sunken"
          style={{ width: 208, height: 38 }}
        />
      ) : (
        <OrdenacaoSelect valor={ordenacao} />
      )}
    </div>
  )
}
