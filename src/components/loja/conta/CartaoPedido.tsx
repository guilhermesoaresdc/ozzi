import Link from 'next/link'
import { Placeholder } from '@/components/ui/Placeholder'
import { brl, dataCurta } from '@/lib/format'
import { STATUS_PEDIDO } from '@/lib/status'
import { ComprarDeNovo } from '@/components/loja/conta/ComprarDeNovo'
import {
  acaoDoPedido,
  linhaEntrega,
  nomesDosItens,
  type ItemRecompra,
  type PedidoDaConta,
} from '@/components/loja/conta/tipos'

/** Botão do card: contorno de 1px, menor que o `.oz-btn` padrão (handoff §5.8). */
const BOTAO = { padding: '12px 20px', fontSize: 11, letterSpacing: '.14em' } as const

const MAX_MINIATURAS = 3

export function CartaoPedido({
  pedido,
  recompra = [],
}: {
  pedido: PedidoDaConta
  recompra?: ItemRecompra[]
}) {
  const status = STATUS_PEDIDO[pedido.status]
  const acao = acaoDoPedido(pedido.status)
  const miniaturas = pedido.itens.slice(0, MAX_MINIATURAS)
  const restantes = pedido.itens.length - miniaturas.length

  return (
    <article style={{ background: '#FAF7F2', border: '1px solid #DFD8CB' }}>
      <div
        className="flex flex-wrap justify-between"
        style={{
          gap: 16,
          padding: '16px 20px',
          borderBottom: '1px solid #DFD8CB',
          fontSize: 12,
          letterSpacing: '.08em',
        }}
      >
        <span style={{ color: '#8A8375' }}>
          Pedido #{pedido.codigo} · {dataCurta(pedido.criadoEm)}
        </span>
        <span className="uppercase" style={{ letterSpacing: '.14em', color: status.cor }}>
          {status.rotulo}
        </span>
      </div>

      <div className="flex flex-wrap items-center" style={{ gap: 18, padding: 20 }}>
        {/* Miniaturas de 56px: sem legenda, como no protótipo — a legenda
            monospace não cabe nesse tamanho. A foto real entra pelo `src`. */}
        <div className="flex" style={{ gap: 8 }}>
          {miniaturas.map((item) => (
            <Placeholder
              key={item.id}
              src={item.foto}
              alt={item.nome}
              ratio="3/4"
              densidade="mini"
              sizes="56px"
              className="w-[56px] shrink-0"
            />
          ))}
          {restantes > 0 && (
            <span
              className="flex w-[56px] shrink-0 items-center justify-center"
              style={{ aspectRatio: '3/4', boxShadow: '0 0 0 1px #DFD8CB', fontSize: 12, color: '#8A8375' }}
            >
              +{restantes}
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-col" style={{ flex: '1 1 200px', gap: 5 }}>
          <span style={{ fontSize: 14, lineHeight: 1.4 }}>{nomesDosItens(pedido.itens)}</span>
          <span style={{ fontSize: 12.5, color: '#8A8375', lineHeight: 1.5 }}>
            {linhaEntrega(pedido)}
          </span>
        </div>

        <span className="font-display" style={{ fontSize: 24 }}>
          {brl(pedido.total)}
        </span>

        {acao === 'Comprar de novo' ? (
          <ComprarDeNovo codigo={pedido.codigo} itens={recompra} estilo={BOTAO} />
        ) : (
          <Link
            href={`/conta/pedidos/${pedido.codigo}`}
            className="oz-btn oz-btn-outline"
            style={BOTAO}
            aria-label={`${acao} #${pedido.codigo}`}
          >
            {acao}
          </Link>
        )}
      </div>
    </article>
  )
}
