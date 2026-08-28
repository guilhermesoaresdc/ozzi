'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

/** Estado devolvido às telas: erro ou confirmação, sempre em pt-BR. */
export interface EstadoAcao {
  erro?: string
  ok?: string
}

const ERRO_ENTRADA = 'Não entendi o que salvar nesta tela. Recarregue a página e tente de novo.'
const ERRO_SESSAO = 'Sua sessão não tem permissão para editar o e-mail marketing. Entre de novo no painel.'
const ERRO_SALVAR = 'Não foi possível salvar agora. Tente de novo em instantes.'

/** Nada sai da loja: não há provedor de e-mail conectado, só o registro no painel. */
const SEM_PROVEDOR = 'Nada é disparado até um provedor de e-mail ser conectado.'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const DATA = /^\d{4}-\d{2}-\d{2}$/
const HORA = /^\d{2}:\d{2}$/

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

/** O Cariri é UTC−3 o ano inteiro; a loja agenda no horário dela, não no do servidor. */
const FUSO = '-03:00'

const texto = (dado: FormDataEntryValue | null) => (typeof dado === 'string' ? dado : '')

/** Cliente de sessão, já com o papel conferido — o RLS silencioso não avisaria. */
async function admin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: perfil } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (perfil?.role !== 'admin') return null

  return supabase
}

function revalidar() {
  revalidatePath('/admin/email')
  revalidatePath('/admin')
}

/* ------------------------------------------------------------------ *
 * Automações
 * ------------------------------------------------------------------ */

const EsquemaAutomacao = z.object({
  id: z.string().regex(UUID),
  ativo: z.boolean(),
})

/**
 * Liga ou desliga uma automação de verdade (`email_automations.ativo`).
 * O painel guarda a configuração; o disparo depende do provedor de e-mail.
 */
export async function alternarAutomacao(id: string, ativo: boolean): Promise<EstadoAcao> {
  const entrada = EsquemaAutomacao.safeParse({ id, ativo })
  if (!entrada.success) return { erro: ERRO_ENTRADA }

  const supabase = await admin()
  if (!supabase) return { erro: ERRO_SESSAO }

  const { data: automacao } = await supabase
    .from('email_automations')
    .select('nome')
    .eq('id', entrada.data.id)
    .maybeSingle()
  if (!automacao) return { erro: 'Automação não encontrada. Recarregue a página.' }

  const { error } = await supabase
    .from('email_automations')
    .update({ ativo: entrada.data.ativo })
    .eq('id', entrada.data.id)
  if (error) return { erro: ERRO_SALVAR }

  revalidar()
  return {
    ok: entrada.data.ativo
      ? `${automacao.nome} ligada. ${SEM_PROVEDOR}`
      : `${automacao.nome} desligada.`,
  }
}

/* ------------------------------------------------------------------ *
 * Campanhas
 * ------------------------------------------------------------------ */

const EsquemaCampanha = z.object({
  assunto: z
    .string()
    .trim()
    .min(3, 'O e-mail precisa de um assunto — é a única coisa que a cliente lê antes de abrir.')
    .max(120, 'O assunto passa de 120 caracteres e vai ser cortado na caixa de entrada.'),
  preHeader: z.string().trim().max(160, 'O pré-cabeçalho passa de 160 caracteres.'),
  data: z
    .string()
    .trim()
    .refine((v) => v === '' || DATA.test(v), 'Data inválida. Use o seletor de data do campo.'),
  hora: z
    .string()
    .trim()
    .refine((v) => v === '' || HORA.test(v), 'Hora inválida. Use o seletor de hora do campo.'),
})

/** "25 ago · 08:00" — o rótulo que a coluna Envio mostra. */
function rotuloEnvio(data: string, hora: string): string {
  const [, mes, dia] = data.split('-')
  return `${Number(dia)} ${MESES[Number(mes) - 1]} · ${hora}`
}

/**
 * Grava a campanha em `email_campaigns`: rascunho ou agendada.
 * O conteúdo do modelo (título, texto, botão) não tem coluna nesta tabela —
 * o que fica salvo é o cabeçalho do envio.
 */
export async function salvarCampanha(_estado: EstadoAcao, formData: FormData): Promise<EstadoAcao> {
  // Identificadores e o botão clicado não têm texto de erro para a cliente:
  // se vierem errados, o problema é a tela, não o que ela escreveu.
  const id = texto(formData.get('id'))
  const acao = texto(formData.get('acao'))
  const lista = texto(formData.get('lista'))
  if (id && !UUID.test(id)) return { erro: ERRO_ENTRADA }
  if (lista && !UUID.test(lista)) return { erro: ERRO_ENTRADA }
  if (acao !== 'agendar' && acao !== 'rascunho') return { erro: ERRO_ENTRADA }

  const entrada = EsquemaCampanha.safeParse({
    assunto: texto(formData.get('assunto')),
    preHeader: texto(formData.get('pre_header')),
    data: texto(formData.get('data')),
    hora: texto(formData.get('hora')),
  })
  if (!entrada.success) return { erro: entrada.error.issues[0]?.message ?? ERRO_ENTRADA }

  const d = { ...entrada.data, id, lista }
  const agendar = acao === 'agendar'

  if (agendar && !d.lista) return { erro: 'Escolha a lista que vai receber o e-mail antes de agendar.' }
  if (agendar && (!d.data || !d.hora))
    return { erro: 'Para agendar, preencha a data e a hora do envio.' }
  if (!agendar && ((d.data && !d.hora) || (!d.data && d.hora)))
    return { erro: 'Preencha data e hora juntas, ou deixe as duas vazias no rascunho.' }

  let agendadoPara: string | null = null
  let envioRotulo: string | null = null

  if (d.data && d.hora) {
    const quando = new Date(`${d.data}T${d.hora}:00${FUSO}`)
    if (Number.isNaN(quando.getTime())) return { erro: 'Data e hora do envio não formam um horário válido.' }
    if (agendar && quando.getTime() <= Date.now())
      return { erro: 'Esse horário já passou. Escolha uma data e hora à frente para agendar.' }
    agendadoPara = quando.toISOString()
    envioRotulo = rotuloEnvio(d.data, d.hora)
  }

  const supabase = await admin()
  if (!supabase) return { erro: ERRO_SESSAO }

  const linha = {
    assunto: d.assunto,
    pre_header: d.preHeader || null,
    lista_id: d.lista || null,
    agendado_para: agendadoPara,
    envio_rotulo: envioRotulo ?? '—',
    status: agendar ? ('agendada' as const) : ('rascunho' as const),
  }

  if (d.id) {
    const { data: atual } = await supabase
      .from('email_campaigns')
      .select('status')
      .eq('id', d.id)
      .maybeSingle()
    if (!atual) return { erro: 'Campanha não encontrada. Recarregue a página.' }
    if (atual.status !== 'rascunho' && atual.status !== 'agendada')
      return { erro: 'Campanha já enviada não pode ser reescrita. Crie uma nova a partir deste modelo.' }

    const { error } = await supabase.from('email_campaigns').update(linha).eq('id', d.id)
    if (error) return { erro: ERRO_SALVAR }
  } else {
    const { error } = await supabase.from('email_campaigns').insert(linha)
    if (error) return { erro: ERRO_SALVAR }
  }

  revalidar()

  if (agendar) return { ok: `Campanha agendada para ${envioRotulo}. ${SEM_PROVEDOR}` }
  return { ok: `Rascunho de “${d.assunto}” salvo. ${SEM_PROVEDOR}` }
}
