import Image from 'next/image'

export function Logo({
  size = 44,
  wordmark = 23,
  tagline = true,
  invertida = false,
}: {
  size?: number
  wordmark?: number
  tagline?: boolean
  invertida?: boolean
}) {
  return (
    <span className="flex items-center gap-[11px]">
      <Image
        src="/ozzi-logo.png"
        alt="Ozzi"
        width={size}
        height={size}
        priority
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          // Sobre fundo escuro: trocar por um PNG branco real quando a cliente entregar.
          filter: invertida ? 'invert(1) brightness(1.08)' : undefined,
          opacity: invertida ? 0.92 : undefined,
          mixBlendMode: invertida ? undefined : 'multiply',
        }}
      />
      <span className="flex flex-col gap-[3px]">
        <span
          className="leading-none font-extralight"
          style={{ fontSize: wordmark, letterSpacing: '.34em', textIndent: '.34em' }}
        >
          OZZI
        </span>
        {tagline && (
          <span
            className="leading-none"
            style={{
              fontSize: 7.5,
              letterSpacing: '.2em',
              color: invertida ? '#8F8A7E' : '#6B665C',
            }}
          >
            FEMININE FASHION &amp; ACCESSORIES
          </span>
        )}
      </span>
    </span>
  )
}
