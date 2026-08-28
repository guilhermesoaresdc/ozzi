import { mascaraCep, soDigitos } from '@/lib/format'

/** A consulta depende do CEP da requisição — nunca é pré-renderizada. */
export const dynamic = 'force-dynamic'

const SEM_CACHE = { 'cache-control': 'no-store' }
// O CEP de um endereço não muda: vale guardar por um dia na borda.
const COM_CACHE = { 'cache-control': 'public, max-age=86400, s-maxage=86400' }
const TEMPO_LIMITE = 6000

interface RespostaViaCep {
  cep?: string
  logradouro?: string
  complemento?: string
  bairro?: string
  localidade?: string
  uf?: string
  erro?: boolean | string
}

export interface EnderecoDoCep {
  cep: string
  rua: string
  bairro: string
  cidade: string
  uf: string
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : ''
}

/**
 * Ponte para o ViaCEP (handoff §7). A consulta sai do servidor para não expor
 * o navegador do visitante a um terceiro nem depender do CORS deles.
 */
export async function GET(request: Request) {
  const cep = soDigitos(new URL(request.url).searchParams.get('cep') ?? '')

  if (cep.length !== 8) {
    return Response.json({ erro: 'O CEP tem 8 dígitos' }, { status: 400, headers: SEM_CACHE })
  }

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(TEMPO_LIMITE),
      cache: 'no-store',
    })

    if (!resposta.ok) {
      return Response.json(
        { erro: 'Não foi possível consultar o CEP agora' },
        { status: 502, headers: SEM_CACHE },
      )
    }

    const dados = (await resposta.json()) as RespostaViaCep

    if (dados.erro) {
      return Response.json({ erro: 'CEP não encontrado' }, { status: 404, headers: SEM_CACHE })
    }

    const endereco: EnderecoDoCep = {
      cep: mascaraCep(cep),
      rua: texto(dados.logradouro),
      bairro: texto(dados.bairro),
      cidade: texto(dados.localidade),
      uf: texto(dados.uf).toUpperCase(),
    }

    // Sem cidade não há o que preencher — trata como CEP inexistente.
    if (!endereco.cidade) {
      return Response.json({ erro: 'CEP não encontrado' }, { status: 404, headers: SEM_CACHE })
    }

    return Response.json(endereco, { headers: COM_CACHE })
  } catch {
    return Response.json(
      { erro: 'Não foi possível consultar o CEP agora' },
      { status: 502, headers: SEM_CACHE },
    )
  }
}
