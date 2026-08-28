import { Kpi } from '@/components/admin/Card'
import type { KpisClientes as Numeros } from '@/components/admin/clientes/dados'
import { num, pct } from '@/lib/format'

const NEUTRO = '#8A8375'
const VERDE = '#5C7A5E'
const AMBAR = '#8A6A4F'

export function KpisClientes({ numeros }: { numeros: Numeros }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 1 }}>
      <Kpi
        label="Clientes cadastrados"
        valor={num(numeros.total)}
        tendencia={
          numeros.comPedido > 0
            ? `${num(numeros.comPedido)} já compraram alguma vez`
            : 'ninguém comprou ainda'
        }
        cor={NEUTRO}
      />
      <Kpi
        label="Compram novamente"
        valor={pct(numeros.pctRecorrentes)}
        tendencia={
          numeros.recorrentes > 0
            ? `${num(numeros.recorrentes)} com 2 pedidos ou mais`
            : 'ninguém voltou para um segundo pedido'
        }
        cor={numeros.recorrentes > 0 ? VERDE : NEUTRO}
      />
      <Kpi
        label="Do Cariri"
        valor={pct(numeros.pctCariri)}
        tendencia={`${num(numeros.cariri)} de ${num(numeros.total)} cadastros`}
        cor={AMBAR}
      />
      <Kpi
        label="Clube Ozzi"
        valor={num(numeros.clube)}
        tendencia={`${pct(numeros.pctClube)} da base`}
        cor={NEUTRO}
      />
    </div>
  )
}
