export interface CampoProps {
  id: string
  rotulo: string
  valor: string
  aoMudar: (valor: string) => void
  erro?: string
  dica?: string
  tipo?: 'text' | 'email' | 'tel'
  inputMode?: 'text' | 'numeric' | 'tel' | 'email'
  autoComplete?: string
  maxLength?: number
  placeholder?: string
  aoSair?: () => void
  className?: string
  estiloInput?: React.CSSProperties
}

/**
 * Campo do formulário de entrega (handoff §5.6): label acima em 10.5px
 * uppercase, input `.oz-input` e mensagem de erro em #A0533F logo abaixo.
 */
export function Campo({
  id,
  rotulo,
  valor,
  aoMudar,
  erro,
  dica,
  tipo = 'text',
  inputMode,
  autoComplete,
  maxLength,
  placeholder,
  aoSair,
  className = '',
  estiloInput,
}: CampoProps) {
  const idErro = `${id}-erro`
  const idDica = `${id}-dica`
  const descrito = erro ? idErro : dica ? idDica : undefined

  return (
    <div className={`min-w-0 ${className}`}>
      <label htmlFor={id} className="oz-label block" style={{ marginBottom: 7 }}>
        {rotulo}
      </label>
      <input
        id={id}
        name={id}
        type={tipo}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        onBlur={aoSair}
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descrito}
        className="oz-input"
        style={{ borderColor: erro ? '#A0533F' : undefined, ...estiloInput }}
      />
      {erro ? (
        <p id={idErro} style={{ marginTop: 6, fontSize: 11.5, lineHeight: 1.5, color: '#A0533F' }}>
          {erro}
        </p>
      ) : dica ? (
        <p id={idDica} style={{ marginTop: 6, fontSize: 11.5, lineHeight: 1.5, color: '#8A8375' }}>
          {dica}
        </p>
      ) : null}
    </div>
  )
}
