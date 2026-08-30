/**
 * Comparação de cor para a consultoria de estilo.
 *
 * A distância é calculada em CIELAB, não em RGB: dois tons podem estar perto
 * numericamente em RGB e longe do jeito que o olho enxerga. Como a recomendação
 * decide o que a cliente vê primeiro, vale usar a medida perceptual.
 */

export interface Cor {
  nome: string
  hex: string
}

interface Lab {
  L: number
  a: number
  b: number
}

export function hexParaRgb(hex: string): [number, number, number] | null {
  const limpo = hex.trim().replace('#', '')
  const cheio =
    limpo.length === 3
      ? limpo
          .split('')
          .map((c) => c + c)
          .join('')
      : limpo
  if (!/^[0-9a-f]{6}$/i.test(cheio)) return null
  return [
    parseInt(cheio.slice(0, 2), 16),
    parseInt(cheio.slice(2, 4), 16),
    parseInt(cheio.slice(4, 6), 16),
  ]
}

function rgbParaLab(r: number, g: number, b: number): Lab {
  // sRGB → linear
  const linear = [r, g, b].map((v) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]

  // linear → XYZ (iluminante D65)
  const X = linear[0] * 0.4124564 + linear[1] * 0.3575761 + linear[2] * 0.1804375
  const Y = linear[0] * 0.2126729 + linear[1] * 0.7151522 + linear[2] * 0.072175
  const Z = linear[0] * 0.0193339 + linear[1] * 0.119192 + linear[2] * 0.9503041

  // XYZ → Lab
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const fx = f(X / 0.95047)
  const fy = f(Y / 1.0)
  const fz = f(Z / 1.08883)

  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) }
}

export function hexParaLab(hex: string): Lab | null {
  const rgb = hexParaRgb(hex)
  if (!rgb) return null
  return rgbParaLab(rgb[0], rgb[1], rgb[2])
}

/** Distância CIE76. Abaixo de ~25 o olho já lê como "a mesma família". */
export function distancia(a: Lab, b: Lab): number {
  return Math.sqrt((a.L - b.L) ** 2 + (a.a - b.a) ** 2 + (a.b - b.b) ** 2)
}

/**
 * Quão bem uma cor conversa com a paleta: 100 é um casamento perfeito, 0 é
 * uma cor que não tem nada a ver com nada da paleta.
 */
export function afinidade(hex: string, paleta: Cor[]): number {
  const alvo = hexParaLab(hex)
  if (!alvo || paleta.length === 0) return 0

  let melhor = Infinity
  for (const cor of paleta) {
    const p = hexParaLab(cor.hex)
    if (!p) continue
    melhor = Math.min(melhor, distancia(alvo, p))
  }
  if (melhor === Infinity) return 0

  // 0 de distância vira 100; 80 de distância ou mais vira 0.
  return Math.max(0, Math.round(100 - (melhor / 80) * 100))
}

/** A cor da paleta mais próxima — usada para explicar a recomendação. */
export function corMaisProxima(hex: string, paleta: Cor[]): Cor | null {
  const alvo = hexParaLab(hex)
  if (!alvo) return null

  let melhor: Cor | null = null
  let menor = Infinity
  for (const cor of paleta) {
    const p = hexParaLab(cor.hex)
    if (!p) continue
    const d = distancia(alvo, p)
    if (d < menor) {
      menor = d
      melhor = cor
    }
  }
  return melhor
}

export function paletaDe(bruto: unknown): Cor[] {
  if (!Array.isArray(bruto)) return []
  return bruto
    .filter(
      (c): c is Cor =>
        typeof c === 'object' && c !== null && typeof (c as Cor).hex === 'string' && typeof (c as Cor).nome === 'string',
    )
    .filter((c) => hexParaRgb(c.hex) !== null)
}
