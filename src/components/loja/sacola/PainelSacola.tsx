'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useCart } from '@/lib/cart'
import { calcularTotais } from '@/lib/pricing'
import { ENTREGA } from '@/lib/status'
import { EsqueletoSacola, SacolaVazia } from '@/components/loja/sacola/EstadosSacola'
import { ItemSacola } from '@/components/loja/sacola/ItemSacola'
import { ResumoSacola } from '@/components/loja/sacola/ResumoSacola'
import type { MetodoEntrega } from '@/components/loja/sacola/OpcoesEntrega'
import type { DeliveryMethod } from '@/lib/database.types'

/**
 * Onde a escolha de entrega espera pelo checkout. Formato: `{"metodo":"pac"}`.
 * A leitura também aceita a chave crua, para não quebrar com um valor antigo.
 */
const CHAVE_ENTREGA = 'ozzi:entrega'

function lerEntrega(validos: DeliveryMethod[]): DeliveryMethod | null {
  try {
    const bruto = window.sessionStorage.getItem(CHAVE_ENTREGA)
    if (!bruto) return null
    const valor = bruto.trim().startsWith('{')
      ? (JSON.parse(bruto) as { metodo?: string }).metodo
      : bruto
    return validos.includes(valor as DeliveryMethod) ? (valor as DeliveryMethod) : null
  } catch {
    return null
  }
}

function gravarEntrega(metodo: DeliveryMethod) {
  try {
    window.sessionStorage.setItem(CHAVE_ENTREGA, JSON.stringify({ metodo }))
  } catch {
    // sessionStorage bloqueado: o checkout volta ao padrão de entrega.
  }
}

export function PainelSacola({
  metodos,
  freteGratisAcima,
  taxaAVista,
  parcelas,
}: {
  metodos: MetodoEntrega[]
  freteGratisAcima: number
  taxaAVista: number
  parcelas: number
}) {
  const { itens, carregado, subtotal, definirQuantidade, remover } = useCart()
  const [metodoEntrega, setMetodoEntrega] = useState<DeliveryMethod>(metodos[0]?.chave ?? 'retirada')
  const [aviso, setAviso] = useState('')

  // A escolha guardada só vale se o método ainda estiver ativo no banco.
  useEffect(() => {
    const chaves = metodos.map((m) => m.chave)
    const guardado = lerEntrega(chaves)
    if (guardado) {
      setMetodoEntrega(guardado)
    } else if (chaves.length > 0) {
      // O checkout lê a mesma chave: já grava o padrão, sem depender de um clique.
      setMetodoEntrega(chaves[0])
      gravarEntrega(chaves[0])
    }
  }, [metodos])

  const precos = useMemo(
    () =>
      metodos.reduce<Partial<Record<DeliveryMethod, number>>>((acc, m) => {
        acc[m.chave] = m.preco
        return acc
      }, {}),
    [metodos],
  )

  const totais = calcularTotais({
    subtotal,
    metodoEntrega,
    precosFrete: precos,
    freteGratisAcima,
    taxaAVista,
    parcelas,
  })

  const nomeEntrega = metodos.find((m) => m.chave === metodoEntrega)?.nome ?? ENTREGA[metodoEntrega]

  function escolherEntrega(chave: DeliveryMethod) {
    setMetodoEntrega(chave)
    gravarEntrega(chave)
  }

  function removerItem(variantId: string, nome: string) {
    remover(variantId)
    setAviso(`${nome} foi removida da sacola.`)
  }

  return (
    <>
      <p role="status" aria-live="polite" className="sr-only">
        {aviso}
      </p>

      {!carregado ? (
        <EsqueletoSacola />
      ) : itens.length === 0 ? (
        <SacolaVazia />
      ) : (
        <div
          className="grid items-start"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 44 }}
        >
          <div style={{ gridColumn: 'span 2', minWidth: 0, borderTop: '1px solid #DFD8CB' }}>
            <ul>
              {itens.map((item) => (
                <ItemSacola
                  key={item.variantId}
                  item={item}
                  aoTrocarQuantidade={(q) => definirQuantidade(item.variantId, q)}
                  aoRemover={() => removerItem(item.variantId, item.nome)}
                />
              ))}
            </ul>

            <Link
              href="/novidades"
              className="inline-block uppercase"
              style={{
                marginTop: 24,
                fontSize: 11.5,
                letterSpacing: '.14em',
                borderBottom: '1px solid #232320',
                paddingBottom: 3,
              }}
            >
              Continuar comprando
            </Link>
          </div>

          <ResumoSacola
            totais={totais}
            metodos={metodos}
            metodoEntrega={metodoEntrega}
            nomeEntrega={nomeEntrega}
            taxaAVista={taxaAVista}
            freteGratisAcima={freteGratisAcima}
            precos={precos}
            aoEscolherEntrega={escolherEntrega}
          />
        </div>
      )}
    </>
  )
}
