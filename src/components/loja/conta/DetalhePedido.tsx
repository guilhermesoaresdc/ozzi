import Link from 'next/link'
import { Placeholder } from '@/components/ui/Placeholder'
import { brl, dataLonga, hora, rotuloDia } from '@/lib/format'
import { ehAVista, rotuloFrete } from '@/lib/pricing'
import { ENTREGA, PAGAMENTO, STATUS_PEDIDO } from '@/lib/status'
import { linkWhatsapp } from '@/components/loja/conta/Estados'
import {
  enderecoEmLinha,
  linhaEntrega,
  PRAZO_ENCOMENDA,
  type PedidoDaConta,
} from '@/components/loja/conta/tipos'

function Dado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex min-w-0 flex-col" style={{ gap: 5 }}>
      <span className="oz-label">{rotulo}</span>
      <span style={{ fontSize: 13.5, lineHeight: 1.7, color: '#232320', textWrap: 'pretty' }}>
        {valor}
      </span>
    </div>
  )
}

function rotuloDesconto(pedido: PedidoDaConta, taxaAVista: number): string {
  if (pedido.cupom) return `Desconto · cupom ${pedido.cupom}`
  if (ehAVista(pedido.metodoPagamento)) return `Desconto à vista (${Math.round(taxaAVista * 100)}%)`
  return 'Desconto'
}

/**
 * O pedido visto pela cliente (handoff §5.8): itens, totais e histórico na
 * mesma linguagem do card da lista. Nenhuma ação de administração aqui.
 */
export function DetalhePedido({ pedido, taxaAVista }: { pedido: PedidoDaConta; taxaAVista: number }) {
  const status = STATUS_PEDIDO[pedido.status]
  const endereco = enderecoEmLinha(pedido.endereco)
  const totalRotulo = pedido.status === 'aguardando_pagamento' ? 'Total a pagar' : 'Total'

  const href = linkWhatsapp(`Oi! Queria falar sobre o pedido ${pedido.codigo} que fiz no site da Ozzi.`)

  return (
    <>
      <Link
        href="/conta/pedidos"
        className="inline-flex items-center uppercase"
        style={{ gap: 8, fontSize: 11, letterSpacing: '.14em', color: '#8A8375', marginBottom: 18 }}
      >
        <span aria-hidden="true">←</span> Meus pedidos
      </Link>

      <h1
        className="font-display"
        style={{
          fontWeight: 300,
          fontSize: 'clamp(32px, 3.6vw, 42px)',
          lineHeight: 1.06,
          letterSpacing: '-.015em',
        }}
      >
        Pedido #{pedido.codigo}
      </h1>

      <div
        className="flex flex-wrap justify-between"
        style={{
          gap: 16,
          marginTop: 14,
          paddingBottom: 16,
          borderBottom: '1px solid #DFD8CB',
          fontSize: 12,
          letterSpacing: '.08em',
        }}
      >
        <span style={{ color: '#8A8375' }}>Feito em {dataLonga(pedido.criadoEm)}</span>
        <span className="uppercase" style={{ letterSpacing: '.14em', color: status.cor }}>
          {status.rotulo}
        </span>
      </div>

      <div className="grid lg:grid-cols-3" style={{ gap: 34, marginTop: 30 }}>
        <div className="min-w-0 lg:col-span-2">
          <section style={{ background: '#FAF7F2', border: '1px solid #DFD8CB' }}>
            <h2
              className="font-display"
              style={{ fontSize: 22, fontWeight: 400, padding: '18px 20px 0' }}
            >
              Itens do pedido
            </h2>

            <ul style={{ padding: '14px 20px 0' }}>
              {pedido.itens.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center"
                  style={{ gap: 14, padding: '12px 0', borderBottom: '1px solid #E4DDD1' }}
                >
                  <Placeholder
                    src={item.foto}
                    alt={item.nome}
                    ratio="3/4"
                    densidade="mini"
                    sizes="56px"
                    className="w-[56px] shrink-0"
                  />
                  <span className="flex min-w-0 flex-1 basis-[160px] flex-col" style={{ gap: 4 }}>
                    <span style={{ fontSize: 14, lineHeight: 1.4 }}>{item.nome}</span>
                    <span style={{ fontSize: 11.5, color: '#8A8375' }}>
                      {[item.variante, item.ref].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  <span style={{ fontSize: 13, color: '#5C574D' }}>{item.quantidade} un</span>
                  <span style={{ fontSize: 14 }}>
                    {brl(Number(item.preco_unitario) * item.quantidade)}
                  </span>
                </li>
              ))}
            </ul>

            <div
              className="flex flex-col"
              style={{ gap: 9, padding: '18px 20px 0', fontSize: 13.5, color: '#5C574D' }}
            >
              <div className="flex justify-between" style={{ gap: 18 }}>
                <span>Subtotal</span>
                <span style={{ color: '#232320' }}>{brl(pedido.subtotal)}</span>
              </div>
              <div className="flex justify-between" style={{ gap: 18 }}>
                <span>Frete · {ENTREGA[pedido.metodoEntrega]}</span>
                <span style={{ color: '#232320' }}>{rotuloFrete(pedido.frete)}</span>
              </div>
              {pedido.desconto > 0 && (
                <div className="flex justify-between" style={{ gap: 18 }}>
                  <span>{rotuloDesconto(pedido, taxaAVista)}</span>
                  <span style={{ color: '#8A6A4F' }}>− {brl(pedido.desconto)}</span>
                </div>
              )}
            </div>

            <div
              className="flex items-baseline justify-between"
              style={{
                gap: 18,
                margin: '16px 20px 0',
                padding: '16px 0 20px',
                borderTop: '1px solid #DFD8CB',
              }}
            >
              <span className="uppercase" style={{ fontSize: 11.5, letterSpacing: '.14em' }}>
                {totalRotulo}
              </span>
              <span className="font-display" style={{ fontSize: 30, fontWeight: 300 }}>
                {brl(pedido.total)}
              </span>
            </div>
          </section>

          <div
            className="grid sm:grid-cols-2"
            style={{ gap: 22, borderTop: '1px solid #DFD8CB', paddingTop: 26, marginTop: 30 }}
          >
            <Dado rotulo="Forma de entrega" valor={ENTREGA[pedido.metodoEntrega]} />
            <Dado rotulo="Forma de pagamento" valor={PAGAMENTO[pedido.metodoPagamento]} />
            <div className="sm:col-span-2">
              <Dado rotulo="Situação" valor={linhaEntrega(pedido)} />
            </div>
            {endereco && (
              <div className="sm:col-span-2">
                <Dado rotulo="Endereço de entrega" valor={endereco} />
              </div>
            )}
            {pedido.observacao && (
              <div className="sm:col-span-2">
                <Dado rotulo="Observação" valor={pedido.observacao} />
              </div>
            )}
          </div>

          {pedido.status === 'sob_encomenda' && (
            <p
              style={{
                marginTop: 26,
                background: '#FAF7F2',
                border: '1px solid #DFD8CB',
                padding: '16px 20px',
                fontSize: 13.5,
                lineHeight: 1.7,
                color: '#5C574D',
                textWrap: 'pretty',
              }}
            >
              <span className="uppercase" style={{ fontSize: 11.5, letterSpacing: '.1em', color: '#8A6A4F' }}>
                Sob encomenda ·{' '}
              </span>
              A numeração saiu do estoque, então a peça está sendo costurada sob medida.{' '}
              {PRAZO_ENCOMENDA} — a gente avisa você a cada etapa.
            </p>
          )}

          <div className="flex flex-wrap" style={{ gap: 12, marginTop: 30 }}>
            <Link href="/conta/pedidos" className="oz-btn oz-btn-outline">
              Voltar para meus pedidos
            </Link>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="oz-btn oz-btn-tertiary"
            >
              Falar sobre este pedido
            </a>
          </div>
        </div>

        <aside style={{ background: '#FAF7F2', border: '1px solid #DFD8CB', padding: '18px 20px 20px' }}>
          <h2 className="font-display" style={{ fontSize: 22, fontWeight: 400, marginBottom: 6 }}>
            Histórico
          </h2>

          {pedido.eventos.length === 0 ? (
            <p style={{ fontSize: 13, color: '#8A8375', padding: '12px 0', lineHeight: 1.7 }}>
              Assim que o pedido andar, cada etapa aparece aqui.
            </p>
          ) : (
            <ol>
              {pedido.eventos.map((evento, i) => (
                <li
                  key={evento.id}
                  className="flex flex-col"
                  style={{
                    gap: 4,
                    padding: '14px 0',
                    borderBottom: i === pedido.eventos.length - 1 ? undefined : '1px solid #E4DDD1',
                  }}
                >
                  <span style={{ fontSize: 11.5, color: evento.previsto ? '#9A9385' : '#8A8375' }}>
                    {evento.previsto
                      ? `Previsto · ${evento.rotulo_tempo ?? hora(evento.criado_em)}`
                      : `${rotuloDia(evento.criado_em)} · ${hora(evento.criado_em)}`}
                  </span>
                  <span style={{ fontSize: 13.5, lineHeight: 1.5, color: evento.previsto ? '#8A8375' : '#232320' }}>
                    {evento.titulo}
                  </span>
                  {evento.autor && (
                    <span style={{ fontSize: 11.5, color: '#8A8375' }}>{evento.autor}</span>
                  )}
                </li>
              ))}
            </ol>
          )}
        </aside>
      </div>
    </>
  )
}
