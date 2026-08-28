import type { ReactNode } from 'react'
import type { EstadoAcao } from '@/app/admin/banners/actions'

/** Medidas dos controles desta tela — o painel é mais denso que a loja. */
export const CAMPO = { fontSize: 13, padding: '10px 12px' } as const
export const BOTAO = { fontSize: 11, letterSpacing: '.14em', padding: '12px 20px' } as const
export const AJUDA = { fontSize: 11.5, lineHeight: 1.5, color: '#8A8375' } as const

/**
 * Texto de ajuda dos campos de imagem: o `next/image` só libera o bucket
 * público do Supabase (next.config.ts), então não adianta colar qualquer link.
 */
export const AJUDA_IMAGEM =
  'Cole o endereço público do Supabase Storage (https://…/storage/v1/object/public/…) ou um caminho que comece com “/”. Deixe vazio para tirar a foto do ar.'

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
  style?: React.CSSProperties
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
  style?: React.CSSProperties
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={aberto}
      className={`oz-btn border border-dashed border-line-dashed text-muted transition-colors hover:border-ink hover:text-ink ${className}`}
      style={{ ...BOTAO, ...style }}
    >
      {children}
    </button>
  )
}
