'use client'

/** Pílula 34×19 do handoff §6.9. */
export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean
  onChange?: (v: boolean) => void
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className="oz-pill inline-flex shrink-0 items-center p-[2px] disabled:opacity-50"
      style={{
        width: 34,
        height: 19,
        background: checked ? '#232320' : '#C9C0B1',
        justifyContent: checked ? 'flex-end' : 'flex-start',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <span className="oz-pill block" style={{ width: 15, height: 15, background: '#F2EEE7' }} />
    </button>
  )
}
