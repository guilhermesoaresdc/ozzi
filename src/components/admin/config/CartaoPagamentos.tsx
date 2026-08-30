'use client'

import { useActionState, useId, useState } from 'react'
import { Card, CardRow } from '@/components/admin/Card'
import { Toggle } from '@/components/ui/Toggle'
import { salvarPagamentos, type EstadoAcao } from '@/app/admin/configuracoes/actions'
import type { PaymentOptionRow } from '@/lib/database.types'
import { emPorcento } from './dados'
import { BotaoSalvar, CAMPO, Campo, META, NOME, Recado, Rodape } from './Pecas'

interface Linha {
  chave: PaymentOptionRow['chave']
  nome: string
  destaque: string
  ativo: boolean
}

const INICIAL: EstadoAcao = {}

function paraLinhas(pagamentos: PaymentOptionRow[]): Linha[] {
  return pagamentos.map((p) => ({ chave: p.chave, nome: p.nome, destaque: p.destaque, ativo: p.ativo }))
}

function assinar(pix: string, parcelas: string, linhas: Linha[]): string {
  return JSON.stringify([pix, parcelas, linhas.map((l) => [l.chave, l.ativo])])
}

export function CartaoPagamentos({
  pagamentos,
  descontoAVista,
  parcelasMax,
}: {
  pagamentos: PaymentOptionRow[]
  /** Fração guardada em store_settings (0,05 = 5%). */
  descontoAVista: number
  parcelasMax: number
}) {
  const doBanco = assinar(emPorcento(descontoAVista), String(parcelasMax), paraLinhas(pagamentos))

  const [origem, setOrigem] = useState(doBanco)
  const [linhas, setLinhas] = useState<Linha[]>(() => paraLinhas(pagamentos))
  const [pix, setPix] = useState(() => emPorcento(descontoAVista))
  const [parcelas, setParcelas] = useState(() => String(parcelasMax))

  if (doBanco !== origem) {
    setOrigem(doBanco)
    setLinhas(paraLinhas(pagamentos))
    setPix(emPorcento(descontoAVista))
    setParcelas(String(parcelasMax))
  }

  const [estado, acao, salvando] = useActionState(salvarPagamentos, INICIAL)
  const base = useId()
  const sujo = assinar(pix, parcelas, linhas) !== origem

  const alterar = (i: number, ativo: boolean) =>
    setLinhas((atual) => atual.map((l, j) => (j === i ? { ...l, ativo } : l)))

  return (
    <form action={acao}>
      <input type="hidden" name="pagamentos" value={JSON.stringify(linhas)} />

      <Card titulo="Pagamentos" semPadding>
        {linhas.length === 0 ? (
          <p className="px-[22px] py-[26px]" style={META}>
            Nenhuma forma de pagamento cadastrada. Sem elas, o checkout não tem como cobrar.
          </p>
        ) : (
          linhas.map((linha, i) => (
            <CardRow key={linha.chave}>
              <div className="min-w-0 flex-1">
                <p style={NOME}>{linha.nome}</p>
                <p style={META}>{linha.destaque || '—'}</p>
              </div>
              <Toggle
                checked={linha.ativo}
                onChange={(v) => alterar(i, v)}
                label={`Aceitar ${linha.nome} no checkout`}
              />
            </CardRow>
          ))
        )}

        <Rodape>
          <div className="flex flex-wrap gap-4">
            <Campo
              id={`${base}-pix`}
              rotulo="Desconto do PIX (%)"
              className="flex-1"
              style={{ minWidth: 130 }}
            >
              <input
                id={`${base}-pix`}
                name="desconto_avista"
                className="oz-input"
                style={CAMPO}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="5"
                value={pix}
                onChange={(e) => setPix(e.target.value)}
              />
            </Campo>

            <Campo
              id={`${base}-parcelas`}
              rotulo="Máximo de parcelas"
              className="flex-1"
              style={{ minWidth: 130 }}
            >
              <input
                id={`${base}-parcelas`}
                name="parcelas_max"
                className="oz-input"
                style={CAMPO}
                type="number"
                min={1}
                max={12}
                step={1}
                value={parcelas}
                onChange={(e) => setParcelas(e.target.value)}
              />
            </Campo>
          </div>

          <p style={META}>
            Estes dois números mandam nas contas da loja: o desconto aparece no preço em PIX e o
            parcelamento, na linha “em até {parcelas || '6'}x” dos produtos.
          </p>

          <Recado estado={estado} />
          <BotaoSalvar salvando={salvando} sujo={sujo} />
        </Rodape>
      </Card>
    </form>
  )
}
