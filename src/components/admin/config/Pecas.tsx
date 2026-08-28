import type { CSSProperties, ReactNode } from 'react'
import type { EstadoAcao } from '@/app/admin/configuracoes/actions'

/** Medidas dos controles desta tela — o painel é mais denso que a loja. */
export const CAMPO: CSSProperties = { fontSize: 13, padding: '10px 12px' }
/** Campo de número no fim da linha: curto e alinhado à direita. */
export const CAMPO_CURTO: CSSProperties = {
  fontSize: 13,
  padding: '9px 10px',
  width: 96,
  textAlign: 'right',
}
export const BOTAO: CSSProperties = { fontSize: 11, letterSpacing: '.14em', padding: '12px 20px' }
export const AJUDA: CSSProperties = { fontSize: 11.5, lineHeight: 1.5, color: '#8A8375' }
export const NOME: CSSProperties = { fontSize: 13.5, lineHeight: 1.4 }
export const META: CSSProperties = { fontSize: 11.5, lineHeight: 1.5, color: '#8A8375' }

/** Label + controle + ajuda. O label sempre existe, mesmo quando é só para leitor de tela. */
export function Campo({
  id,
  rotulo,
  ajuda,
  children,
  className = '',
  style,
}: {
  id: string
  rotulo: string
  ajuda?: string
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-[6px] ${className}`} style={style}>
      <label htmlFor={id} className="oz-label">
        {rotulo}
      </label>
      {children}
      {ajuda && <p style={AJUDA}>{ajuda}</p>}
    </div>
  )
}

/** Resposta da server action: erro em vermelho, confirmação em verde. */
export function Recado({ estado }: { estado: EstadoAcao }) {
  if (!estado.erro && !estado.ok) return null
  return (
    <p role="status" style={{ fontSize: 12, lineHeight: 1.5, color: estado.erro ? '#A0533F' : '#5C7A5E' }}>
      {estado.erro ?? estado.ok}
    </p>
  )
}

/** Rodapé do cartão: campos de regra e o botão de salvar. */
export function Rodape({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-4 px-[22px] pt-[18px] pb-[22px] ${className}`}>{children}</div>
  )
}

/** Botão de salvar do cartão, desligado enquanto nada mudou. */
export function BotaoSalvar({
  salvando,
  sujo,
  rotulo = 'Salvar alterações',
}: {
  salvando: boolean
  sujo: boolean
  rotulo?: string
}) {
  return (
    <button type="submit" disabled={salvando || !sujo} className="oz-btn oz-btn-primary self-start" style={BOTAO}>
      {salvando ? 'Salvando…' : rotulo}
    </button>
  )
}

/** Botão tracejado, na linguagem da área de upload do handoff §6.5. */
export function BotaoTracejado({
  children,
  onClick,
  aberto,
  className = '',
  style,
}: {
  children: ReactNode
  onClick: () => void
  /** Quando o botão abre um formulário logo abaixo. */
  aberto?: boolean
  className?: string
  style?: CSSProperties
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={aberto}
      className={`oz-btn w-full border border-dashed border-line-dashed text-muted transition-colors hover:border-ink hover:text-ink ${className}`}
      style={{ ...BOTAO, ...style }}
    >
      {children}
    </button>
  )
}
