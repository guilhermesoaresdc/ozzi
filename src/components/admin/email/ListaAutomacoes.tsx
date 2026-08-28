'use client'

import { useState, useTransition } from 'react'
import { Card } from '@/components/admin/Card'
import { Toggle } from '@/components/ui/Toggle'
import { alternarAutomacao, type EstadoAcao } from '@/app/admin/email/actions'
import type { EmailAutomationRow } from '@/lib/database.types'
import { AvisoProvedor, Recado, TituloCartao } from './Pecas'

/** Assinatura do que veio do banco: quando muda, a tela volta a espelhá-lo. */
function assinar(automacoes: EmailAutomationRow[]): string {
  return automacoes.map((a) => `${a.id}:${a.ativo}`).join('|')
}

function mapear(automacoes: EmailAutomationRow[]): Record<string, boolean> {
  return Object.fromEntries(automacoes.map((a) => [a.id, a.ativo]))
}

export function ListaAutomacoes({ automacoes }: { automacoes: EmailAutomationRow[] }) {
  const doBanco = assinar(automacoes)

  const [origem, setOrigem] = useState(doBanco)
  const [ligadas, setLigadas] = useState<Record<string, boolean>>(() => mapear(automacoes))
  const [estado, setEstado] = useState<EstadoAcao>({})
  const [salvando, iniciar] = useTransition()

  if (doBanco !== origem) {
    setOrigem(doBanco)
    setLigadas(mapear(automacoes))
  }

  const alternar = (automacao: EmailAutomationRow) => {
    const proximo = !ligadas[automacao.id]
    setLigadas((atual) => ({ ...atual, [automacao.id]: proximo }))
    setEstado({})

    iniciar(async () => {
      const resposta = await alternarAutomacao(automacao.id, proximo)
      setEstado(resposta)
      // Deu erro: a chave volta para onde estava, senão a tela mente.
      if (resposta.erro) setLigadas((atual) => ({ ...atual, [automacao.id]: !proximo }))
    })
  }

  return (
    <Card
      titulo={
        <div className="flex min-w-0 flex-1 flex-col gap-[10px]">
          <TituloCartao titulo="Automações" apoio="Disparam sozinhas quando a cliente faz algo" />
          <AvisoProvedor>
            O disparo depende de um provedor de e-mail, que ainda não está conectado. O painel guarda a
            configuração: ligar aqui deixa a automação pronta, não manda e-mail.
          </AvisoProvedor>
        </div>
      }
      semPadding
    >
      {automacoes.length === 0 ? (
        <p className="px-[22px] py-[26px]" style={{ fontSize: 13, color: '#8A8375' }}>
          Nenhuma automação cadastrada.
        </p>
      ) : (
        <ul style={{ padding: '6px 22px 18px' }}>
          {automacoes.map((automacao, i) => {
            const ativa = ligadas[automacao.id] ?? automacao.ativo
            return (
              <li
                key={automacao.id}
                className="flex flex-wrap items-center justify-between gap-[14px] py-[15px]"
                style={{ borderBottom: i === automacoes.length - 1 ? undefined : '1px solid #E4DDD1' }}
              >
                <span className="flex min-w-0 flex-col gap-[4px]" style={{ flex: '1 1 200px' }}>
                  <span style={{ fontSize: 13.5 }}>{automacao.nome}</span>
                  <span style={{ fontSize: 11.5, color: '#8A8375' }}>{automacao.descricao}</span>
                </span>

                <span className="whitespace-nowrap" style={{ fontSize: 12, color: '#5C574D' }}>
                  {automacao.metrica}
                </span>

                <Toggle
                  checked={ativa}
                  onChange={() => alternar(automacao)}
                  disabled={salvando}
                  label={`${ativa ? 'Desligar' : 'Ligar'} a automação ${automacao.nome}`}
                />
              </li>
            )
          })}
        </ul>
      )}

      {(estado.erro || estado.ok) && (
        <div className="px-[22px] pb-[18px]">
          <Recado estado={estado} />
        </div>
      )}
    </Card>
  )
}
