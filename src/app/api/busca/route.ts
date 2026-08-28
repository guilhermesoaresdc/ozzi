import { buscarProdutos } from '@/lib/queries'

/** A busca lê o estoque a cada tecla — nada de cache entre visitantes. */
export const dynamic = 'force-dynamic'

const SEM_CACHE = { 'cache-control': 'no-store' }
const LIMITE_TERMO = 60

/**
 * Normaliza o termo antes de entrar no filtro `or()` do PostgREST: vírgula e
 * parêntese são separadores da sintaxe do filtro e quebrariam a consulta.
 */
function limparTermo(bruto: string): string {
  return bruto
    .replace(/[,()"\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, LIMITE_TERMO)
}

export async function GET(request: Request) {
  const termo = limparTermo(new URL(request.url).searchParams.get('q') ?? '')

  if (!termo) {
    return Response.json({ termo: '', total: 0, produtos: [] }, { headers: SEM_CACHE })
  }

  try {
    const produtos = await buscarProdutos(termo)
    return Response.json(
      { termo, total: produtos.length, produtos },
      { headers: SEM_CACHE },
    )
  } catch {
    return Response.json(
      { termo, erro: 'Não foi possível buscar agora.' },
      { status: 500, headers: SEM_CACHE },
    )
  }
}
