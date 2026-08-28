import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, TableScroll } from '@/components/admin/Card'
import { PageHeader } from '@/components/admin/PageHeader'
import { Placeholder } from '@/components/ui/Placeholder'
import type { CustomerRow, Json, OrderRow, ProductRow } from '@/lib/database.types'
import { brl, dataCurta, num } from '@/lib/format'
import { STATUS_PEDIDO, STATUS_PRODUTO } from '@/lib/status'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Busca' }

const LIMITE = 8

type Busca = Promise<{ [chave: string]: string | string[] | undefined }>

type PedidoAchado = Pick<
  OrderRow,
  'id' | 'codigo' | 'cliente_nome' | 'cliente_cidade' | 'cliente_uf' | 'status' | 'total' | 'criado_em'
>
type ProdutoAchado = Pick<ProductRow, 'id' | 'nome' | 'ref' | 'preco' | 'status' | 'fotos'>
type ClienteAchado = Pick<CustomerRow, 'id' | 'nome' | 'email' | 'telefone' | 'cidade' | 'uf'>

interface Resultados {
  pedidos: PedidoAchado[]
  produtos: ProdutoAchado[]
  clientes: ClienteAchado[]
}

const VAZIO: Resultados = { pedidos: [], produtos: [], clientes: [] }

/** Uma linha só por item, mesmo quando duas colunas casam com o termo. */
function juntar<T extends { id: string }>(...listas: (T[] | null)[]): T[] {
  const mapa = new Map<string, T>()
  for (const lista of listas) for (const item of lista ?? []) mapa.set(item.id, item)
  return [...mapa.values()].slice(0, LIMITE)
}

function primeiraFoto(fotos: Json): string | null {
  if (!Array.isArray(fotos)) return null
  const foto = fotos[0]
  return typeof foto === 'string' && foto ? foto : null
}

async function procurar(termo: string): Promise<Resultados> {
  // Os curingas do ilike (% e _) e a vírgula da sintaxe do PostgREST saem do termo.
  const alvo = termo.replace(/[%_,()]/g, ' ').trim()
  if (!alvo) return VAZIO

  const padrao = `%${alvo}%`
  const supabase = await createClient()

  const pedidoPor = (coluna: 'codigo' | 'cliente_nome') =>
    supabase
      .from('orders')
      .select('id, codigo, cliente_nome, cliente_cidade, cliente_uf, status, total, criado_em')
      .ilike(coluna, padrao)
      .order('criado_em', { ascending: false })
      .limit(LIMITE)

  const produtoPor = (coluna: 'nome' | 'ref') =>
    supabase
      .from('products')
      .select('id, nome, ref, preco, status, fotos')
      .ilike(coluna, padrao)
      .order('nome')
      .limit(LIMITE)

  const clientePor = (coluna: 'nome' | 'email' | 'telefone') =>
    supabase
      .from('customers')
      .select('id, nome, email, telefone, cidade, uf')
      .ilike(coluna, padrao)
      .order('nome')
      .limit(LIMITE)

  const [porCodigo, porNomeNoPedido, porNomeDaPeca, porRef, porNome, porEmail, porTelefone] =
    await Promise.all([
      pedidoPor('codigo'),
      pedidoPor('cliente_nome'),
      produtoPor('nome'),
      produtoPor('ref'),
      clientePor('nome'),
      clientePor('email'),
      clientePor('telefone'),
    ])

  return {
    pedidos: juntar<PedidoAchado>(porCodigo.data, porNomeNoPedido.data),
    produtos: juntar<ProdutoAchado>(porNomeDaPeca.data, porRef.data),
    clientes: juntar<ClienteAchado>(porNome.data, porEmail.data, porTelefone.data),
  }
}

function Cabecalho({ colunas, rotulos }: { colunas: string; rotulos: string[] }) {
  return (
    <div
      className="grid gap-[14px] border-b border-line px-5 py-[14px] uppercase"
      style={{ gridTemplateColumns: colunas, fontSize: 10.5, letterSpacing: '.14em', color: '#8A8375' }}
    >
      {rotulos.map((r, i) => (
        <span key={r || `col-${i}`} className={r === 'Total' ? 'text-right' : undefined}>
          {r}
        </span>
      ))}
    </div>
  )
}

const COL_PEDIDOS = '1.2fr 1.6fr 1.2fr .8fr'
const COL_PRODUTOS = '56px 2.2fr 1fr 1fr'
const COL_CLIENTES = '1.8fr 1.6fr 1.2fr'

export default async function BuscaPage({ searchParams }: { searchParams: Busca }) {
  const { q } = await searchParams
  const bruto = Array.isArray(q) ? q[0] : q
  const termo = (bruto ?? '').trim()

  const { pedidos, produtos, clientes } = termo ? await procurar(termo) : VAZIO
  const total = pedidos.length + produtos.length + clientes.length

  const subtitulo = termo
    ? `${num(total)} ${total === 1 ? 'resultado' : 'resultados'} para “${termo}”`
    : 'Pedidos, produtos e clientes em um lugar só'

  return (
    <>
      <PageHeader titulo="Busca" subtitulo={subtitulo} />

      <main className="flex flex-col gap-[22px]" style={{ padding: '26px 30px 60px' }}>
        {!termo && (
          <Card titulo="O que dá para buscar aqui">
            <div style={{ fontSize: 13.5, lineHeight: 1.7, color: '#5C574D', maxWidth: 620 }}>
              <p>Digite no campo de busca do topo e procure por:</p>
              <ul className="mt-3 flex flex-col gap-2">
                <li>
                  <strong style={{ fontWeight: 400, color: '#232320' }}>Pedidos</strong> — pelo código
                  (OZ-2841) ou pelo nome de quem comprou.
                </li>
                <li>
                  <strong style={{ fontWeight: 400, color: '#232320' }}>Produtos</strong> — pelo nome da
                  peça ou pela referência (OZ-1042).
                </li>
                <li>
                  <strong style={{ fontWeight: 400, color: '#232320' }}>Clientes</strong> — pelo nome,
                  pelo e-mail ou pelo telefone.
                </li>
              </ul>
            </div>
          </Card>
        )}

        {termo && total === 0 && (
          <Card>
            <div className="text-center" style={{ padding: '28px 0' }}>
              <p style={{ fontSize: 13.5, color: '#5C574D' }}>
                Nada encontrado para &ldquo;{termo}&rdquo;.
              </p>
              <p className="mt-[6px]" style={{ fontSize: 12, color: '#8A8375' }}>
                Tente o código do pedido, a referência da peça ou parte do nome da cliente.
              </p>
            </div>
          </Card>
        )}

        {pedidos.length > 0 && (
          <Card
            semPadding
            titulo={
              <h2 className="font-display" style={{ fontSize: 22, fontWeight: 400 }}>
                Pedidos
              </h2>
            }
            acao={
              <span
                className="uppercase"
                style={{ fontSize: 11, letterSpacing: '.14em', color: '#8A8375' }}
              >
                {pedidos.length === 1 ? '1 encontrado' : `${pedidos.length} encontrados`}
              </span>
            }
          >
            <TableScroll minWidth={560}>
              <Cabecalho colunas={COL_PEDIDOS} rotulos={['Pedido', 'Cliente', 'Status', 'Total']} />
              <ul>
                {pedidos.map((pedido, i) => {
                  const status = STATUS_PEDIDO[pedido.status]
                  const cidade = [pedido.cliente_cidade, pedido.cliente_uf].filter(Boolean).join(' · ')
                  return (
                    <li key={pedido.id}>
                      <Link
                        href={`/admin/pedidos/${pedido.codigo}`}
                        className="oz-table-row grid items-center gap-[14px] px-5 py-[15px] hover:text-ink"
                        style={{
                          gridTemplateColumns: COL_PEDIDOS,
                          borderBottom: i === pedidos.length - 1 ? undefined : '1px solid #E4DDD1',
                        }}
                      >
                        <span className="flex flex-col gap-[3px]">
                          <span style={{ fontSize: 13.5 }}>#{pedido.codigo}</span>
                          <span style={{ fontSize: 11, color: '#8A8375' }}>
                            {dataCurta(pedido.criado_em)}
                          </span>
                        </span>
                        <span className="flex min-w-0 flex-col gap-[3px]">
                          <span className="truncate" style={{ fontSize: 13.5 }}>
                            {pedido.cliente_nome}
                          </span>
                          <span className="truncate" style={{ fontSize: 11, color: '#8A8375' }}>
                            {cidade || 'Cidade não informada'}
                          </span>
                        </span>
                        <span
                          className="uppercase"
                          style={{ fontSize: 10.5, letterSpacing: '.12em', color: status.cor }}
                        >
                          {status.rotulo}
                        </span>
                        <span className="text-right" style={{ fontSize: 14 }}>
                          {brl(pedido.total)}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </TableScroll>
          </Card>
        )}

        {produtos.length > 0 && (
          <Card
            semPadding
            titulo={
              <h2 className="font-display" style={{ fontSize: 22, fontWeight: 400 }}>
                Produtos
              </h2>
            }
            acao={
              <span
                className="uppercase"
                style={{ fontSize: 11, letterSpacing: '.14em', color: '#8A8375' }}
              >
                {produtos.length === 1 ? '1 encontrado' : `${produtos.length} encontrados`}
              </span>
            }
          >
            <TableScroll minWidth={560}>
              <Cabecalho colunas={COL_PRODUTOS} rotulos={['', 'Produto', 'Preço', 'Status']} />
              <ul>
                {produtos.map((produto, i) => {
                  const status = STATUS_PRODUTO[produto.status]
                  return (
                    <li key={produto.id}>
                      <Link
                        href={`/admin/produtos/${produto.id}/editar`}
                        className="oz-table-row grid items-center gap-[14px] px-5 py-3 hover:text-ink"
                        style={{
                          gridTemplateColumns: COL_PRODUTOS,
                          borderBottom: i === produtos.length - 1 ? undefined : '1px solid #E4DDD1',
                        }}
                      >
                        <Placeholder
                          className="w-[42px]"
                          densidade="mini"
                          ratio="3/4"
                          src={primeiraFoto(produto.fotos)}
                          alt=""
                          sizes="42px"
                        />
                        <span className="flex min-w-0 flex-col gap-[3px]">
                          <span className="truncate" style={{ fontSize: 13.5 }}>
                            {produto.nome}
                          </span>
                          <span className="truncate" style={{ fontSize: 11, color: '#8A8375' }}>
                            {produto.ref}
                          </span>
                        </span>
                        <span style={{ fontSize: 13.5 }}>{brl(produto.preco)}</span>
                        <span
                          className="uppercase"
                          style={{ fontSize: 10.5, letterSpacing: '.12em', color: status.cor }}
                        >
                          {status.rotulo}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </TableScroll>
          </Card>
        )}

        {clientes.length > 0 && (
          <Card
            semPadding
            titulo={
              <h2 className="font-display" style={{ fontSize: 22, fontWeight: 400 }}>
                Clientes
              </h2>
            }
            acao={
              <span
                className="uppercase"
                style={{ fontSize: 11, letterSpacing: '.14em', color: '#8A8375' }}
              >
                {clientes.length === 1 ? '1 encontrado' : `${clientes.length} encontrados`}
              </span>
            }
          >
            <TableScroll minWidth={560}>
              <Cabecalho colunas={COL_CLIENTES} rotulos={['Cliente', 'E-mail', 'Cidade']} />
              <ul>
                {clientes.map((cliente, i) => (
                  <li key={cliente.id}>
                    <Link
                      href={`/admin/clientes/${cliente.id}`}
                      className="oz-table-row grid items-center gap-[14px] px-5 py-[15px] hover:text-ink"
                      style={{
                        gridTemplateColumns: COL_CLIENTES,
                        borderBottom: i === clientes.length - 1 ? undefined : '1px solid #E4DDD1',
                      }}
                    >
                      <span className="flex min-w-0 flex-col gap-[3px]">
                        <span className="truncate" style={{ fontSize: 13.5 }}>
                          {cliente.nome}
                        </span>
                        <span className="truncate" style={{ fontSize: 11, color: '#8A8375' }}>
                          {cliente.telefone ?? 'Telefone não informado'}
                        </span>
                      </span>
                      <span className="truncate" style={{ fontSize: 12.5, color: '#5C574D' }}>
                        {cliente.email ?? '—'}
                      </span>
                      <span className="truncate" style={{ fontSize: 12.5, color: '#5C574D' }}>
                        {[cliente.cidade, cliente.uf].filter(Boolean).join(' - ') || 'Não informada'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </TableScroll>
          </Card>
        )}
      </main>
    </>
  )
}
