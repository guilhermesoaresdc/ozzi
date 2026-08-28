import { Card } from '@/components/admin/Card'
import type { OrderEventRow } from '@/lib/database.types'
import { hora, rotuloDia } from '@/lib/format'

export function CartaoHistorico({ eventos }: { eventos: OrderEventRow[] }) {
  return (
    <Card
      semPadding
      titulo={
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 400 }}>
          Histórico
        </h2>
      }
    >
      <div style={{ padding: '6px 22px 18px' }}>
        {eventos.length === 0 ? (
          <p style={{ fontSize: 13, color: '#8A8375', padding: '14px 0' }}>
            Nada registrado neste pedido ainda.
          </p>
        ) : (
          <ol>
            {eventos.map((evento, i) => (
              <li
                key={evento.id}
                className="flex gap-[14px]"
                style={{
                  padding: '14px 0',
                  borderBottom: i === eventos.length - 1 ? undefined : '1px solid #E4DDD1',
                }}
              >
                <span
                  className="shrink-0"
                  style={{ width: 104, fontSize: 11.5, color: evento.previsto ? '#9A9385' : '#8A8375' }}
                >
                  {evento.previsto
                    ? `Previsto · ${evento.rotulo_tempo ?? hora(evento.criado_em)}`
                    : `${rotuloDia(evento.criado_em)} · ${hora(evento.criado_em)}`}
                </span>
                <span className="flex min-w-0 flex-col gap-[3px]">
                  <span style={{ fontSize: 13.5, color: evento.previsto ? '#8A8375' : '#232320' }}>
                    {evento.titulo}
                  </span>
                  {evento.autor && (
                    <span style={{ fontSize: 11.5, color: evento.previsto ? '#9A9385' : '#8A8375' }}>
                      {evento.autor}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Card>
  )
}
