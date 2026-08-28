import { Kpi } from '@/components/admin/Card'
import { brl, num, pct } from '@/lib/format'
import type { VisaoGeral } from '@/lib/admin-queries'

const VERDE = '#5C7A5E'
const AMBAR = '#8A6A4F'
const VERMELHO = '#A0533F'
const NEUTRO = '#8A8375'

interface Tendencia {
  texto: string
  cor: string
}

function tendenciaVendas(hoje: number, ontem: number): Tendencia {
  if (ontem > 0) {
    const variacao = ((hoje - ontem) / ontem) * 100
    if (variacao >= 0) return { texto: `+${pct(variacao)} vs. ontem`, cor: VERDE }
    const queda = Math.abs(variacao)
    return { texto: `− ${pct(queda)} vs. ontem`, cor: queda >= 15 ? VERMELHO : AMBAR }
  }
  if (hoje > 0) return { texto: 'ontem não houve venda', cor: VERDE }
  return { texto: 'sem vendas hoje e ontem', cor: NEUTRO }
}

function tendenciaTicket(atual: number, anterior: number): Tendencia {
  const dif = atual - anterior
  if (Math.abs(dif) < 0.5) return { texto: 'estável em relação ao mês passado', cor: NEUTRO }
  if (dif > 0) return { texto: `+${brl(dif)} no mês`, cor: VERDE }
  return { texto: `− ${brl(Math.abs(dif))} no mês`, cor: AMBAR }
}

/**
 * Os 4 KPIs do topo. O handoff pede "Visitas na semana" no quarto cartão, mas o
 * projeto não tem analytics — no lugar entram as peças vendidas na semana, que o
 * banco sustenta.
 */
export function KpisVisao({ dados }: { dados: VisaoGeral }) {
  const vendas = tendenciaVendas(dados.vendasHoje, dados.vendasOntem)
  const ticket = tendenciaTicket(dados.ticketMedio, dados.ticketMedioMesPassado)
  const pedidosSemana = dados.pedidosNaSemana

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 1 }}>
      <Kpi label="Vendas hoje" valor={brl(dados.vendasHoje)} tendencia={vendas.texto} cor={vendas.cor} />
      <Kpi
        label="Pedidos abertos"
        valor={num(dados.pedidosAbertos)}
        tendencia={
          dados.aguardandoPagamento > 0
            ? `${num(dados.aguardandoPagamento)} aguardando pagamento`
            : 'nenhum aguardando pagamento'
        }
        cor={dados.aguardandoPagamento > 0 ? AMBAR : NEUTRO}
      />
      <Kpi label="Ticket médio" valor={brl(dados.ticketMedio)} tendencia={ticket.texto} cor={ticket.cor} />
      <Kpi
        label="Peças vendidas na semana"
        valor={num(dados.pecasNaSemana)}
        tendencia={
          pedidosSemana > 0
            ? `${num(pedidosSemana)} ${pedidosSemana === 1 ? 'pedido' : 'pedidos'} nos últimos 7 dias`
            : 'nenhum pedido nos últimos 7 dias'
        }
        cor={NEUTRO}
      />
    </div>
  )
}
