import { Card } from '@/components/admin/Card'
import { brl } from '@/lib/format'
import { EstadoVazio } from '@/components/admin/visao/EstadoVazio'
import type { DiaDeVenda } from '@/lib/admin-queries'

const ALTURA = 172
/** Dia sem venda ainda precisa aparecer: fio de 2px na base. */
const MINIMA = 2

export function GraficoVendas({ serie, ticketMedio }: { serie: DiaDeVenda[]; ticketMedio: number }) {
  const maior = serie.reduce((m, d) => Math.max(m, d.receita), 0)

  return (
    <Card
      titulo="Vendas dos últimos 14 dias"
      acao={<span style={{ fontSize: 12, color: '#8A8375' }}>Ticket médio {brl(ticketMedio)}</span>}
      semPadding
    >
      {maior === 0 ? (
        <EstadoVazio texto="Nenhuma venda registrada nos últimos 14 dias." />
      ) : (
        <div style={{ padding: '26px 22px 18px' }}>
          <div className="flex items-end" style={{ gap: 6 }}>
            {serie.map((d, i) => (
              <div
                key={d.dia}
                title={`${d.rotulo} · ${brl(d.receita)}`}
                className="flex min-w-0 flex-1 flex-col"
              >
                <div className="flex items-end" style={{ height: ALTURA }}>
                  <div
                    style={{
                      width: '100%',
                      height: Math.max(MINIMA, Math.round((d.receita / maior) * ALTURA)),
                      background: i === serie.length - 1 ? '#8A6A4F' : '#C9BFAD',
                    }}
                  />
                </div>
                <span className="mt-[6px] text-center" style={{ fontSize: 9.5, color: '#9A9385' }}>
                  {d.dia}
                </span>
                <span className="sr-only">{`${d.rotulo}: ${brl(d.receita)}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
