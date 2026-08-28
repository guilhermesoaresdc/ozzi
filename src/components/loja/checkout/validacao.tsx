import { soDigitos } from '@/lib/format'
import type { DeliveryMethod } from '@/lib/database.types'

export interface DadosEntrega {
  nome: string
  cpf: string
  celular: string
  cep: string
  endereco: string
  bairro: string
  cidade: string
  uf: string
  email: string
}

export const DADOS_VAZIOS: DadosEntrega = {
  nome: '',
  cpf: '',
  celular: '',
  cep: '',
  endereco: '',
  bairro: '',
  cidade: '',
  uf: '',
  email: '',
}

export type CampoEntrega = keyof DadosEntrega
export type ErrosEntrega = Partial<Record<CampoEntrega, string>>

/** A ordem visual do formulário — usada para focar o primeiro campo com erro. */
export const ORDEM_CAMPOS: CampoEntrega[] = [
  'nome',
  'cpf',
  'celular',
  'cep',
  'endereco',
  'bairro',
  'cidade',
  'uf',
  'email',
]

/** Retirada no Centro não precisa de endereço de entrega. */
export function precisaEndereco(metodo: DeliveryMethod): boolean {
  return metodo !== 'retirada'
}

export function cpfValido(bruto: string): boolean {
  const d = soDigitos(bruto)
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false

  const digito = (ate: number) => {
    let soma = 0
    for (let i = 0; i < ate; i++) soma += Number(d[i]) * (ate + 1 - i)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }

  return digito(9) === Number(d[9]) && digito(10) === Number(d[10])
}

export function emailValido(bruto: string): boolean {
  const v = bruto.trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
}

export function validarEntrega(dados: DadosEntrega, comEndereco: boolean): ErrosEntrega {
  const erros: ErrosEntrega = {}

  if (dados.nome.trim().split(/\s+/).filter(Boolean).length < 2) {
    erros.nome = 'Informe o nome completo de quem vai receber'
  }

  const cpf = soDigitos(dados.cpf)
  if (!cpf) erros.cpf = 'Informe o CPF'
  else if (!cpfValido(dados.cpf)) erros.cpf = 'Esse CPF não confere'

  const celular = soDigitos(dados.celular)
  if (!celular) erros.celular = 'Informe o celular com DDD'
  else if (celular.length < 10) erros.celular = 'Faltam dígitos no número'

  if (!dados.email.trim()) erros.email = 'Informe o e-mail para acompanhar o pedido'
  else if (!emailValido(dados.email)) erros.email = 'Confira o e-mail — falta o @ ou o domínio'

  if (comEndereco) {
    const cep = soDigitos(dados.cep)
    if (!cep) erros.cep = 'Informe o CEP'
    else if (cep.length !== 8) erros.cep = 'O CEP tem 8 dígitos'

    if (!dados.endereco.trim()) erros.endereco = 'Informe a rua e o número'
    if (!dados.bairro.trim()) erros.bairro = 'Informe o bairro'
    if (!dados.cidade.trim()) erros.cidade = 'Informe a cidade'

    const uf = dados.uf.trim()
    if (!uf) erros.uf = 'Informe a UF'
    else if (uf.length !== 2) erros.uf = 'Use a sigla de 2 letras'
  }

  return erros
}

/** "Rua Antônio Luís, 240" → rua e número separados, como o painel espera. */
export function separarLogradouro(valor: string): { rua: string; numero: string | null } {
  const bruto = valor.trim()
  const casou = bruto.match(/^(.+?),\s*(\d+[A-Za-z]?)$/)
  if (!casou) return { rua: bruto, numero: null }
  return { rua: casou[1].trim(), numero: casou[2] }
}
