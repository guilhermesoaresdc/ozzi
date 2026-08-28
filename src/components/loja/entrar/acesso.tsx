/**
 * Regras puras da tela de acesso (handoff §5.7). Ficam fora do arquivo de
 * server actions porque o formulário no navegador usa as mesmas checagens.
 */

const DESTINO_PADRAO = '/conta/pedidos'

/** Só aceita caminho interno — nada de "//host" ou URL absoluta vinda da query. */
export function destinoSeguro(bruto?: string | null): string {
  const valor = (bruto ?? '').trim()
  if (!valor.startsWith('/')) return DESTINO_PADRAO
  if (valor.startsWith('//') || valor.startsWith('/\\')) return DESTINO_PADRAO
  return valor
}

export function emailValido(bruto: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(bruto.trim())
}

/**
 * O rótulo do campo aceita CPF, mas só o e-mail autentica hoje. `minimoDigitos`
 * menor serve para avisar no navegador antes de a pessoa terminar de digitar.
 */
export function pareceCpf(bruto: string, minimoDigitos = 11): boolean {
  const valor = bruto.trim()
  if (!valor || valor.includes('@')) return false
  if (!/^[\d.\-\s]+$/.test(valor)) return false
  return valor.replace(/\D/g, '').length >= minimoDigitos
}

/** Uma linha, sem fingir que o CPF funciona. */
export const AVISO_CPF = 'Por enquanto o acesso é só pelo e-mail cadastrado — o CPF ainda não entra na loja.'
