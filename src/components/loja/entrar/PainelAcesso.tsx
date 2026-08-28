'use client'

import { useActionState, useId, useState } from 'react'
import { criarConta, entrar, recuperarSenha, type EstadoAcesso } from '@/app/(loja)/entrar/actions'
import { CampoAcesso } from '@/components/loja/entrar/CampoAcesso'
import { AVISO_CPF, pareceCpf } from '@/components/loja/entrar/acesso'

type Modo = 'entrar' | 'criar' | 'recuperar'

const INICIAL: EstadoAcesso = {}

interface Valores {
  nome: string
  identificador: string
  senha: string
}

const TITULO: Record<Modo, string> = {
  entrar: 'Entrar',
  criar: 'Criar minha conta',
  recuperar: 'Esqueci minha senha',
}

const APOIO: Record<Modo, string> = {
  entrar: 'Acompanhe pedidos, salve favoritos e finalize a compra mais rápido.',
  criar: 'Leva um minuto. Depois é só o e-mail e a senha para acompanhar o pedido e fechar a próxima compra mais rápido.',
  recuperar: 'Digite o e-mail cadastrado e enviamos um link para você criar uma senha nova.',
}

const BOTAO_PRINCIPAL = { padding: '16px 32px' } as const

interface FormProps {
  valores: Valores
  definir: (campo: keyof Valores, valor: string) => void
  proximo: string
  aoTrocarModo: (modo: Modo) => void
  foco: boolean
}

/** Erro e confirmação na mesma linguagem dos outros estados (handoff §7). */
function Aviso({ estado, id }: { estado: EstadoAcesso; id: string }) {
  if (estado.erro) {
    return (
      <p
        id={id}
        role="alert"
        style={{
          background: '#FAF7F2',
          border: '1px solid #A0533F',
          color: '#A0533F',
          padding: '12px 14px',
          fontSize: 12.5,
          lineHeight: 1.6,
        }}
      >
        {estado.erro}
      </p>
    )
  }

  if (estado.ok) {
    return (
      <p
        id={id}
        role="status"
        style={{
          background: '#FAF7F2',
          border: '1px solid #5C7A5E',
          color: '#232320',
          padding: '12px 14px',
          fontSize: 12.5,
          lineHeight: 1.6,
        }}
      >
        {estado.ok}
      </p>
    )
  }

  return null
}

function BotaoSecundario({ children, aoClicar }: { children: React.ReactNode; aoClicar: () => void }) {
  return (
    <button type="button" onClick={aoClicar} className="oz-btn oz-btn-tertiary w-full" style={BOTAO_PRINCIPAL}>
      {children}
    </button>
  )
}

function FormularioEntrar({ valores, definir, proximo, aoTrocarModo, foco }: FormProps) {
  const [estado, acao, pendente] = useActionState(entrar, INICIAL)
  const base = useId()
  const idAviso = `${base}-aviso`

  return (
    <form action={acao} className="flex flex-col" style={{ maxWidth: 420, gap: 18, marginTop: 30 }}>
      <input type="hidden" name="proximo" value={proximo} />
      <Aviso estado={estado} id={idAviso} />

      <CampoAcesso
        id={`${base}-identificador`}
        name="identificador"
        rotulo="E-mail ou CPF"
        valor={valores.identificador}
        aoMudar={(v) => definir('identificador', v)}
        autoComplete="username"
        inputMode="email"
        dica={pareceCpf(valores.identificador, 9) ? AVISO_CPF : undefined}
        invalido={estado.campo === 'identificador'}
        descritoPor={estado.erro ? idAviso : undefined}
        foco={foco}
      />

      <div>
        <CampoAcesso
          id={`${base}-senha`}
          name="senha"
          rotulo="Senha"
          tipo="password"
          valor={valores.senha}
          aoMudar={(v) => definir('senha', v)}
          autoComplete="current-password"
          invalido={estado.campo === 'senha'}
          descritoPor={estado.erro ? idAviso : undefined}
        />
        <div className="flex justify-end" style={{ marginTop: 10 }}>
          <button
            type="button"
            onClick={() => aoTrocarModo('recuperar')}
            className="cursor-pointer"
            style={{
              background: 'none',
              border: 0,
              borderBottom: '1px solid #C9C0B1',
              padding: 0,
              fontSize: 11.5,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: '#8A8375',
            }}
          >
            Esqueci minha senha
          </button>
        </div>
      </div>

      <div className="flex flex-col" style={{ gap: 10, marginTop: 4 }}>
        <button type="submit" disabled={pendente} className="oz-btn oz-btn-primary w-full" style={BOTAO_PRINCIPAL}>
          {pendente ? 'Entrando…' : 'Entrar'}
        </button>
        <BotaoSecundario aoClicar={() => aoTrocarModo('criar')}>Criar minha conta</BotaoSecundario>
      </div>
    </form>
  )
}

function FormularioCriar({ valores, definir, proximo, aoTrocarModo, foco }: FormProps) {
  const [estado, acao, pendente] = useActionState(criarConta, INICIAL)
  const base = useId()
  const idAviso = `${base}-aviso`

  return (
    <form action={acao} className="flex flex-col" style={{ maxWidth: 420, gap: 18, marginTop: 30 }}>
      <input type="hidden" name="proximo" value={proximo} />
      <Aviso estado={estado} id={idAviso} />

      <CampoAcesso
        id={`${base}-nome`}
        name="nome"
        rotulo="Nome completo"
        valor={valores.nome}
        aoMudar={(v) => definir('nome', v)}
        autoComplete="name"
        invalido={estado.campo === 'nome'}
        descritoPor={estado.erro ? idAviso : undefined}
        foco={foco}
      />

      <CampoAcesso
        id={`${base}-identificador`}
        name="identificador"
        rotulo="E-mail"
        tipo="email"
        valor={valores.identificador}
        aoMudar={(v) => definir('identificador', v)}
        autoComplete="email"
        inputMode="email"
        invalido={estado.campo === 'identificador'}
        descritoPor={estado.erro ? idAviso : undefined}
      />

      <CampoAcesso
        id={`${base}-senha`}
        name="senha"
        rotulo="Senha"
        tipo="password"
        valor={valores.senha}
        aoMudar={(v) => definir('senha', v)}
        autoComplete="new-password"
        dica="Pelo menos 6 caracteres."
        invalido={estado.campo === 'senha'}
        descritoPor={estado.erro ? idAviso : undefined}
      />

      <div className="flex flex-col" style={{ gap: 10, marginTop: 4 }}>
        <button type="submit" disabled={pendente} className="oz-btn oz-btn-primary w-full" style={BOTAO_PRINCIPAL}>
          {pendente ? 'Criando…' : 'Criar minha conta'}
        </button>
        <BotaoSecundario aoClicar={() => aoTrocarModo('entrar')}>Já tenho conta</BotaoSecundario>
      </div>
    </form>
  )
}

function FormularioRecuperar({ valores, definir, aoTrocarModo, foco }: FormProps) {
  const [estado, acao, pendente] = useActionState(recuperarSenha, INICIAL)
  const base = useId()
  const idAviso = `${base}-aviso`

  return (
    <form action={acao} className="flex flex-col" style={{ maxWidth: 420, gap: 18, marginTop: 30 }}>
      <Aviso estado={estado} id={idAviso} />

      <CampoAcesso
        id={`${base}-identificador`}
        name="identificador"
        rotulo="E-mail"
        tipo="email"
        valor={valores.identificador}
        aoMudar={(v) => definir('identificador', v)}
        autoComplete="email"
        inputMode="email"
        invalido={estado.campo === 'identificador'}
        descritoPor={estado.erro ? idAviso : undefined}
        foco={foco}
      />

      <div className="flex flex-col" style={{ gap: 10, marginTop: 4 }}>
        <button type="submit" disabled={pendente} className="oz-btn oz-btn-primary w-full" style={BOTAO_PRINCIPAL}>
          {pendente ? 'Enviando…' : 'Enviar link de acesso'}
        </button>
        <BotaoSecundario aoClicar={() => aoTrocarModo('entrar')}>Voltar para entrar</BotaoSecundario>
      </div>
    </form>
  )
}

/**
 * Coluna esquerda da tela 5.7. Entrar, criar conta e recuperar senha moram na
 * mesma tela: o que muda é o título, o texto de apoio e os campos.
 */
export function PainelAcesso({ proximo }: { proximo: string }) {
  const [modo, setModo] = useState<Modo>('entrar')
  const [trocou, setTrocou] = useState(false)
  const [valores, setValores] = useState<Valores>({ nome: '', identificador: '', senha: '' })

  function definir(campo: keyof Valores, valor: string) {
    setValores((atual) => ({ ...atual, [campo]: valor }))
  }

  function trocarModo(novo: Modo) {
    setModo(novo)
    // Só leva o foco para o primeiro campo depois de uma troca de modo — nunca
    // no carregamento da página.
    setTrocou(true)
  }

  const props: FormProps = { valores, definir, proximo, aoTrocarModo: trocarModo, foco: trocou }

  return (
    <section>
      <h1
        className="font-display"
        style={{
          fontWeight: 300,
          fontSize: 'clamp(34px, 4vw, 46px)',
          lineHeight: 1.05,
          letterSpacing: '-.015em',
          textWrap: 'balance',
        }}
      >
        {TITULO[modo]}
      </h1>

      <p style={{ marginTop: 14, maxWidth: 440, fontSize: 15, lineHeight: 1.72, color: '#5C574D', textWrap: 'pretty' }}>
        {APOIO[modo]}
      </p>

      {modo === 'entrar' ? (
        <FormularioEntrar {...props} />
      ) : modo === 'criar' ? (
        <FormularioCriar {...props} />
      ) : (
        <FormularioRecuperar {...props} />
      )}
    </section>
  )
}
