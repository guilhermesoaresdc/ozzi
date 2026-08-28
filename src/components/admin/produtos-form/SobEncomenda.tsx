'use client'

import { CheckSquare } from '@/components/ui/Checkbox'
import { ESTILO_SELECT } from './Campos'
import { PRAZOS } from './dados'

export function SobEncomenda({
  aceita,
  onAceita,
  prazo,
  onPrazo,
}: {
  aceita: boolean
  onAceita: (aceita: boolean) => void
  prazo: number
  onPrazo: (prazo: number) => void
}) {
  return (
    <section className="oz-card" style={{ padding: 22 }}>
      <h2 className="font-display" style={{ fontSize: 20, fontWeight: 400, marginBottom: 14 }}>
        Sob encomenda
      </h2>
      <p style={{ fontSize: 12.5, lineHeight: 1.65, color: '#5C574D', marginBottom: 14 }}>
        Se ativado, a peça continua vendável quando o estoque zera, com aviso de prazo na página do produto.
      </p>

      <div className="flex flex-col gap-[10px]">
        <label
          className="flex cursor-pointer items-center gap-[10px] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink"
          style={{ fontSize: 13.5 }}
        >
          <input
            type="checkbox"
            name="aceita_encomenda"
            checked={aceita}
            onChange={(e) => onAceita(e.target.checked)}
            className="sr-only"
          />
          <CheckSquare checked={aceita} size={13} />
          Aceitar encomenda
        </label>

        <label className="flex flex-col gap-[7px]">
          <span className="oz-label">Prazo de produção</span>
          <select
            name="prazo"
            value={prazo}
            onChange={(e) => onPrazo(Number(e.target.value))}
            style={ESTILO_SELECT}
          >
            {PRAZOS.map((p) => (
              <option key={p.valor} value={p.valor}>
                {p.rotulo}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  )
}
