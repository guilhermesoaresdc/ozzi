'use client'

import Link from 'next/link'
import { brl, pct } from '@/lib/format'
import { rotuloFrete, type Totais } from '@/lib/pricing'
import { OpcoesEntrega, type MetodoEntrega } from '@/components/loja/sacola/OpcoesEntrega'
import type { DeliveryMethod } from '@/lib/database.types'

function Linha({ rotulo, valor, cor }: { rotulo: string; valor: string; cor?: string }) {
  return (
    <div className="flex justify-between" style={{ gap: 14 }}>
      <span>{rotulo}</span>
      <span className="shrink-0" style={{ color: cor ?? '#232320' }}>
        {valor}
      </span>
    </div>
  )
}

export function ResumoSacola({
  totais,
  metodos,
  metodoEntrega,
  nomeEntrega,
  taxaPix,
  freteGratisAcima,
  precos,
  aoEscolherEntrega,
}: {
  totais: Totais
  metodos: MetodoEntrega[]
  metodoEntrega: DeliveryMethod
  nomeEntrega: string
  taxaPix: number
  freteGratisAcima: number
  precos: Partial<Record<DeliveryMethod, number>>
  aoEscolherEntrega: (chave: DeliveryMethod) => void
}) {
  // Sem métodos ativos não há frete a calcular: o valor fica para o checkout.
  const semEntrega = metodos.length === 0

  return (
    <aside
      aria-label="Resumo do pedido"
      style={{
        background: '#FAF7F2',
        border: '1px solid #DFD8CB',
        padding: '28px 26px',
        position: 'sticky',
        top: 120,
      }}
    >
      <h2 className="font-display" style={{ fontWeight: 300, fontSize: 26, marginBottom: 20 }}>
        Resumo
      </h2>

      <div
        className="flex flex-col"
        style={{ gap: 11, fontSize: 13.5, color: '#5C574D', paddingBottom: 18, borderBottom: '1px solid #DFD8CB' }}
      >
        <Linha rotulo="Subtotal" valor={brl(totais.subtotal)} />
        {semEntrega ? (
          <Linha rotulo="Frete" valor="A combinar" cor="#8A8375" />
        ) : (
          <Linha rotulo={`Frete · ${nomeEntrega}`} valor={rotuloFrete(totais.frete)} />
        )}
        {totais.desconto > 0 && (
          <Linha
            rotulo={`Desconto PIX (${pct(taxaPix * 100)})`}
            valor={`−${brl(totais.desconto)}`}
            cor="#8A6A4F"
          />
        )}
      </div>

      <div className="flex items-baseline justify-between" style={{ gap: 14, padding: '18px 0 4px' }}>
        <span className="uppercase" style={{ fontSize: 11.5, letterSpacing: '.14em' }}>
          Total no PIX
        </span>
        <span className="font-display" style={{ fontSize: 30, lineHeight: 1 }}>
          {brl(totais.total)}
        </span>
      </div>
      <p style={{ fontSize: 12.5, color: '#8A8375', margin: '0 0 22px' }}>
        ou {brl(totais.totalCartao)} em até {totais.parcelas}x sem juros
      </p>

      {!semEntrega ? (
        <OpcoesEntrega
          metodos={metodos}
          escolhido={metodoEntrega}
          subtotal={totais.subtotal}
          precos={precos}
          freteGratisAcima={freteGratisAcima}
          aoEscolher={aoEscolherEntrega}
        />
      ) : (
        // Estado de erro (handoff §7): a tabela de entrega não respondeu.
        <p
          role="alert"
          style={{
            fontSize: 12.5,
            color: '#A0533F',
            border: '1px solid #A0533F',
            padding: '12px 14px',
            lineHeight: 1.6,
            margin: '0 0 20px',
          }}
        >
          Não foi possível carregar as opções de entrega agora. Você escolhe como receber na
          próxima etapa.
        </p>
      )}

      <Link href="/checkout" className="oz-btn oz-btn-primary" style={{ width: '100%', padding: 18 }}>
        Finalizar compra
      </Link>
      <p style={{ fontSize: 11.5, color: '#8A8375', margin: '14px 0 0', textAlign: 'center', lineHeight: 1.6 }}>
        Compra protegida · troca grátis em 7 dias
      </p>
    </aside>
  )
}
