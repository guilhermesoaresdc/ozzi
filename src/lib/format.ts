const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const NUM = new Intl.NumberFormat('pt-BR')

/** R$ 289,90 */
export function brl(value: number | null | undefined): string {
  return BRL.format(Number(value ?? 0))
}

/** 289,90 — sem o símbolo, para quando o "R$" já está na marcação */
export function brlPlain(value: number | null | undefined): string {
  return BRL.format(Number(value ?? 0)).replace(/^R\$\s*/, '')
}

export function num(value: number | null | undefined): string {
  return NUM.format(Number(value ?? 0))
}

export function pct(value: number | null | undefined, casas = 0): string {
  if (value === null || value === undefined) return '—'
  return `${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })}%`
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const MESES_LONGOS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]
const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

/** 24 ago 2026 */
export function dataCurta(iso: string | Date | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`
}

/** 24 de agosto de 2026, 09:42 */
export function dataLonga(iso: string | Date | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return `${d.getDate()} de ${MESES_LONGOS[d.getMonth()]} de ${d.getFullYear()}, ${hora(d)}`
}

/** Quinta, 28 de agosto de 2026 */
export function dataPorExtenso(iso: string | Date = new Date()): string {
  const d = new Date(iso)
  return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES_LONGOS[d.getMonth()]} de ${d.getFullYear()}`
}

/** 09:42 */
export function hora(iso: string | Date | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** "Hoje", "Ontem" ou "24 ago" — a coluna de tempo do histórico do pedido */
export function rotuloDia(iso: string | Date | null | undefined, agora: Date = new Date()): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const dia = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diff = Math.round((dia(d) - dia(agora)) / 86_400_000)
  if (diff === 0) return 'Hoje'
  if (diff === -1) return 'Ontem'
  if (diff === 1) return 'Amanhã'
  return `${d.getDate()} ${MESES[d.getMonth()]}`
}

export function saudacao(agora: Date = new Date()): string {
  const h = agora.getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function primeiroNome(nome: string | null | undefined): string {
  return (nome ?? '').trim().split(/\s+/)[0] ?? ''
}

export function soDigitos(v: string): string {
  return v.replace(/\D+/g, '')
}

export function mascaraCep(v: string): string {
  const d = soDigitos(v).slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

export function mascaraCpf(v: string): string {
  const d = soDigitos(v).slice(0, 11)
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function mascaraTelefone(v: string): string {
  const d = soDigitos(v).slice(0, 11)
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2')
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2')
}
