'use client'

/** Quadrado de 12px desenhado (handoff §5.2) — sem borda arredondada. */
export function CheckSquare({ checked, size = 12 }: { checked: boolean; size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center"
      style={{
        width: size,
        height: size,
        border: '1px solid #A79C89',
        background: checked ? '#232320' : 'transparent',
      }}
    />
  )
}
