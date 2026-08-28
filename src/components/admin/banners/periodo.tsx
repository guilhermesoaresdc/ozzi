/** Janelas de exibição de banners e avisos — usado pelos cartões desta tela. */

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export const PERIODOS = [
  { valor: 'sempre', rotulo: 'Sempre visível' },
  { valor: 'ate_31_08', rotulo: 'Até 31/08' },
  { valor: 'agendar', rotulo: 'Agendar período' },
] as const

export type PeriodoAviso = (typeof PERIODOS)[number]['valor']

/** Valor guardado que não é um dos três da tela vira "Agendar período", nunca "Sempre visível". */
export function normalizarPeriodo(valor: string): PeriodoAviso {
  return PERIODOS.some((p) => p.valor === valor) ? (valor as PeriodoAviso) : 'agendar'
}

/** "2026-08-12" vira uma data local — `new Date` na string crua cai no dia anterior. */
export function dataLocal(iso: string | null | undefined): Date | null {
  if (!iso) return null
  const [ano, mes, dia] = iso.slice(0, 10).split('-').map(Number)
  if (!ano || !mes || !dia) return null
  return new Date(ano, mes - 1, dia)
}

/** "12 ago" — o formato do selo e das janelas do handoff §6.6. */
export function diaMes(iso: string | null | undefined): string {
  const d = dataLocal(iso)
  return d ? `${d.getDate()} ${MESES[d.getMonth()]}` : '—'
}

/** "25 a 31 ago", "Desde 12 ago", "Até 31 ago". */
export function janela(inicio: string | null, fim: string | null): string {
  const de = dataLocal(inicio)
  const ate = dataLocal(fim)
  if (de && ate) {
    const mesmoMes = de.getMonth() === ate.getMonth() && de.getFullYear() === ate.getFullYear()
    return mesmoMes ? `${de.getDate()} a ${diaMes(fim)}` : `${diaMes(inicio)} a ${diaMes(fim)}`
  }
  if (de) return `Desde ${diaMes(inicio)}`
  if (ate) return `Até ${diaMes(fim)}`
  return 'Sem data marcada'
}

export interface Situacao {
  rotulo: string
  cor: string
}

/** Estado de um conteúdo agendado, pelas cores do handoff §8. */
export function situacao(
  ativo: boolean,
  inicio: string | null,
  fim: string | null,
  agora: Date = new Date(),
): Situacao {
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
  const de = dataLocal(inicio)
  const ate = dataLocal(fim)

  if (!ativo) return { rotulo: 'Rascunho', cor: '#8A8375' }
  if (ate && ate < hoje) return { rotulo: 'Encerrada', cor: '#8A8375' }
  if (de && de > hoje) return { rotulo: 'Agendada', cor: '#8A6A4F' }
  return { rotulo: 'No ar', cor: '#5C7A5E' }
}

/** Janela de um aviso da faixa, que só guarda o rótulo do período. */
export function janelaDoAviso(periodo: string): string {
  const normal = normalizarPeriodo(periodo)
  if (normal === 'ate_31_08') return 'Até 31 ago'
  if (normal === 'agendar') return 'Período a definir'
  return 'Sempre visível'
}
