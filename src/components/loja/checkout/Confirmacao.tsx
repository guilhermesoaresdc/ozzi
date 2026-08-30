import Link from 'next/link'
import { Placeholder } from '@/components/ui/Placeholder'
import type { DeliveryMethod, OrderStatus, PaymentMethod } from '@/lib/database.types'
import { brl, dataCurta, primeiroNome } from '@/lib/format'
import { ehAVista, rotuloFrete } from '@/lib/pricing'
import { ENTREGA, PAGAMENTO, STATUS_PEDIDO } from '@/lib/status'

export interface ItemConfirmado {
  nome: string
  variante: string
  quantidade: number
  precoUnitario: number
  foto: string | null
}

export interface PedidoConfirmado {
  codigo: string
  status: OrderStatus
  metodoEntrega: DeliveryMethod
  metodoPagamento: PaymentMethod
  subtotal: number
  frete: number
  desconto: number
  total: number
  criadoEm: string
  clienteNome: string
  itens: ItemConfirmado[]
}

const PROXIMO_PASSO: Record<PaymentMethod, { titulo: string; texto: string }> = {
  pix: {
    titulo: 'Pague o PIX para separarmos as peças',
    texto:
      'A chave e o QR Code chegam no seu WhatsApp em alguns minutos. Assim que o pagamento cair, o pedido entra em separação no mesmo dia.',
  },
  cartao: {
    titulo: 'O link do cartão chega no seu WhatsApp',
    texto:
      'Uma vendedora envia o link seguro para você pagar. As peças ficam reservadas até lá.',
  },
  whatsapp: {
    titulo: 'Combine o pagamento com a loja',
    texto:
      'Uma vendedora finaliza o pedido com você. Chame no WhatsApp — o resumo já vai preenchido na conversa.',
  },
  na_retirada: {
    titulo: 'Pague na hora de retirar',
    texto:
      'PIX ou dinheiro no momento de receber a peça. Avisamos no WhatsApp assim que tudo estiver separado.',
  },
}

const COMO_CHEGA: Record<DeliveryMethod, string> = {
  retirada: 'Combinamos o horário pelo WhatsApp. A retirada é no Centro de Várzea Alegre.',
  motoboy: 'O motoboy sai hoje até 18h para o endereço que você informou, em Várzea Alegre.',
  pac: 'Postamos nos Correios e mandamos o código de rastreio por e-mail. De 5 a 9 dias úteis.',
  sedex: 'Postamos nos Correios e mandamos o código de rastreio por e-mail. De 2 a 4 dias úteis.',
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex flex-col" style={{ gap: 5 }}>
      <span className="oz-label">{rotulo}</span>
      <span style={{ fontSize: 13.5, lineHeight: 1.7, color: '#232320' }}>{valor}</span>
    </div>
  )
}

function ResumoConfirmado({ pedido, taxaAVista }: { pedido: PedidoConfirmado; taxaAVista: number }) {
  const noPix = ehAVista(pedido.metodoPagamento)
  const rotuloTotal = pedido.status === 'aguardando_pagamento' ? 'Total a pagar' : 'Total'

  return (
    <aside
      aria-label="Itens e totais do pedido"
      style={{ background: '#FAF7F2', border: '1px solid #DFD8CB', padding: '28px 26px' }}
    >
      <h2 className="font-display" style={{ fontSize: 26, fontWeight: 300, marginBottom: 18 }}>
        Seu pedido
      </h2>

      <ul style={{ borderTop: '1px solid #E4DDD1' }}>
        {pedido.itens.map((item, i) => (
          <li
            key={`${item.nome}-${item.variante}-${i}`}
            className="flex items-center"
            style={{ gap: 14, padding: '14px 0', borderBottom: '1px solid #E4DDD1' }}
          >
            <Placeholder
              src={item.foto}
              alt={item.nome}
              ratio="3/4"
              densidade="mini"
              sizes="52px"
              className="w-[52px] shrink-0"
            />
            <span className="flex min-w-0 flex-1 flex-col" style={{ gap: 3 }}>
              <span style={{ fontSize: 14 }}>{item.nome}</span>
              <span style={{ fontSize: 11.5, color: '#8A8375' }}>
                {item.variante} · {item.quantidade} un
              </span>
            </span>
            <span style={{ fontSize: 13.5 }}>{brl(item.precoUnitario * item.quantidade)}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col" style={{ gap: 9, paddingTop: 18, fontSize: 13.5, color: '#5C574D' }}>
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
            <span>{noPix ? `Desconto à vista (${Math.round(taxaAVista * 100)}%)` : 'Desconto'}</span>
            <span style={{ color: '#8A6A4F' }}>− {brl(pedido.desconto)}</span>
          </div>
        )}
      </div>

      <div
        className="flex items-baseline justify-between"
        style={{ gap: 18, borderTop: '1px solid #DFD8CB', paddingTop: 16, marginTop: 16 }}
      >
        <span className="uppercase" style={{ fontSize: 11.5, letterSpacing: '.14em' }}>
          {rotuloTotal}
        </span>
        <span className="font-display" style={{ fontSize: 30, fontWeight: 300 }}>
          {brl(pedido.total)}
        </span>
      </div>
    </aside>
  )
}

/**
 * Etapa 3 do checkout (handoff §5.6): o que foi comprado, como chega e qual é
 * o próximo passo. Os valores vêm do banco pela RPC `pedido_publico`.
 */
export function Confirmacao({
  pedido,
  email,
  whatsapp,
  taxaAVista,
}: {
  pedido: PedidoConfirmado
  email: string
  whatsapp: string
  taxaAVista: number
}) {
  const status = STATUS_PEDIDO[pedido.status]
  const passo = PROXIMO_PASSO[pedido.metodoPagamento]
  const sobEncomenda = pedido.status === 'sob_encomenda'

  const mensagem = [
    `Oi! Fechei o pedido ${pedido.codigo} no site da Ozzi.`,
    ...pedido.itens.map((i) => `• ${i.nome} · ${i.variante} · ${i.quantidade} un`),
    `Entrega: ${ENTREGA[pedido.metodoEntrega]}`,
    `Total: ${brl(pedido.total)}`,
    'Podemos combinar o pagamento?',
  ].join('\n')
  const hrefWhatsapp = `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`

  return (
    <>
      <header style={{ marginBottom: 40, maxWidth: 620 }}>
        <p className="oz-eyebrow" style={{ marginBottom: 18 }}>
          Pedido {pedido.codigo}
        </p>
        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(34px, 4.4vw, 52px)',
            fontWeight: 300,
            lineHeight: 1.04,
            letterSpacing: '-.015em',
            textWrap: 'balance',
          }}
        >
          Obrigada, {primeiroNome(pedido.clienteNome)}
        </h1>
        <p
          className="text-body"
          style={{ fontSize: 15.5, lineHeight: 1.72, marginTop: 16, textWrap: 'pretty' }}
        >
          Recebemos seu pedido em {dataCurta(pedido.criadoEm)} e enviamos a confirmação para {email}.
          Guarde o código {pedido.codigo} para acompanhar com a gente.
        </p>
      </header>

      <div className="grid lg:grid-cols-3" style={{ gap: 44 }}>
        <div className="min-w-0 lg:col-span-2">
          <section style={{ background: '#FAF7F2', border: '1px solid #DFD8CB', padding: '26px 24px' }}>
            <p className="oz-label" style={{ marginBottom: 10 }}>
              Próximo passo
            </p>
            <h2 className="font-display" style={{ fontSize: 24, fontWeight: 400, lineHeight: 1.2 }}>
              {passo.titulo}
            </h2>
            <p className="text-body" style={{ fontSize: 14, lineHeight: 1.7, marginTop: 10, textWrap: 'pretty' }}>
              {passo.texto}
            </p>
            {pedido.metodoPagamento === 'whatsapp' && (
              <a
                href={hrefWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="oz-btn oz-btn-primary"
                style={{ marginTop: 20 }}
              >
                Combinar no WhatsApp
              </a>
            )}
          </section>

          {sobEncomenda && (
            <p
              style={{
                fontSize: 13.5,
                lineHeight: 1.7,
                color: '#5C574D',
                background: '#FAF7F2',
                border: '1px solid #DFD8CB',
                borderTop: 'none',
                padding: '16px 24px',
                textWrap: 'pretty',
              }}
            >
              <span className="uppercase" style={{ fontSize: 11.5, letterSpacing: '.1em', color: '#8A6A4F' }}>
                Sob encomenda ·{' '}
              </span>
              Alguma numeração saiu do estoque: costuramos sob medida e enviamos em até 10 dias
              úteis. Avisamos você a cada etapa.
            </p>
          )}

          <div
            className="grid sm:grid-cols-2"
            style={{ gap: 22, borderTop: '1px solid #DFD8CB', paddingTop: 26, marginTop: 34 }}
          >
            <Linha rotulo="Forma de entrega" valor={ENTREGA[pedido.metodoEntrega]} />
            <Linha rotulo="Forma de pagamento" valor={PAGAMENTO[pedido.metodoPagamento]} />
            <div className="flex flex-col sm:col-span-2" style={{ gap: 5 }}>
              <span className="oz-label">Como chega até você</span>
              <span
                className="text-body"
                style={{ fontSize: 13.5, lineHeight: 1.7, textWrap: 'pretty' }}
              >
                {COMO_CHEGA[pedido.metodoEntrega]}
              </span>
            </div>
            <Linha rotulo="Situação do pedido" valor={status.rotulo} />
          </div>

          <div className="flex flex-wrap" style={{ gap: 12, marginTop: 34 }}>
            <Link href="/" className="oz-btn oz-btn-outline">
              Continuar comprando
            </Link>
            <a
              href={hrefWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="oz-btn oz-btn-tertiary"
            >
              Falar com a loja
            </a>
          </div>
        </div>

        <ResumoConfirmado pedido={pedido} taxaAVista={taxaAVista} />
      </div>
    </>
  )
}

/** Sem código, sem e-mail ou sem pedido: o mesmo tom, com o fio em #A0533F. */
export function PedidoNaoEncontrado({ whatsapp }: { whatsapp: string }) {
  const href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
    'Oi! Fechei um pedido no site e a página de confirmação não achou o código. Podem verificar?',
  )}`

  return (
    <div
      role="alert"
      className="flex flex-col items-center text-center"
      style={{ background: '#FAF7F2', border: '1px solid #A0533F', padding: '56px 28px', gap: 12 }}
    >
      <span className="oz-label" style={{ color: '#A0533F' }}>
        Pedido não encontrado
      </span>
      <h1
        className="font-display"
        style={{ fontSize: 26, fontWeight: 300, lineHeight: 1.15, textWrap: 'balance' }}
      >
        Não achamos esse pedido
      </h1>
      <p className="text-body" style={{ fontSize: 13.5, lineHeight: 1.7, maxWidth: 430, textWrap: 'pretty' }}>
        O código e o e-mail precisam ser os mesmos usados na compra. Se você fechou agora e caiu
        aqui, o pedido pode ter sido criado mesmo assim — a gente confere para você.
      </p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <a href={href} target="_blank" rel="noopener noreferrer" className="oz-btn oz-btn-outline">
          Conferir no WhatsApp
        </a>
        <Link href="/" className="oz-btn oz-btn-tertiary">
          Voltar para a loja
        </Link>
      </div>
    </div>
  )
}
