export interface CampoAcessoProps {
  id: string
  name: string
  rotulo: string
  valor: string
  aoMudar: (valor: string) => void
  tipo?: 'text' | 'email' | 'password'
  autoComplete?: string
  inputMode?: 'text' | 'email'
  dica?: string
  invalido?: boolean
  /** Id do aviso do formulário, para o leitor de tela ligar campo e mensagem. */
  descritoPor?: string
  foco?: boolean
}

/**
 * Campo do formulário de acesso (handoff §5.7): label 10.5px uppercase acima,
 * input `.oz-input` com borda #C9C0B1 — #A0533F quando o envio volta com erro.
 */
export function CampoAcesso({
  id,
  name,
  rotulo,
  valor,
  aoMudar,
  tipo = 'text',
  autoComplete,
  inputMode,
  dica,
  invalido = false,
  descritoPor,
  foco = false,
}: CampoAcessoProps) {
  const idDica = `${id}-dica`
  const descricao = [dica ? idDica : null, descritoPor ?? null].filter(Boolean).join(' ')

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="oz-label block" style={{ marginBottom: 7 }}>
        {rotulo}
      </label>
      <input
        id={id}
        name={name}
        type={tipo}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={invalido || undefined}
        aria-describedby={descricao || undefined}
        autoFocus={foco}
        className="oz-input"
        style={{ borderColor: invalido ? '#A0533F' : undefined }}
      />
      {dica ? (
        <p id={idDica} style={{ marginTop: 6, fontSize: 11.5, lineHeight: 1.5, color: '#8A8375' }}>
          {dica}
        </p>
      ) : null}
    </div>
  )
}
