import type { ReactNode } from 'react'
import type { EstadoAcao } from '@/app/admin/email/actions'

/** Medidas dos controles desta tela (handoff §6.7). */
export const CAMPO = { fontSize: 13.5, padding: '12px 13px' } as const
export const BOTAO = { fontSize: 11, letterSpacing: '.16em', padding: '14px 26px' } as const
export const BOTAO_SECUNDARIO = { fontSize: 11, letterSpacing: '.14em', padding: '13px 24px' } as const
export const AJUDA = { fontSize: 11.5, lineHeight: 1.5, color: '#8A8375' } as const

/** Título do cartão com a linha de apoio do handoff. */
export function TituloCartao({ titulo, apoio }: { titulo: string; apoio: string }) {
  return (
    <div>
      <h2 className="font-display" style={{ fontSize: 22, fontWeight: 400, lineHeight: 1.2 }}>
        {titulo}
      </h2>
      <p className="mt-[5px]" style={{ fontSize: 12, color: '#8A8375' }}>
        {apoio}
      </p>
    </div>
  )
}

/** Label + controle + ajuda. O label sempre existe, mesmo quando é só para leitor de tela. */
export function Campo({
  id,
  rotulo,
  ajuda,
  colunas = 1,
  children,
}: {
  id: string
  rotulo: string
  ajuda?: string
  /** Quantas colunas da grade o campo ocupa. */
  colunas?: number
  children: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-[7px]" style={{ gridColumn: `span ${colunas}` }}>
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

/**
 * Linha de aviso do provedor. O painel guarda a configuração e o texto dos
 * envios; nenhum e-mail sai daqui enquanto não houver provedor conectado.
 */
export function AvisoProvedor({ children }: { children: ReactNode }) {
  return (
    <p
      className="flex gap-[9px]"
      style={{ fontSize: 11.5, lineHeight: 1.5, color: '#8A6A4F' }}
    >
      <span aria-hidden className="mt-[6px] shrink-0" style={{ width: 5, height: 5, background: '#8A6A4F' }} />
      <span>{children}</span>
    </p>
  )
}
