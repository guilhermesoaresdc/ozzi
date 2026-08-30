'use client'

import { useRef, useState } from 'react'
import { Acordeao, type ItemAcordeao } from '@/components/loja/produto/Acordeao'
import { ProvadorVirtual } from '@/components/loja/produto/ProvadorVirtual'
import { AcoesCompra } from '@/components/loja/produto/AcoesCompra'
import { SeletorCor } from '@/components/loja/produto/SeletorCor'
import { SeletorTamanho } from '@/components/loja/produto/SeletorTamanho'
import type { CorOpcao, Selecao } from '@/components/loja/produto/grade'
import type { CartItem } from '@/lib/cart'
import { brl } from '@/lib/format'

const TITULO_MEDIDAS = 'Medidas e numeração'

export interface ProdutoCompra {
  id: string
  slug: string
  nome: string
  ref: string
  tecido: string | null
  preco: number
  precoComparativo: number | null
  foto: string | null
  aceitaEncomenda: boolean
  prazoEncomendaDias: number
}

/**
 * Coluna de compra (handoff §5.3): preço, variantes, ações e acordeão.
 * É o único pedaço da tela com estado — daí o 'use client'.
 */
export function PainelCompra({
  produto,
  grade,
  inicial,
  chapeu,
  precoAVista,
  rotuloDescontoAVista,
  parcelas,
  parcela,
  hrefWhatsapp,
  itensAcordeao,
  mostrarTamanhos,
}: {
  produto: ProdutoCompra
  grade: CorOpcao[]
  inicial: Selecao
  chapeu: string
  precoAVista: number
  rotuloDescontoAVista: string
  parcelas: number
  parcela: number
  hrefWhatsapp: string
  itensAcordeao: ItemAcordeao[]
  mostrarTamanhos: boolean
}) {
  const [cor, setCor] = useState(inicial.cor)
  const [tamanho, setTamanho] = useState(inicial.tamanho)
  const [aberto, setAberto] = useState(0)
  const refAcordeao = useRef<HTMLDivElement>(null)

  const corAtual = grade.find((c) => c.nome === cor) ?? grade[0] ?? null
  const tamanhos = corAtual?.tamanhos ?? []
  const varianteAtual = tamanhos.find((t) => t.tamanho === tamanho) ?? null

  // Cada cor tem a sua grade: se a numeração escolhida não existe na cor nova,
  // cai na primeira que ainda tem peça.
  function trocarCor(nome: string) {
    setCor(nome)
    const alvo = grade.find((c) => c.nome === nome)
    if (!alvo || alvo.tamanhos.some((t) => t.tamanho === tamanho)) return
    const proximo = alvo.tamanhos.find((t) => t.estoque > 0) ?? alvo.tamanhos[0]
    setTamanho(proximo?.tamanho ?? '')
  }

  function verMedidas() {
    const i = itensAcordeao.findIndex((it) => it.titulo === TITULO_MEDIDAS)
    if (i < 0) return
    setAberto(i)
    const titulo = refAcordeao.current?.querySelector<HTMLElement>(`#acordeao-titulo-${i}`)
    titulo?.focus({ preventScroll: true })
    titulo?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const indisponivel = !varianteAtual || (varianteAtual.estoque === 0 && !produto.aceitaEncomenda)

  const nota = !varianteAtual
    ? 'Peça sem grade cadastrada — fale com a gente pelo WhatsApp.'
    : varianteAtual.estoque > 0
      ? 'Em estoque · envio no mesmo dia'
      : produto.aceitaEncomenda
        ? `Esgotado no estoque — fazemos sob encomenda em até ${produto.prazoEncomendaDias} dias úteis`
        : 'Esgotado no estoque — esta peça está indisponível no momento.'

  const item: Omit<CartItem, 'quantidade'> | null =
    corAtual && varianteAtual
      ? {
          variantId: varianteAtual.variantId,
          productId: produto.id,
          slug: produto.slug,
          nome: produto.nome,
          ref: produto.ref,
          cor: corAtual.nome,
          corHex: corAtual.hex,
          tamanho: varianteAtual.tamanho,
          preco: produto.preco,
          foto: produto.foto,
          prontaEntrega: varianteAtual.estoque > 0,
        }
      : null

  const subtitulo = produto.tecido ? `${produto.tecido} · Ref. ${produto.ref}` : `Ref. ${produto.ref}`

  return (
    <div className="flex flex-col" style={{ position: 'sticky', top: 120, minWidth: 0 }}>
      <span className="uppercase" style={{ fontSize: 10.5, letterSpacing: '.24em', color: '#8A6A4F' }}>
        {chapeu}
      </span>
      <h1
        className="font-display"
        style={{
          fontWeight: 300,
          fontSize: 'clamp(34px, 3.6vw, 46px)',
          lineHeight: 1.08,
          letterSpacing: '-.015em',
          textWrap: 'balance',
          margin: '12px 0 6px',
        }}
      >
        {produto.nome}
      </h1>
      <p style={{ fontSize: 13.5, color: '#8A8375', letterSpacing: '.04em', margin: '0 0 22px' }}>
        {subtitulo}
      </p>

      <div className="flex flex-wrap items-baseline" style={{ gap: 12, paddingBottom: 8 }}>
        <span className="font-display" style={{ fontSize: 38, fontWeight: 400, lineHeight: 1 }}>
          {brl(produto.preco)}
        </span>
        {produto.precoComparativo !== null && produto.precoComparativo > produto.preco && (
          <span style={{ fontSize: 13.5, color: '#8A8375', textDecoration: 'line-through' }}>
            {brl(produto.precoComparativo)}
          </span>
        )}
      </div>
      <p style={{ fontSize: 13.5, color: '#5C574D', margin: '0 0 4px' }}>
        <strong style={{ fontWeight: 500 }}>{brl(precoAVista)}</strong> no PIX ({rotuloDescontoAVista} de
        desconto)
      </p>
      <p style={{ fontSize: 13.5, color: '#8A8375', margin: '0 0 26px' }}>
        ou {parcelas}x de {brl(parcela)} sem juros no cartão
      </p>

      <div style={{ borderTop: '1px solid #DFD8CB', paddingTop: 22 }}>
        {grade.length > 0 && (
          <SeletorCor cores={grade} selecionada={corAtual?.nome ?? ''} aoEscolher={trocarCor} />
        )}

        {mostrarTamanhos && tamanhos.length > 0 && (
          <SeletorTamanho
            tamanhos={tamanhos}
            selecionado={tamanho}
            aoEscolher={setTamanho}
            aoVerMedidas={verMedidas}
          />
        )}

        <p
          role="status"
          aria-live="polite"
          style={{ fontSize: 12, color: indisponivel ? '#A0533F' : '#8A8375', margin: '0 0 24px' }}
        >
          {nota}
        </p>

        {/* A chave remonta as ações a cada troca de variante: o retorno de
            "Adicionado" não sobrevive à mudança de cor ou numeração. */}
        <AcoesCompra
          key={item?.variantId ?? 'sem-variante'}
          item={item}
          disponivel={!indisponivel}
          hrefWhatsapp={hrefWhatsapp}
        />
      </div>

      <Acordeao
        itens={itensAcordeao}
        aberto={aberto}
        aoAlternar={(i) => setAberto((atual) => (atual === i ? -1 : i))}
        containerRef={refAcordeao}
      />

      <ProvadorVirtual
        productId={produto.id}
        variantId={varianteAtual?.variantId ?? null}
        nomePeca={produto.nome}
      />
    </div>
  )
}
