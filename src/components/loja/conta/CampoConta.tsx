'use client'

export interface CampoContaProps {
  id: string
  name?: string
  rotulo: string
  valor: string
  aoMudar?: (valor: string) => void
  tipo?: 'text' | 'email' | 'tel'
  inputMode?: 'text' | 'numeric' | 'tel' | 'email'
  autoComplete?: string
  maxLength?: number
  placeholder?: string
  dica?: string
  invalido?: boolean
  somenteLeitura?: boolean
  aoSair?: () => void
  className?: string
  estiloInput?: React.CSSProperties
}

/**
 * Campo dos formulários da conta: label 10.5px uppercase acima, `.oz-input`
 * com borda #C9C0B1 — #A0533F quando o envio volta com erro (handoff §7).
 */
export function CampoConta({
  id,
  name,
  rotulo,
  valor,
  aoMudar,
  tipo = 'text',
  inputMode,
  autoComplete,
  maxLength,
  placeholder,
  dica,
  invalido = false,
  somenteLeitura = false,
  aoSair,
  className = '',
  estiloInput,
}: CampoContaProps) {
  const idDica = `${id}-dica`

  return (
    <div className={`min-w-0 ${className}`}>
      <label htmlFor={id} className="oz-label block" style={{ marginBottom: 7 }}>
        {rotulo}
      </label>
      <input
        id={id}
        name={name ?? id}
        type={tipo}
        value={valor}
        onChange={(e) => aoMudar?.(e.target.value)}
        onBlur={aoSair}
        readOnly={somenteLeitura}
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={invalido || undefined}
        aria-describedby={dica ? idDica : undefined}
        className="oz-input"
        style={{
          borderColor: invalido ? '#A0533F' : undefined,
          color: somenteLeitura ? '#8A8375' : undefined,
          ...estiloInput,
        }}
      />
      {dica ? (
        <p id={idDica} style={{ marginTop: 6, fontSize: 11.5, lineHeight: 1.5, color: '#8A8375' }}>
          {dica}
        </p>
      ) : null}
    </div>
  )
}

/** Erro e confirmação do formulário, na mesma linguagem das outras telas. */
export function AvisoConta({ erro, ok, id }: { erro?: string; ok?: string; id?: string }) {
  if (erro) {
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
        {erro}
      </p>
    )
  }

  if (ok) {
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
        {ok}
      </p>
    )
  }

  return null
}
