'use client'

import Link from 'next/link'
import { Placeholder } from '@/components/ui/Placeholder'
import { brl } from '@/lib/format'
import type { CartItem } from '@/lib/cart'

const ACAO: React.CSSProperties = {
  fontSize: 11.5,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: '#8A8375',
  borderBottom: '1px solid #C9C0B1',
  paddingBottom: 1,
  lineHeight: 1.3,
}

function BotaoPasso({
  sinal,
  rotulo,
  desativado,
  aoClicar,
}: {
  sinal: '−' | '+'
  rotulo: string
  desativado?: boolean
  aoClicar: () => void
}) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      disabled={desativado}
      aria-label={rotulo}
      className="cursor-pointer hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
      style={{ padding: '8px 13px', fontSize: 14, lineHeight: 1, background: 'transparent', border: 0 }}
    >
      {sinal}
    </button>
  )
}

export function ItemSacola({
  item,
  aoTrocarQuantidade,
  aoRemover,
}: {
  item: CartItem
  aoTrocarQuantidade: (quantidade: number) => void
  aoRemover: () => void
}) {
  const variante = [item.cor, item.tamanho].filter(Boolean).join(' · ')
  const status = item.prontaEntrega ? 'Pronta entrega' : 'Sob encomenda'

  return (
    <li
      className="flex flex-wrap"
      style={{ gap: 20, padding: '22px 0', borderBottom: '1px solid #DFD8CB' }}
    >
      <Placeholder
        label="produto · 216×288"
        src={item.foto}
        alt={item.nome}
        ratio="3/4"
        densidade="mini"
        sizes="108px"
        className="w-[108px] shrink-0"
      />

      <div className="flex min-w-0 flex-col" style={{ flex: '1 1 200px', gap: 6 }}>
        <span style={{ fontSize: 16, lineHeight: 1.3 }}>{item.nome}</span>
        {variante && <span style={{ fontSize: 12.5, color: '#8A8375' }}>{variante}</span>}
        <span
          className="uppercase"
          style={{ fontSize: 11.5, letterSpacing: '.1em', color: '#8A6A4F' }}
        >
          {status}
        </span>

        <div className="flex flex-wrap items-start" style={{ gap: 14, marginTop: 8 }}>
          <Link
            href={`/produto/${item.slug}`}
            aria-label={`Editar ${item.nome}`}
            className="hover:text-accent"
            style={ACAO}
          >
            Editar
          </Link>
          <button
            type="button"
            onClick={aoRemover}
            aria-label={`Remover ${item.nome} da sacola`}
            className="cursor-pointer hover:text-accent"
            style={{ ...ACAO, background: 'transparent', border: 0, borderBottom: '1px solid #C9C0B1', padding: 0, paddingBottom: 1 }}
          >
            Remover
          </button>
        </div>
      </div>

      <div className="flex flex-col items-end" style={{ gap: 12 }}>
        <span className="font-display" style={{ fontSize: 22, lineHeight: 1.1 }}>
          {brl(item.preco * item.quantidade)}
        </span>

        <div
          className="flex items-center"
          style={{ border: '1px solid #C9C0B1' }}
          role="group"
          aria-label={`Quantidade de ${item.nome}`}
        >
          <BotaoPasso
            sinal="−"
            rotulo={`Diminuir quantidade de ${item.nome}`}
            desativado={item.quantidade <= 1}
            aoClicar={() => aoTrocarQuantidade(item.quantidade - 1)}
          />
          <span
            aria-hidden="true"
            style={{ padding: '8px 4px', fontSize: 13, minWidth: 22, textAlign: 'center' }}
          >
            {item.quantidade}
          </span>
          <span className="sr-only" aria-live="polite">
            {item.quantidade === 1 ? '1 unidade' : `${item.quantidade} unidades`}
          </span>
          <BotaoPasso
            sinal="+"
            rotulo={`Aumentar quantidade de ${item.nome}`}
            aoClicar={() => aoTrocarQuantidade(item.quantidade + 1)}
          />
        </div>
      </div>
    </li>
  )
}
