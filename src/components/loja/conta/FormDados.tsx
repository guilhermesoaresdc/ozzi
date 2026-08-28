'use client'

import { useActionState, useState } from 'react'
import { salvarDados } from '@/components/loja/conta/acoes'
import { AvisoConta, CampoConta } from '@/components/loja/conta/CampoConta'
import type { EstadoConta } from '@/components/loja/conta/tipos'
import { mascaraCpf, mascaraTelefone } from '@/lib/format'

export interface DadosDaConta {
  nome: string
  email: string
  telefone: string
  cpf: string
  cidade: string
  uf: string
}

const INICIAL: EstadoConta = {}

export function FormDados({ inicial, temCadastro }: { inicial: DadosDaConta; temCadastro: boolean }) {
  const [estado, acao, pendente] = useActionState(salvarDados, INICIAL)
  const [dados, setDados] = useState<DadosDaConta>(inicial)

  const definir = (campo: keyof DadosDaConta, valor: string) =>
    setDados((atual) => ({ ...atual, [campo]: valor }))

  const invalido = (campo: string) => estado.campo === campo

  return (
    <form
      action={acao}
      noValidate
      style={{ background: '#FAF7F2', border: '1px solid #DFD8CB', padding: 'clamp(24px, 3vw, 32px)' }}
    >
      <div className="grid sm:grid-cols-2" style={{ gap: 18 }}>
        <CampoConta
          id="nome"
          rotulo="Nome completo"
          valor={dados.nome}
          aoMudar={(v) => definir('nome', v)}
          autoComplete="name"
          maxLength={120}
          invalido={invalido('nome')}
          className="sm:col-span-2"
        />

        <CampoConta
          id="email"
          rotulo="E-mail"
          valor={dados.email}
          tipo="email"
          somenteLeitura
          dica="O e-mail é a sua chave de acesso. Para trocar, fale com a gente."
          className="sm:col-span-2"
        />

        <CampoConta
          id="telefone"
          rotulo="Celular com WhatsApp"
          valor={dados.telefone}
          aoMudar={(v) => definir('telefone', mascaraTelefone(v))}
          tipo="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(88) 99999-0000"
          invalido={invalido('telefone')}
        />

        <CampoConta
          id="cpf"
          rotulo="CPF"
          valor={dados.cpf}
          aoMudar={(v) => definir('cpf', mascaraCpf(v))}
          inputMode="numeric"
          placeholder="000.000.000-00"
          dica="Só para a nota fiscal do pedido."
          invalido={invalido('cpf')}
        />

        <CampoConta
          id="cidade"
          rotulo="Cidade"
          valor={dados.cidade}
          aoMudar={(v) => definir('cidade', v)}
          autoComplete="address-level2"
          maxLength={80}
          invalido={invalido('cidade')}
        />

        <CampoConta
          id="uf"
          rotulo="UF"
          valor={dados.uf}
          aoMudar={(v) => definir('uf', v.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2))}
          autoComplete="address-level1"
          maxLength={2}
          placeholder="CE"
          invalido={invalido('uf')}
          className="sm:max-w-[120px]"
        />
      </div>

      <div className="flex flex-col" style={{ gap: 16, marginTop: 24 }}>
        <AvisoConta erro={estado.erro} ok={estado.ok} />

        {!temCadastro && (
          <p style={{ fontSize: 12.5, lineHeight: 1.6, color: '#8A8375', textWrap: 'pretty' }}>
            Seu cadastro de cliente é criado no primeiro pedido. Até lá, estes dados ficam guardados
            no seu acesso e já entram preenchidos no checkout.
          </p>
        )}

        <div>
          <button type="submit" className="oz-btn oz-btn-primary" disabled={pendente}>
            {pendente ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </form>
  )
}
