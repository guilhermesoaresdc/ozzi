import 'server-only'

import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'

/**
 * Consultoria de coloração pessoal.
 *
 * Diferente do provador, que gera imagem, aqui o trabalho é de ANÁLISE — e
 * isso o Claude faz direto. A recomendação de peças NÃO sai do modelo: ele
 * devolve a paleta, e o casamento com o catálogo é feito no código, contra as
 * cores reais das variantes em estoque. Assim a loja nunca recomenda uma peça
 * que não existe.
 */

const Cor = z.object({
  nome: z.string().describe('Nome da cor em português, como "terracota" ou "azul-petróleo"'),
  hex: z.string().describe('A cor em hexadecimal, como #A9603F'),
})

const Analise = z.object({
  subtom: z.enum(['quente', 'frio', 'neutro']).describe('Subtom de pele predominante'),
  estacao: z
    .enum(['primavera', 'verao', 'outono', 'inverno'])
    .describe('Estação da coloração pessoal'),
  contraste: z.enum(['baixo', 'medio', 'alto']).describe('Contraste entre pele, cabelo e olhos'),
  paleta: z.array(Cor).min(6).max(10).describe('Cores que valorizam esta pessoa'),
  evitar: z.array(Cor).min(2).max(5).describe('Cores que tendem a apagar esta pessoa'),
  resumo: z
    .string()
    .describe('Explicação curta e acolhedora, em português do Brasil, de 2 a 4 frases, dirigida à pessoa por "você"'),
})

export type AnaliseEstilo = z.infer<typeof Analise>

const SISTEMA = `Você é consultora de coloração pessoal de uma loja de moda feminina no Cariri cearense.

Seu trabalho é identificar o SUBTOM de pele (quente, frio ou neutro), o CONTRASTE entre
pele, cabelo e olhos, e a ESTAÇÃO da coloração pessoal — e a partir disso indicar a
paleta de cores que valoriza a pessoa.

Regras de conduta, e elas são firmes:
- Fale de COR e de LUZ, nunca de raça, etnia ou origem. Subtom não é cor da pele:
  peles de qualquer tom podem ter subtom quente, frio ou neutro.
- Nunca comente peso, formato do corpo, idade ou traços do rosto. Nada de dizer o que
  "esconder", "disfarçar" ou "corrigir". A conversa é sobre o que ilumina a pessoa.
- Escreva em português do Brasil, com o calor de quem atende no balcão e conhece a
  cliente pelo nome. Sem jargão de consultoria e sem promessa exagerada.
- Se a foto não permitir uma leitura honesta — pouca luz, muito filtro, rosto encoberto —
  escolha "neutro" e diga no resumo, com franqueza, que a foto dificultou a leitura e que
  uma foto com luz natural daria um resultado melhor.

Devolva de 6 a 10 cores na paleta, com nome em português e hexadecimal fiel ao nome.`

export function consultorConfigurado(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

export interface EntradaAnalise {
  foto?: { base64: string; mime: 'image/jpeg' | 'image/png' | 'image/webp' }
  /** Respostas do questionário, para quem prefere não enviar foto. */
  questionario?: {
    veias?: string
    joia?: string
    sol?: string
    cabelo?: string
    olhos?: string
  }
}

export async function analisarEstilo(
  entrada: EntradaAnalise,
): Promise<{ analise?: AnaliseEstilo; erro?: string }> {
  if (!consultorConfigurado()) {
    return { erro: 'A consultoria ainda não está ligada nesta loja.' }
  }

  const client = new Anthropic()
  const partes: Anthropic.ContentBlockParam[] = []

  if (entrada.foto) {
    partes.push({
      type: 'image',
      source: { type: 'base64', media_type: entrada.foto.mime, data: entrada.foto.base64 },
    })
  }

  const q = entrada.questionario
  const respostas = q
    ? [
        q.veias && `Cor das veias no pulso: ${q.veias}`,
        q.joia && `Joia que valoriza mais: ${q.joia}`,
        q.sol && `Reação da pele ao sol: ${q.sol}`,
        q.cabelo && `Cor natural do cabelo: ${q.cabelo}`,
        q.olhos && `Cor dos olhos: ${q.olhos}`,
      ]
        .filter(Boolean)
        .join('\n')
    : ''

  partes.push({
    type: 'text',
    text: [
      entrada.foto
        ? 'Analise a coloração pessoal desta pessoa a partir da foto.'
        : 'Analise a coloração pessoal desta pessoa a partir das respostas abaixo.',
      respostas && `\nRespostas do questionário:\n${respostas}`,
    ]
      .filter(Boolean)
      .join('\n'),
  })

  try {
    const resposta = await client.messages.parse({
      model: 'claude-opus-5',
      max_tokens: 8000,
      system: SISTEMA,
      thinking: { type: 'adaptive' },
      messages: [{ role: 'user', content: partes }],
      output_config: { format: zodOutputFormat(Analise) },
    })

    if (resposta.stop_reason === 'refusal') {
      return { erro: 'Não consegui analisar esta foto. Tente outra, com luz natural e o rosto visível.' }
    }

    const analise = resposta.parsed_output
    if (!analise) return { erro: 'Não consegui ler o resultado da análise. Tente de novo.' }

    return { analise }
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) {
      return { erro: 'A chave da consultoria foi recusada. Confira ANTHROPIC_API_KEY.' }
    }
    if (e instanceof Anthropic.RateLimitError) {
      return { erro: 'Muitas consultas agora. Tente daqui a pouco.' }
    }
    if (e instanceof Anthropic.APIError) {
      return { erro: `A consultoria falhou (${e.status}). Tente de novo.` }
    }
    return { erro: 'A consultoria falhou. Tente de novo.' }
  }
}
