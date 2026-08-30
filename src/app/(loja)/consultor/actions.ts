'use server'

import { createClient } from '@/lib/supabase/server'
import { analisarEstilo, consultorConfigurado, type AnaliseEstilo } from '@/lib/ia/consultor'
import { idDoVisitante } from '@/app/(loja)/provador/actions'
import { afinidade, corMaisProxima, paletaDe, type Cor } from '@/lib/cores'
import { paraResumo, type ProdutoResumo } from '@/lib/queries'

const MAX_BYTES = 8 * 1024 * 1024
const TIPOS = ['image/jpeg', 'image/png', 'image/webp'] as const

export interface PecaRecomendada {
  produto: ProdutoResumo
  /** 0 a 100 — usado só para ordenar, nunca exibido como precisão falsa. */
  nota: number
  cor: { nome: string; hex: string }
  combinaCom: Cor | null
}

export interface EstadoConsultor {
  erro?: string
  limite?: string
  analise?: AnaliseEstilo
  pecas?: PecaRecomendada[]
}

export async function consultar(
  _anterior: EstadoConsultor,
  formData: FormData,
): Promise<EstadoConsultor> {
  if (!consultorConfigurado()) {
    return { erro: 'A consultoria ainda não está ligada nesta loja. Fale com a gente no WhatsApp que a gente te ajuda a escolher.' }
  }

  const supabase = await createClient()
  const visitante = await idDoVisitante()

  const { data: cotaBruta } = await supabase.rpc('consultor_cota', { p_visitante: visitante })
  const cota = cotaBruta as unknown as { pode: boolean; papel: string } | null
  if (cota && !cota.pode) {
    return {
      limite:
        cota.papel === 'visitante'
          ? 'Você atingiu o limite de consultas deste mês. Criando sua conta, você tem direito a mais.'
          : 'Você atingiu o limite de consultas deste mês. Ele volta a contar no mês que vem.',
    }
  }

  const foto = formData.get('foto')
  const questionario = {
    veias: String(formData.get('veias') ?? ''),
    joia: String(formData.get('joia') ?? ''),
    sol: String(formData.get('sol') ?? ''),
    cabelo: String(formData.get('cabelo') ?? ''),
    olhos: String(formData.get('olhos') ?? ''),
  }

  const temFoto = foto instanceof File && foto.size > 0
  const temResposta = Object.values(questionario).some((v) => v !== '')
  if (!temFoto && !temResposta) {
    return { erro: 'Envie uma foto ou responda ao menos uma pergunta para eu conseguir te orientar.' }
  }

  let entradaFoto: { base64: string; mime: (typeof TIPOS)[number] } | undefined
  if (temFoto) {
    const arquivo = foto as File
    if (!TIPOS.includes(arquivo.type as (typeof TIPOS)[number]))
      return { erro: 'A foto precisa ser JPG, PNG ou WebP.' }
    if (arquivo.size > MAX_BYTES) return { erro: 'A foto passa de 8 MB. Envie uma versão menor.' }
    entradaFoto = {
      base64: Buffer.from(await arquivo.arrayBuffer()).toString('base64'),
      mime: arquivo.type as (typeof TIPOS)[number],
    }
  }

  const { analise, erro } = await analisarEstilo({ foto: entradaFoto, questionario })
  if (erro || !analise) return { erro: erro ?? 'Não consegui concluir a análise.' }

  // Guarda o perfil. A foto NÃO é guardada: para a consultoria ela não tem uso depois.
  const { data: clienteId } = await supabase.rpc('my_customer_id')
  const customerId = (clienteId as unknown as string | null) ?? null

  await supabase.from('perfis_estilo').insert({
    customer_id: customerId,
    visitante_id: customerId ? null : visitante,
    subtom: analise.subtom,
    estacao: analise.estacao,
    contraste: analise.contraste,
    paleta: analise.paleta,
    evitar: analise.evitar,
    resumo: analise.resumo,
  })

  const pecas = await recomendar(analise.paleta)
  return { analise, pecas }
}

/**
 * Casa a paleta com o catálogo de verdade. A recomendação sai daqui, não do
 * modelo: só entram peças ativas, com cor cadastrada e estoque para vender.
 */
async function recomendar(paleta: Cor[], limite = 8): Promise<PecaRecomendada[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select(
      'id, slug, nome, ref, preco, preco_comparativo, selo, fotos, videos, medidas_tabela, status, destaque, criado_em, category_id, tecido, descricao, medidas, peso, fornecedor, aceita_encomenda, prazo_encomenda_dias, categories(slug, nome), variants(*)',
    )
    .eq('status', 'ativo')

  const limpa = paletaDe(paleta)
  if (limpa.length === 0) return []

  const candidatas: PecaRecomendada[] = []

  for (const linha of (data ?? []) as unknown as Parameters<typeof paraResumo>[0][]) {
    const produto = paraResumo(linha)
    // Peça sem estoque nenhum não entra: recomendar o que não dá para comprar irrita.
    if (!produto.prontaEntrega) continue

    let melhorNota = -1
    let melhorCor: { nome: string; hex: string } | null = null

    for (const cor of produto.cores) {
      const nota = afinidade(cor.hex, limpa)
      if (nota > melhorNota) {
        melhorNota = nota
        melhorCor = cor
      }
    }

    if (melhorCor && melhorNota > 0) {
      candidatas.push({
        produto,
        nota: melhorNota,
        cor: melhorCor,
        combinaCom: corMaisProxima(melhorCor.hex, limpa),
      })
    }
  }

  return candidatas.sort((a, b) => b.nota - a.nota).slice(0, limite)
}
