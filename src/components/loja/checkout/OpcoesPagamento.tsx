import { OpcaoRadio } from '@/components/loja/checkout/OpcaoRadio'
import type { PaymentMethod, PaymentOptionRow } from '@/lib/database.types'

/**
 * Pagamento empilhado (handoff §5.6). Nome à esquerda, destaque em #8A6A4F à
 * direita e o detalhe na linha de baixo. As opções vêm de payment_options.
 */
export function OpcoesPagamento({
  opcoes,
  valor,
  aoMudar,
}: {
  opcoes: PaymentOptionRow[]
  valor: PaymentMethod
  aoMudar: (metodo: PaymentMethod) => void
}) {
  return (
    <fieldset className="min-w-0 border-0 p-0" style={{ margin: 0 }}>
      <legend className="sr-only">Forma de pagamento</legend>
      <div className="flex flex-col" style={{ gap: 10 }}>
        {opcoes.map((opcao) => (
          <OpcaoRadio
            key={opcao.chave}
            nome="metodo-pagamento"
            valor={opcao.chave}
            marcado={valor === opcao.chave}
            aoMarcar={(v) => aoMudar(v as PaymentMethod)}
            fundoMarcado="#FAF7F2"
            padding="16px 18px"
          >
            <span className="flex flex-wrap items-baseline justify-between" style={{ gap: '2px 14px' }}>
              <span style={{ fontSize: 14.5 }}>{opcao.nome}</span>
              <span style={{ fontSize: 12.5, color: '#8A6A4F' }}>{opcao.destaque}</span>
            </span>
            <span className="block" style={{ fontSize: 12.5, color: '#8A8375', marginTop: 4 }}>
              {opcao.detalhe}
            </span>
          </OpcaoRadio>
        ))}
      </div>
    </fieldset>
  )
}
