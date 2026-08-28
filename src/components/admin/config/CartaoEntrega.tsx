'use client'

import { useActionState, useId, useState } from 'react'
import { Card, CardRow } from '@/components/admin/Card'
import { Toggle } from '@/components/ui/Toggle'
import { salvarEntregas, type EstadoAcao } from '@/app/admin/configuracoes/actions'
import type { ShippingMethodRow } from '@/lib/database.types'
import { emReais } from './dados'
import { AJUDA, BotaoSalvar, CAMPO, CAMPO_CURTO, Campo, META, NOME, Recado, Rodape } from './Pecas'

interface Linha {
  chave: ShippingMethodRow['chave']
  nome: string
  detalhe: string
  preco: string
  ativo: boolean
}

const INICIAL: EstadoAcao = {}

function paraLinhas(entregas: ShippingMethodRow[]): Linha[] {
  return entregas.map((e) => ({
    chave: e.chave,
    nome: e.nome,
    detalhe: e.detalhe,
    preco: emReais(Number(e.preco)),
    ativo: e.ativo,
  }))
}

function assinar(frete: string, linhas: Linha[]): string {
  return JSON.stringify([frete, linhas.map((l) => [l.chave, l.preco, l.ativo])])
}

export function CartaoEntrega({
  entregas,
  freteGratisAcima,
}: {
  entregas: ShippingMethodRow[]
  freteGratisAcima: number
}) {
  const doBanco = assinar(emReais(freteGratisAcima), paraLinhas(entregas))

  const [origem, setOrigem] = useState(doBanco)
  const [linhas, setLinhas] = useState<Linha[]>(() => paraLinhas(entregas))
  const [frete, setFrete] = useState(() => emReais(freteGratisAcima))

  // O banco mudou (salvamos, ou outra aba mexeu): a tela volta a espelhá-lo.
  if (doBanco !== origem) {
    setOrigem(doBanco)
    setLinhas(paraLinhas(entregas))
    setFrete(emReais(freteGratisAcima))
  }

  const [estado, acao, salvando] = useActionState(salvarEntregas, INICIAL)
  const base = useId()
  const sujo = assinar(frete, linhas) !== origem

  const alterar = (i: number, mudanca: Partial<Linha>) =>
    setLinhas((atual) => atual.map((l, j) => (j === i ? { ...l, ...mudanca } : l)))

  return (
    <form action={acao}>
      <input type="hidden" name="entregas" value={JSON.stringify(linhas)} />

      <Card titulo="Entrega e retirada" semPadding>
        {linhas.length === 0 ? (
          <p className="px-[22px] py-[26px]" style={META}>
            Nenhuma forma de entrega cadastrada. Sem elas, o checkout não fecha pedido.
          </p>
        ) : (
          linhas.map((linha, i) => {
            const id = `${base}-${linha.chave}`
            const retirada = linha.chave === 'retirada'
            return (
              <CardRow key={linha.chave}>
                <div className="min-w-0 flex-1">
                  <p style={NOME}>{linha.nome}</p>
                  <p style={META}>{linha.detalhe}</p>
                </div>

                <label htmlFor={id} className="sr-only">
                  Preço de {linha.nome}
                </label>
                {/* A retirada é sempre grátis: o campo dela fica desabilitado. */}
                <input
                  id={id}
                  className="oz-input"
                  style={CAMPO_CURTO}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={retirada ? 'Grátis' : linha.preco}
                  disabled={retirada}
                  onChange={(e) => alterar(i, { preco: e.target.value })}
                />

                <Toggle
                  checked={linha.ativo}
                  onChange={(v) => alterar(i, { ativo: v })}
                  label={`Oferecer ${linha.nome} no checkout`}
                />
              </CardRow>
            )
          })
        )}

        <Rodape>
          <Campo
            id={`${base}-frete-gratis`}
            rotulo="Frete grátis acima de"
            ajuda="Vale para os Correios: acima deste valor, o PAC e o SEDEX saem de graça."
          >
            <span className="flex items-center gap-2">
              <span style={AJUDA}>R$</span>
              <input
                id={`${base}-frete-gratis`}
                name="frete_gratis_acima"
                className="oz-input"
                style={{ ...CAMPO, maxWidth: 140 }}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="249,00"
                value={frete}
                onChange={(e) => setFrete(e.target.value)}
              />
            </span>
          </Campo>

          <Recado estado={estado} />
          <BotaoSalvar salvando={salvando} sujo={sujo} />
        </Rodape>
      </Card>
    </form>
  )
}
