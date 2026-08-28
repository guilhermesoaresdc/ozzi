'use client'

import { useActionState, useId } from 'react'
import { Card } from '@/components/admin/Card'
import { salvarDadosLoja, type EstadoAcao } from '@/app/admin/configuracoes/actions'
import type { StoreSettingsRow } from '@/lib/database.types'
import { BotaoSalvar, CAMPO, Campo, Recado } from './Pecas'

const INICIAL: EstadoAcao = {}

export function CartaoDadosLoja({ settings }: { settings: StoreSettingsRow }) {
  const [estado, acao, salvando] = useActionState(salvarDadosLoja, INICIAL)
  const base = useId()

  const campos = [
    { nome: 'nome_loja', rotulo: 'Nome da loja', valor: settings.nome_loja, tipo: 'text', auto: 'organization' },
    { nome: 'localizacao', rotulo: 'Localização', valor: settings.localizacao, tipo: 'text', auto: 'off' },
    { nome: 'whatsapp', rotulo: 'WhatsApp', valor: settings.whatsapp, tipo: 'tel', auto: 'tel' },
    { nome: 'instagram', rotulo: 'Instagram', valor: settings.instagram, tipo: 'text', auto: 'off' },
    { nome: 'cnpj', rotulo: 'CNPJ', valor: settings.cnpj, tipo: 'text', auto: 'off' },
    { nome: 'email', rotulo: 'E-mail', valor: settings.email, tipo: 'email', auto: 'email' },
  ] as const

  return (
    <form action={acao}>
      <Card titulo="Dados da loja">
        <div className="flex flex-col gap-4">
          {campos.map((c) => (
            <Campo key={c.nome} id={`${base}-${c.nome}`} rotulo={c.rotulo}>
              <input
                id={`${base}-${c.nome}`}
                name={c.nome}
                className="oz-input"
                style={CAMPO}
                type={c.tipo}
                autoComplete={c.auto}
                defaultValue={c.valor}
              />
            </Campo>
          ))}

          <Recado estado={estado} />
          <BotaoSalvar salvando={salvando} sujo />
        </div>
      </Card>
    </form>
  )
}
