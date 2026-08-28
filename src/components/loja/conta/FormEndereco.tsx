'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { CheckSquare } from '@/components/ui/Checkbox'
import { mascaraCep, soDigitos } from '@/lib/format'
import { salvarEndereco } from '@/components/loja/conta/acoes'
import { AvisoConta, CampoConta } from '@/components/loja/conta/CampoConta'
import type { EstadoConta } from '@/components/loja/conta/tipos'

interface Campos {
  cep: string
  rua: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  uf: string
}

const VAZIO: Campos = { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' }
const INICIAL: EstadoConta = {}

interface RespostaCep {
  cep?: string
  rua?: string
  bairro?: string
  cidade?: string
  uf?: string
  erro?: string
}

export function FormEndereco({ podeSalvar }: { podeSalvar: boolean }) {
  const [estado, acao, pendente] = useActionState(salvarEndereco, INICIAL)
  const [dados, setDados] = useState<Campos>(VAZIO)
  const [padrao, setPadrao] = useState(false)
  const [avisoCep, setAvisoCep] = useState('')
  const [erroCep, setErroCep] = useState('')
  const ultimoCep = useRef('')

  useEffect(() => {
    if (estado.ok) {
      setDados(VAZIO)
      setPadrao(false)
      setAvisoCep('')
      ultimoCep.current = ''
    }
  }, [estado])

  const definir = (campo: keyof Campos, valor: string) =>
    setDados((atual) => ({ ...atual, [campo]: valor }))

  /** Ponte com o ViaCEP pela rota /api/cep, como no checkout (handoff §7). */
  async function buscarCep(bruto: string) {
    const digitos = soDigitos(bruto)
    if (digitos.length !== 8 || ultimoCep.current === digitos) return
    ultimoCep.current = digitos
    setErroCep('')
    setAvisoCep('')

    try {
      const resposta = await fetch(`/api/cep?cep=${digitos}`)
      const corpo = (await resposta.json()) as RespostaCep

      if (!resposta.ok || corpo.erro) {
        ultimoCep.current = ''
        setErroCep(corpo.erro || 'CEP não encontrado')
        return
      }

      setDados((atual) => ({
        ...atual,
        cep: corpo.cep ?? mascaraCep(digitos),
        rua: corpo.rua || atual.rua,
        bairro: corpo.bairro || atual.bairro,
        cidade: corpo.cidade || atual.cidade,
        uf: corpo.uf || atual.uf,
      }))
      setAvisoCep('Endereço preenchido pelo CEP. Confira o número.')
    } catch {
      ultimoCep.current = ''
      setErroCep('Não foi possível consultar o CEP agora')
    }
  }

  function alterarCep(valor: string) {
    const mascarado = mascaraCep(valor)
    definir('cep', mascarado)
    setErroCep('')
    setAvisoCep('')
    if (soDigitos(mascarado).length === 8) void buscarCep(mascarado)
  }

  const invalido = (campo: string) => estado.campo === campo

  return (
    <form
      action={acao}
      noValidate
      style={{ background: '#FAF7F2', border: '1px solid #DFD8CB', padding: 'clamp(24px, 3vw, 32px)' }}
    >
      <h2 className="font-display" style={{ fontSize: 24, fontWeight: 400, marginBottom: 20 }}>
        Novo endereço
      </h2>

      <div className="grid sm:grid-cols-6" style={{ gap: 18 }}>
        <CampoConta
          id="cep"
          rotulo="CEP"
          valor={dados.cep}
          aoMudar={alterarCep}
          aoSair={() => void buscarCep(dados.cep)}
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={9}
          placeholder="63540-000"
          dica={avisoCep || undefined}
          erro={erroCep || undefined}
          invalido={invalido('cep')}
          className="sm:col-span-2"
        />

        <CampoConta
          id="rua"
          rotulo="Rua"
          valor={dados.rua}
          aoMudar={(v) => definir('rua', v)}
          autoComplete="address-line1"
          maxLength={120}
          invalido={invalido('rua')}
          className="sm:col-span-4"
        />

        <CampoConta
          id="numero"
          rotulo="Número"
          valor={dados.numero}
          aoMudar={(v) => definir('numero', v)}
          maxLength={20}
          placeholder="S/N"
          invalido={invalido('numero')}
          className="sm:col-span-2"
        />

        <CampoConta
          id="complemento"
          rotulo="Complemento"
          valor={dados.complemento}
          aoMudar={(v) => definir('complemento', v)}
          maxLength={60}
          placeholder="Apto, bloco, ponto de referência"
          className="sm:col-span-4"
        />

        <CampoConta
          id="bairro"
          rotulo="Bairro"
          valor={dados.bairro}
          aoMudar={(v) => definir('bairro', v)}
          maxLength={80}
          className="sm:col-span-2"
        />

        <CampoConta
          id="cidade"
          rotulo="Cidade"
          valor={dados.cidade}
          aoMudar={(v) => definir('cidade', v)}
          autoComplete="address-level2"
          maxLength={80}
          invalido={invalido('cidade')}
          className="sm:col-span-3"
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
          className="sm:col-span-1"
        />
      </div>

      <label
        className="flex cursor-pointer items-center"
        style={{ gap: 10, marginTop: 20, fontSize: 13.5, color: '#3E3B34' }}
      >
        <input
          type="checkbox"
          name="padrao"
          className="sr-only"
          checked={padrao}
          onChange={(e) => setPadrao(e.target.checked)}
        />
        <CheckSquare checked={padrao} />
        Usar como endereço padrão
      </label>

      <div className="flex flex-col" style={{ gap: 16, marginTop: 22 }}>
        <AvisoConta erro={estado.erro} ok={estado.ok} />
        <div>
          <button type="submit" className="oz-btn oz-btn-primary" disabled={pendente || !podeSalvar}>
            {pendente ? 'Salvando…' : 'Salvar endereço'}
          </button>
        </div>
      </div>
    </form>
  )
}
