import 'server-only'

/**
 * Adaptador do provador virtual.
 *
 * O Claude não gera imagem, então esta função depende de um provedor externo.
 * Qual deles vale é decidido por variável de ambiente, para trocar sem mexer
 * no resto do código:
 *
 *   PROVADOR_PROVEDOR = gemini | openai | fal
 *   PROVADOR_API_KEY  = a chave do provedor escolhido
 *   PROVADOR_MODELO   = opcional, sobrescreve o modelo padrão
 */

export type Provedor = 'gemini' | 'openai' | 'fal'

export interface EntradaProva {
  /** Foto da pessoa, em bytes. */
  pessoa: { base64: string; mime: string }
  /** Foto da peça, em bytes. */
  peca: { base64: string; mime: string }
  /** Nome e descrição curta da peça, para orientar a geração. */
  descricaoPeca: string
}

export interface SaidaProva {
  base64?: string
  mime?: string
  erro?: string
}

const INSTRUCAO = [
  'Você é um provador virtual de uma loja de moda feminina.',
  'A primeira imagem é a foto de uma pessoa. A segunda é uma peça de roupa.',
  'Gere uma nova imagem fotorrealista da MESMA pessoa da primeira imagem,',
  'com o mesmo rosto, mesmo tom de pele, mesmo cabelo, mesmo corpo e mesmo cenário,',
  'porém vestindo a peça da segunda imagem.',
  'Preserve fielmente o corte, a cor, a estampa e o tecido da peça.',
  'Não altere o rosto da pessoa e não escreva texto na imagem.',
].join(' ')

export function provedorConfigurado(): { provedor: Provedor; chave: string } | null {
  const chave = process.env.PROVADOR_API_KEY
  if (!chave) return null
  const bruto = (process.env.PROVADOR_PROVEDOR ?? 'gemini').toLowerCase()
  const provedor: Provedor = bruto === 'openai' || bruto === 'fal' ? bruto : 'gemini'
  return { provedor, chave }
}

export async function gerarProva(entrada: EntradaProva): Promise<SaidaProva> {
  const config = provedorConfigurado()
  if (!config) {
    return { erro: 'O provador ainda não está ligado. Configure PROVADOR_API_KEY para ativar.' }
  }

  try {
    if (config.provedor === 'gemini') return await viaGemini(entrada, config.chave)
    if (config.provedor === 'openai') return await viaOpenAI(entrada, config.chave)
    return await viaFal(entrada, config.chave)
  } catch (e) {
    const detalhe = e instanceof Error ? e.message : String(e)
    return { erro: `Falha ao falar com o provedor de imagem: ${detalhe}` }
  }
}

/* ------------------------------------------------------------------ *
 * Google Gemini
 * ------------------------------------------------------------------ */

async function viaGemini(entrada: EntradaProva, chave: string): Promise<SaidaProva> {
  const modelo = process.env.PROVADOR_MODELO ?? 'gemini-2.5-flash-image'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`

  const resposta = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': chave },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${INSTRUCAO}\n\nPeça: ${entrada.descricaoPeca}` },
            { inline_data: { mime_type: entrada.pessoa.mime, data: entrada.pessoa.base64 } },
            { inline_data: { mime_type: entrada.peca.mime, data: entrada.peca.base64 } },
          ],
        },
      ],
    }),
  })

  if (!resposta.ok) return { erro: await mensagemDeErro(resposta) }

  const dados = await resposta.json()
  const partes = dados?.candidates?.[0]?.content?.parts ?? []
  for (const parte of partes) {
    const inline = parte?.inline_data ?? parte?.inlineData
    if (inline?.data) return { base64: inline.data, mime: inline.mime_type ?? inline.mimeType ?? 'image/png' }
  }
  return { erro: 'O provedor respondeu sem imagem. Tente outra foto, de corpo inteiro e bem iluminada.' }
}

/* ------------------------------------------------------------------ *
 * OpenAI
 * ------------------------------------------------------------------ */

async function viaOpenAI(entrada: EntradaProva, chave: string): Promise<SaidaProva> {
  const modelo = process.env.PROVADOR_MODELO ?? 'gpt-image-1'
  const form = new FormData()
  form.append('model', modelo)
  form.append('prompt', `${INSTRUCAO}\n\nPeça: ${entrada.descricaoPeca}`)
  form.append('image[]', paraBlob(entrada.pessoa), 'pessoa.png')
  form.append('image[]', paraBlob(entrada.peca), 'peca.png')

  const resposta = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { authorization: `Bearer ${chave}` },
    body: form,
  })

  if (!resposta.ok) return { erro: await mensagemDeErro(resposta) }

  const dados = await resposta.json()
  const b64 = dados?.data?.[0]?.b64_json
  if (!b64) return { erro: 'O provedor respondeu sem imagem.' }
  return { base64: b64, mime: 'image/png' }
}

/* ------------------------------------------------------------------ *
 * fal.ai — modelo especializado em provador
 * ------------------------------------------------------------------ */

async function viaFal(entrada: EntradaProva, chave: string): Promise<SaidaProva> {
  const modelo = process.env.PROVADOR_MODELO ?? 'fal-ai/idm-vton'

  const resposta = await fetch(`https://fal.run/${modelo}`, {
    method: 'POST',
    headers: { authorization: `Key ${chave}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      human_image_url: `data:${entrada.pessoa.mime};base64,${entrada.pessoa.base64}`,
      garment_image_url: `data:${entrada.peca.mime};base64,${entrada.peca.base64}`,
      description: entrada.descricaoPeca,
    }),
  })

  if (!resposta.ok) return { erro: await mensagemDeErro(resposta) }

  const dados = await resposta.json()
  const url: string | undefined = dados?.image?.url ?? dados?.images?.[0]?.url
  if (!url) return { erro: 'O provedor respondeu sem imagem.' }

  const imagem = await fetch(url)
  if (!imagem.ok) return { erro: 'Não consegui baixar a imagem gerada.' }
  const buffer = Buffer.from(await imagem.arrayBuffer())
  return { base64: buffer.toString('base64'), mime: imagem.headers.get('content-type') ?? 'image/png' }
}

/* ------------------------------------------------------------------ */

function paraBlob(img: { base64: string; mime: string }): Blob {
  return new Blob([Buffer.from(img.base64, 'base64')], { type: img.mime })
}

/** Erro do provedor sem vazar a chave nem despejar HTML na tela da cliente. */
async function mensagemDeErro(resposta: Response): Promise<string> {
  let detalhe = ''
  try {
    const corpo = await resposta.json()
    detalhe = corpo?.error?.message ?? corpo?.message ?? ''
  } catch {
    detalhe = ''
  }
  if (resposta.status === 401 || resposta.status === 403)
    return 'A chave do provedor de imagem foi recusada. Confira PROVADOR_API_KEY.'
  if (resposta.status === 429) return 'O provedor está com muitos pedidos agora. Tente daqui a pouco.'
  return `O provedor devolveu ${resposta.status}${detalhe ? `: ${detalhe}` : ''}.`
}
