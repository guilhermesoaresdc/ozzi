'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/supabase/config'
import { AVISO_CPF, destinoSeguro, emailValido, pareceCpf } from '@/components/loja/entrar/acesso'

/** Campo que o formulário deve marcar como inválido. */
export type NomeCampo = 'nome' | 'identificador' | 'senha'

export interface EstadoAcesso {
  erro?: string
  ok?: string
  campo?: NomeCampo
}

const Texto = z.string().max(320)

const EsquemaEntrar = z.object({ identificador: Texto, senha: Texto, proximo: Texto })
const EsquemaCriar = z.object({ nome: Texto, identificador: Texto, senha: Texto, proximo: Texto })
const EsquemaRecuperar = z.object({ identificador: Texto })

const texto = (dado: FormDataEntryValue | null) => (typeof dado === 'string' ? dado : '')

const ERRO_ENTRADA = 'Não entendi os dados enviados. Recarregue a página e tente de novo.'
const ERRO_EMAIL = 'Confira o e-mail — falta o @ ou o domínio'
const ERRO_SEM_EMAIL = 'Digite o e-mail cadastrado'
const ERRO_TENTATIVAS = 'Muitas tentativas seguidas. Espere um minuto e tente de novo.'

interface Falha {
  message: string
  status?: number
  code?: string
}

/** Erros do Supabase Auth em pt-BR (handoff §7: erro em #A0533F, uma linha). */
function traduzir(erro: Falha, contexto: 'entrar' | 'criar'): EstadoAcesso {
  const codigo = erro.code ?? ''
  const mensagem = erro.message.toLowerCase()

  if (codigo === 'invalid_credentials' || mensagem.includes('invalid login credentials'))
    return { erro: 'E-mail ou senha incorretos', campo: 'senha' }

  if (codigo === 'email_not_confirmed' || mensagem.includes('email not confirmed'))
    return { erro: 'Confirme o e-mail que enviamos antes de entrar.', campo: 'identificador' }

  if (codigo === 'user_already_exists' || mensagem.includes('already registered'))
    return { erro: 'Este e-mail já tem conta', campo: 'identificador' }

  if (codigo === 'weak_password' || mensagem.includes('password should be at least'))
    return { erro: 'A senha precisa de pelo menos 6 caracteres', campo: 'senha' }

  if (erro.status === 429 || codigo.includes('rate_limit') || mensagem.includes('for security purposes'))
    return { erro: ERRO_TENTATIVAS }

  if (codigo === 'validation_failed' || mensagem.includes('unable to validate email'))
    return { erro: ERRO_EMAIL, campo: 'identificador' }

  return {
    erro:
      contexto === 'entrar'
        ? 'Não foi possível entrar agora. Tente de novo em instantes.'
        : 'Não foi possível criar a conta agora. Tente de novo em instantes.',
  }
}

/** O rótulo do campo aceita CPF; o login, não. Aviso honesto em uma linha. */
function checarIdentificador(bruto: string): EstadoAcesso | null {
  if (!bruto) return { erro: ERRO_SEM_EMAIL, campo: 'identificador' }
  if (pareceCpf(bruto)) return { erro: AVISO_CPF, campo: 'identificador' }
  if (!emailValido(bruto)) return { erro: ERRO_EMAIL, campo: 'identificador' }
  return null
}

/** Entra com e-mail e senha e volta para a página pedida pelo middleware. */
export async function entrar(_estado: EstadoAcesso, formData: FormData): Promise<EstadoAcesso> {
  const entrada = EsquemaEntrar.safeParse({
    identificador: texto(formData.get('identificador')),
    senha: texto(formData.get('senha')),
    proximo: texto(formData.get('proximo')),
  })
  if (!entrada.success) return { erro: ERRO_ENTRADA }

  const identificador = entrada.data.identificador.trim()
  const problema = checarIdentificador(identificador)
  if (problema) return problema
  if (!entrada.data.senha) return { erro: 'Digite sua senha', campo: 'senha' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: identificador.toLowerCase(),
    password: entrada.data.senha,
  })
  if (error) return traduzir(error, 'entrar')

  // O cabeçalho mostra "Conta" conforme a sessão: revalida o layout inteiro.
  revalidatePath('/', 'layout')
  redirect(destinoSeguro(entrada.data.proximo))
}

/**
 * Cria a conta. O nome vai em `options.data.nome` — o gatilho `handle_new_user`
 * usa esse campo para montar o perfil.
 */
export async function criarConta(_estado: EstadoAcesso, formData: FormData): Promise<EstadoAcesso> {
  const entrada = EsquemaCriar.safeParse({
    nome: texto(formData.get('nome')),
    identificador: texto(formData.get('identificador')),
    senha: texto(formData.get('senha')),
    proximo: texto(formData.get('proximo')),
  })
  if (!entrada.success) return { erro: ERRO_ENTRADA }

  const nome = entrada.data.nome.trim().replace(/\s+/g, ' ')
  const identificador = entrada.data.identificador.trim()
  const senha = entrada.data.senha

  if (nome.length < 2) return { erro: 'Digite seu nome para a gente saber como te chamar', campo: 'nome' }
  const problema = checarIdentificador(identificador)
  if (problema) return problema
  if (senha.length < 6) return { erro: 'A senha precisa de pelo menos 6 caracteres', campo: 'senha' }

  const email = identificador.toLowerCase()
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { nome }, emailRedirectTo: `${SITE_URL}/entrar` },
  })
  if (error) return traduzir(error, 'criar')

  // Com confirmação de e-mail ligada, o Supabase devolve usuário sem identidades
  // quando o endereço já existe — é assim que dá para avisar sem vazar a conta.
  if (data.user && data.user.identities?.length === 0)
    return { erro: 'Este e-mail já tem conta', campo: 'identificador' }

  if (!data.session)
    return { ok: `Conta criada. Confirme o e-mail que enviamos para ${email} e depois entre por aqui.` }

  revalidatePath('/', 'layout')
  redirect(destinoSeguro(entrada.data.proximo))
}

/** Envia o link de redefinição. A resposta é sempre a mesma, cadastrado ou não. */
export async function recuperarSenha(_estado: EstadoAcesso, formData: FormData): Promise<EstadoAcesso> {
  const entrada = EsquemaRecuperar.safeParse({ identificador: texto(formData.get('identificador')) })
  if (!entrada.success) return { erro: ERRO_ENTRADA }

  const identificador = entrada.data.identificador.trim()
  const problema = checarIdentificador(identificador)
  if (problema) return problema

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(identificador.toLowerCase(), {
    redirectTo: `${SITE_URL}/entrar`,
  })
  if (error && (error.status === 429 || (error.code ?? '').includes('rate_limit')))
    return { erro: ERRO_TENTATIVAS }

  return { ok: 'Se este e-mail estiver cadastrado, enviamos o link' }
}
