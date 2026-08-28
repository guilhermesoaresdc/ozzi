import Image from 'next/image'

type Densidade = 'normal' | 'denso' | 'mini'

const TRAMA: Record<Densidade, string> = {
  normal: 'repeating-linear-gradient(135deg, #E7E0D4 0 9px, #DCD4C6 9px 18px)',
  denso: 'repeating-linear-gradient(135deg, #E7E0D4 0 8px, #DCD4C6 8px 16px)',
  mini: 'repeating-linear-gradient(135deg, #E7E0D4 0 7px, #DCD4C6 7px 14px)',
}

const TRAMA_ESCURA = 'repeating-linear-gradient(135deg, #2C2A25 0 9px, #232120 9px 18px)'

export interface PlaceholderProps {
  /** Legenda em monospace: o conteúdo pretendido e a dimensão. */
  label?: string
  /** URL da foto real. Quando presente, a trama some. */
  src?: string | null
  alt?: string
  ratio?: string
  minHeight?: number | string
  densidade?: Densidade
  escuro?: boolean
  className?: string
  sizes?: string
  priority?: boolean
  children?: React.ReactNode
}

/**
 * Placeholder listrado com legenda (handoff §8). Assim que a cliente entregar
 * as fotos, basta passar `src` — o mesmo componente serve os dois estados.
 */
export function Placeholder({
  label,
  src,
  alt,
  ratio = '3/4',
  minHeight,
  densidade = 'normal',
  escuro = false,
  className = '',
  sizes = '(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 25vw',
  priority = false,
  children,
}: PlaceholderProps) {
  const legendaFonte = densidade === 'mini' ? 9 : densidade === 'denso' ? 10 : 11
  const legendaPad = densidade === 'mini' ? '4px 7px' : densidade === 'denso' ? '5px 9px' : '7px 12px'

  return (
    <div
      className={`relative flex items-end overflow-hidden ${className}`}
      style={{
        aspectRatio: ratio,
        minHeight,
        background: src ? '#E9E3D9' : escuro ? TRAMA_ESCURA : TRAMA[densidade],
      }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt ?? label ?? ''}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : label ? (
        <span
          className="relative m-[14px] font-mono leading-tight"
          style={{
            fontSize: legendaFonte,
            padding: legendaPad,
            background: escuro ? 'transparent' : '#F2EEE7',
            border: escuro ? '1px solid #4A463D' : undefined,
            color: escuro ? '#B3ADA0' : '#6B665C',
          }}
        >
          {label}
        </span>
      ) : null}
      {children}
    </div>
  )
}
