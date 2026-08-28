'use client'

import type { CSSProperties, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

export const ESTILO_CAMPO: CSSProperties = {
  width: '100%',
  border: '1px solid #C9C0B1',
  background: '#F2EEE7',
  padding: '12px 13px',
  fontSize: 13.5,
}

export const ESTILO_SELECT: CSSProperties = { ...ESTILO_CAMPO, padding: '11px 12px' }

export const ESTILO_NUMERO: CSSProperties = {
  width: '100%',
  minWidth: 0,
  border: '1px solid #C9C0B1',
  background: '#F2EEE7',
  padding: '9px 10px',
  fontSize: 13,
}

function Envolve({ label, span, dica, children }: { label: string; span: number; dica?: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-[7px]" style={{ gridColumn: `span ${span}` }}>
      <span className="oz-label">{label}</span>
      {children}
      {dica && (
        <span style={{ fontSize: 11, lineHeight: 1.5, color: '#8A8375' }}>{dica}</span>
      )}
    </label>
  )
}

type Comum = { label: string; span?: number; dica?: string }

export function Campo({ label, span = 1, dica, ...props }: Comum & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Envolve label={label} span={span} dica={dica}>
      <input {...props} style={ESTILO_CAMPO} />
    </Envolve>
  )
}

export function AreaTexto({ label, span = 3, dica, ...props }: Comum & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Envolve label={label} span={span} dica={dica}>
      <textarea {...props} style={{ ...ESTILO_CAMPO, resize: 'vertical' }} />
    </Envolve>
  )
}

export function Selecao({ label, span = 1, dica, children, ...props }: Comum & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Envolve label={label} span={span} dica={dica}>
      <select {...props} style={ESTILO_SELECT}>
        {children}
      </select>
    </Envolve>
  )
}
