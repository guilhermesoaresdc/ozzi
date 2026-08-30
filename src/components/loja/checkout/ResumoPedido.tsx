import { Placeholder } from '@/components/ui/Placeholder'
import type { CartItem } from '@/lib/cart'
import type { PaymentMethod } from '@/lib/database.types'
import { brl } from '@/lib/format'
import { ehAVista, rotuloFrete, type Totais } from '@/lib/pricing'

/**
 * Resumo sticky do checkout (handoff §5.6): miniaturas de 52px, os totais e o
 * botão de confirmar. Os valores aqui são só para o visitante conferir — quem
 * fecha a conta de verdade é a RPC `criar_pedido`.
 */
export function ResumoPedido({
  itens,
  totais,
  metodoPagamento,
  rotuloEntrega,
  taxaAVista,
  enviando,
  hrefWhatsapp,
}: {
  itens: CartItem[]
  totais: Totais
  metodoPagamento: PaymentMethod
  rotuloEntrega: string
  taxaAVista: number
  enviando: boolean
  hrefWhatsapp: string
}) {
  const noPix = ehAVista(metodoPagamento)

  return (
    <aside
      aria-label="Resumo do pedido"
      style={{
        position: 'sticky',
        top: 120,
        background: '#FAF7F2',
        border: '1px solid #DFD8CB',
        padding: '28px 26px',
      }}
    >
      <h2 className="font-display" style={{ fontSize: 26, fontWeight: 300, marginBottom: 18 }}>
        Resumo do pedido
      </h2>

      <ul style={{ borderTop: '1px solid #E4DDD1' }}>
        {itens.map((item) => (
          <li
            key={item.variantId}
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
                {item.cor} · {item.tamanho} · {item.quantidade} un
              </span>
            </span>
            <span style={{ fontSize: 13.5 }}>{brl(item.preco * item.quantidade)}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col" style={{ gap: 9, padding: '18px 0 0', fontSize: 13.5, color: '#5C574D' }}>
        <div className="flex justify-between" style={{ gap: 18 }}>
          <span>Subtotal</span>
          <span style={{ color: '#232320' }}>{brl(totais.subtotal)}</span>
        </div>
        <div className="flex justify-between" style={{ gap: 18 }}>
          <span>Frete · {rotuloEntrega}</span>
          <span style={{ color: '#232320' }}>{rotuloFrete(totais.frete)}</span>
        </div>
        {totais.desconto > 0 && (
          <div className="flex justify-between" style={{ gap: 18 }}>
            <span>Desconto à vista ({Math.round(taxaAVista * 100)}%)</span>
            <span style={{ color: '#8A6A4F' }}>− {brl(totais.desconto)}</span>
          </div>
        )}
      </div>

      <div
        className="flex items-baseline justify-between"
        style={{ gap: 18, borderTop: '1px solid #DFD8CB', paddingTop: 16, marginTop: 16 }}
      >
        <span className="uppercase" style={{ fontSize: 11.5, letterSpacing: '.14em' }}>
          {noPix ? 'Total à vista' : 'Total'}
        </span>
        <span className="font-display" style={{ fontSize: 30, fontWeight: 300 }}>
          {brl(totais.total)}
        </span>
      </div>

      {totais.parcelas > 1 && (
        <p style={{ fontSize: 12.5, color: '#8A8375', marginTop: 6 }}>
          ou {brl(totais.totalCartao)} em até {totais.parcelas}x sem juros
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="oz-btn oz-btn-primary"
        style={{ width: '100%', padding: 18, marginTop: 22 }}
      >
        {enviando ? 'Confirmando…' : 'Confirmar pedido'}
      </button>

      <p className="text-center" style={{ fontSize: 11.5, color: '#8A8375', marginTop: 14, lineHeight: 1.6 }}>
        Prefere fechar pelo WhatsApp?{' '}
        <a
          href={hrefWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#8A8375', borderBottom: '1px solid #C9C0B1' }}
        >
          Chamar a loja
        </a>
      </p>
    </aside>
  )
}
