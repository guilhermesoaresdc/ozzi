'use client'

import { useActionState, useEffect, useId, useState, useTransition } from 'react'
import { Card, CardRow } from '@/components/admin/Card'
import { Toggle } from '@/components/ui/Toggle'
import {
  alternarCupom,
  criarCupom,
  removerCupom,
  type EstadoAcao,
} from '@/app/admin/configuracoes/actions'
import type { CouponRow } from '@/lib/database.types'
import { descricaoDoCupom, REGRAS_CUPOM, validadeEmTexto } from './dados'
import { BOTAO, BotaoTracejado, CAMPO, Campo, META, NOME, Recado, Rodape } from './Pecas'

const INICIAL: EstadoAcao = {}

const BOTAO_LINHA = {
  fontSize: 10.5,
  letterSpacing: '.14em',
  padding: '8px 12px',
} as const

export function CartaoCupons({ cupons }: { cupons: CouponRow[] }) {
  const doBanco = JSON.stringify(cupons.map((c) => [c.codigo, c.ativo]))

  const [origem, setOrigem] = useState(doBanco)
  const [ativos, setAtivos] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(cupons.map((c) => [c.codigo, c.ativo])),
  )

  // O banco mudou (salvamos, ou outra aba mexeu): a tela volta a espelhá-lo.
  if (doBanco !== origem) {
    setOrigem(doBanco)
    setAtivos(Object.fromEntries(cupons.map((c) => [c.codigo, c.ativo])))
  }

  const [recado, setRecado] = useState<EstadoAcao>(INICIAL)
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [pendente, iniciar] = useTransition()

  const [aberto, setAberto] = useState(false)
  const [estadoCriar, acaoCriar, criando] = useActionState(criarCupom, INICIAL)
  const base = useId()

  // Cupom criado: o formulário fecha e a confirmação fica visível abaixo do botão.
  useEffect(() => {
    if (estadoCriar.ok) setAberto(false)
  }, [estadoCriar])

  const alternar = (codigo: string, valor: boolean) => {
    setAtivos((a) => ({ ...a, [codigo]: valor }))
    setRecado(INICIAL)
    iniciar(async () => {
      const resposta = await alternarCupom(codigo, valor)
      setRecado(resposta)
      if (resposta.erro) setAtivos((a) => ({ ...a, [codigo]: !valor }))
    })
  }

  const remover = (codigo: string) => {
    setConfirmando(null)
    setRecado(INICIAL)
    iniciar(async () => setRecado(await removerCupom(codigo)))
  }

  return (
    <Card titulo="Cupons ativos" semPadding>
      {cupons.length === 0 ? (
        <p className="px-[22px] py-[26px]" style={META}>
          Nenhum cupom cadastrado. Crie um abaixo para dar desconto por código no checkout.
        </p>
      ) : (
        cupons.map((cupom) => {
          const ativo = ativos[cupom.codigo] ?? cupom.ativo
          const confirma = confirmando === cupom.codigo
          return (
            <CardRow key={cupom.codigo}>
              <div className="min-w-0 flex-1">
                <p style={{ ...NOME, letterSpacing: '.06em' }}>{cupom.codigo}</p>
                <p style={META}>{descricaoDoCupom(cupom)}</p>
                <p style={META}>
                  {validadeEmTexto(cupom.validade)} · {cupom.usos} {cupom.usos === 1 ? 'uso' : 'usos'}
                </p>
              </div>

              <Toggle
                checked={ativo}
                onChange={(v) => alternar(cupom.codigo, v)}
                disabled={pendente}
                label={`Manter o cupom ${cupom.codigo} valendo no checkout`}
              />

              {confirma ? (
                <span className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => remover(cupom.codigo)}
                    disabled={pendente}
                    className="oz-btn oz-btn-primary"
                    style={BOTAO_LINHA}
                  >
                    Remover mesmo
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmando(null)}
                    className="oz-btn oz-btn-tertiary"
                    style={BOTAO_LINHA}
                  >
                    Cancelar
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmando(cupom.codigo)}
                  disabled={pendente}
                  aria-label={`Remover o cupom ${cupom.codigo}`}
                  className="oz-btn oz-btn-tertiary"
                  style={BOTAO_LINHA}
                >
                  Remover
                </button>
              )}
            </CardRow>
          )
        })
      )}

      <Rodape>
        <BotaoTracejado onClick={() => setAberto((v) => !v)} aberto={aberto}>
          + Criar cupom
        </BotaoTracejado>

        {aberto && (
          <form action={acaoCriar} className="flex flex-col gap-4">
            <Campo id={`${base}-codigo`} rotulo="Código" ajuda="Só letras e números, como CARIRI15.">
              <input
                id={`${base}-codigo`}
                name="codigo"
                className="oz-input"
                style={{ ...CAMPO, textTransform: 'uppercase' }}
                type="text"
                autoComplete="off"
                required
                maxLength={24}
                placeholder="CARIRI15"
              />
            </Campo>

            <div className="flex flex-wrap gap-4">
              <Campo id={`${base}-tipo`} rotulo="Tipo" className="flex-1" style={{ minWidth: 130 }}>
                <select id={`${base}-tipo`} name="tipo" className="oz-input" style={CAMPO} defaultValue="percentual">
                  <option value="percentual">Percentual (%)</option>
                  <option value="valor">Valor em reais</option>
                </select>
              </Campo>

              <Campo id={`${base}-valor`} rotulo="Valor" className="flex-1" style={{ minWidth: 130 }}>
                <input
                  id={`${base}-valor`}
                  name="valor"
                  className="oz-input"
                  style={CAMPO}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  required
                  placeholder="10"
                />
              </Campo>
            </div>

            <Campo id={`${base}-regra`} rotulo="Regra">
              <select id={`${base}-regra`} name="regra" className="oz-input" style={CAMPO} defaultValue="geral">
                {REGRAS_CUPOM.map((r) => (
                  <option key={r.chave} value={r.chave}>
                    {r.rotulo}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo id={`${base}-validade`} rotulo="Validade" ajuda="Deixe vazio para o cupom valer sem prazo.">
              <input
                id={`${base}-validade`}
                name="validade"
                className="oz-input"
                style={CAMPO}
                type="date"
              />
            </Campo>

            <div className="flex flex-wrap gap-[10px]">
              <button type="submit" disabled={criando} className="oz-btn oz-btn-primary" style={BOTAO}>
                {criando ? 'Criando…' : 'Criar cupom'}
              </button>
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="oz-btn oz-btn-tertiary"
                style={BOTAO}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        <Recado estado={estadoCriar} />
        <Recado estado={recado} />
      </Rodape>
    </Card>
  )
}
