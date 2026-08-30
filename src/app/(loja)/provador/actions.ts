'use server'

import { randomUUID } from 'node:crypto'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { gerarProva, provedorConfigurado } from '@/lib/ia/provador'

const COOKIE_VISITANTE = 'ozzi_visitante'
const BUCKET = 'provas'
const MAX_BYTES = 10 * 1024 * 1024
const TIPOS = ['image/jpeg', 'image/png', 'image/webp']

export interface EstadoProva {
  erro?: string
  /** Mensagem de limite, separada do erro: não é falha, é regra. */
  limite?: string
  imagem?: string
  id?: string
}

/** Id de navegador para quem prova sem ter conta. */
export async function idDoVisitante(): Promise<string> {
  const jar = await cookies()
  const atual = jar.get(COOKIE_VISITANTE)?.value
  if (atual) return atual

  const novo = randomUUID()
  jar.set(COOKIE_VISITANTE, novo, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })
  return novo
}

interface Cota {
  papel: string
  limite: number | null
  usadas: number
  restantes: number | null
  pode: boolean
}

export async function cotaAtual(): Promise<Cota> {
  const supabase = await createClient()
  const visitante = await idDoVisitante()
  const { data } = await supabase.rpc('prova_cota', { p_visitante: visitante })
  return (data as unknown as Cota) ?? { papel: 'visitante', limite: 5, usadas: 0, restantes: 5, pode: true }
}

export async function provar(_anterior: EstadoProva, formData: FormData): Promise<EstadoProva> {
  const productId = String(formData.get('product_id') ?? '')
  const variantId = String(formData.get('variant_id') ?? '') || null
  const foto = formData.get('foto')

  if (!productId) return { erro: 'Não identifiquei a peça. Recarregue a página e tente de novo.' }
  if (!(foto instanceof File) || foto.size === 0) return { erro: 'Escolha uma foto sua para provar a peça.' }
  if (!TIPOS.includes(foto.type)) return { erro: 'A foto precisa ser JPG, PNG ou WebP.' }
  if (foto.size > MAX_BYTES) return { erro: 'A foto passa de 10 MB. Envie uma versão menor.' }

  if (!provedorConfigurado()) {
    return { erro: 'O provador ainda não está ligado nesta loja. Fale com a gente no WhatsApp que a gente te ajuda a escolher a numeração.' }
  }

  const supabase = await createClient()
  const visitante = await idDoVisitante()

  const cota = await cotaAtual()
  if (!cota.pode) {
    return {
      limite:
        cota.papel === 'visitante'
          ? 'Você atingiu o limite de provas deste mês. Criando sua conta, você prova mais peças.'
          : 'Você atingiu o limite de provas deste mês. Ele volta a contar no mês que vem.',
    }
  }

  // A peça precisa de uma foto cadastrada para servir de referência.
  const { data: produto } = await supabase
    .from('products')
    .select('id, nome, tecido, descricao, fotos, slug')
    .eq('id', productId)
    .neq('status', 'rascunho')
    .maybeSingle()

  if (!produto) return { erro: 'Esta peça não está mais disponível.' }

  const fotos = Array.isArray(produto.fotos) ? (produto.fotos as unknown[]).filter((f) => typeof f === 'string') : []
  const fotoPeca = fotos[0] as string | undefined
  if (!fotoPeca) {
    return { erro: 'Esta peça ainda não tem foto cadastrada, então não dá para provar. Já já colocamos.' }
  }

  let admin: ReturnType<typeof createAdminClient>
  try {
    admin = createAdminClient()
  } catch {
    return { erro: 'O provador está em configuração. Tente novamente mais tarde.' }
  }

  // Baixa a foto da peça e converte as duas para base64
  const respostaPeca = await fetch(fotoPeca)
  if (!respostaPeca.ok) return { erro: 'Não consegui carregar a foto da peça. Tente de novo.' }
  const pecaBuffer = Buffer.from(await respostaPeca.arrayBuffer())
  const pessoaBuffer = Buffer.from(await foto.arrayBuffer())

  // Guarda a foto da pessoa no bucket privado antes de gerar
  const pasta = `${visitante}/${randomUUID()}`
  const caminhoPessoa = `${pasta}/pessoa.${extensao(foto.type)}`
  const envio = await admin.storage.from(BUCKET).upload(caminhoPessoa, pessoaBuffer, {
    contentType: foto.type,
    upsert: false,
  })
  if (envio.error) return { erro: 'Não consegui guardar sua foto. Tente de novo.' }

  const { data: cliente } = await supabase.rpc('my_customer_id')
  const customerId = (cliente as unknown as string | null) ?? null

  const { data: linha } = await admin
    .from('provas')
    .insert({
      product_id: productId,
      variant_id: variantId,
      customer_id: customerId,
      visitante_id: customerId ? null : visitante,
      foto_pessoa: caminhoPessoa,
      status: 'processando',
    })
    .select('id')
    .single()

  const provaId = linha?.id
  const descricao = [produto.nome, produto.tecido].filter(Boolean).join(' — ')

  const resultado = await gerarProva({
    pessoa: { base64: pessoaBuffer.toString('base64'), mime: foto.type },
    peca: { base64: pecaBuffer.toString('base64'), mime: respostaPeca.headers.get('content-type') ?? 'image/jpeg' },
    descricaoPeca: descricao,
  })

  if (resultado.erro || !resultado.base64) {
    if (provaId) await admin.from('provas').update({ status: 'erro', erro: resultado.erro }).eq('id', provaId)
    return { erro: resultado.erro ?? 'Não consegui gerar a imagem desta vez. Tente com outra foto.' }
  }

  const caminhoGerado = `${pasta}/gerada.png`
  const gravado = await admin.storage
    .from(BUCKET)
    .upload(caminhoGerado, Buffer.from(resultado.base64, 'base64'), {
      contentType: resultado.mime ?? 'image/png',
      upsert: true,
    })

  if (gravado.error) {
    if (provaId) await admin.from('provas').update({ status: 'erro', erro: 'falha ao guardar' }).eq('id', provaId)
    return { erro: 'Gerei a imagem, mas não consegui guardar. Tente de novo.' }
  }

  if (provaId) {
    await admin.from('provas').update({ status: 'pronta', imagem_gerada: caminhoGerado }).eq('id', provaId)
  }

  const { data: assinada } = await admin.storage.from(BUCKET).createSignedUrl(caminhoGerado, 60 * 60)

  revalidatePath('/provador')
  return { imagem: assinada?.signedUrl, id: provaId }
}

function extensao(mime: string): string {
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  return 'jpg'
}
