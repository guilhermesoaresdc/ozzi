import Link from 'next/link'
import { TableScroll } from '@/components/admin/Card'
import { Placeholder } from '@/components/ui/Placeholder'
import { resumoEstoque, type ProdutoAdmin } from '@/lib/admin-queries'
import type { Json, SizeCode } from '@/lib/database.types'
import { brl, num } from '@/lib/format'
import { corEstoque, STATUS_PRODUTO } from '@/lib/status'

const COLUNAS = '56px 2.4fr 1fr 1fr 1.3fr 1fr 96px'
const CABECALHOS = ['', 'Produto', 'Referência', 'Preço', 'Estoque', 'Status', '']
const ORDEM_TAMANHOS: SizeCode[] = ['P', 'M', 'G', 'GG', 'U']

function primeiraFoto(fotos: Json): string | null {
  if (!Array.isArray(fotos)) return null
  const foto = fotos[0]
  return typeof foto === 'string' && foto ? foto : null
}

/** Numerações zeradas na ordem da grade, não na ordem que o banco devolveu. */
function ordenarTamanhos(tamanhos: string[]): string[] {
  const posicao = (t: string) => {
    const i = ORDEM_TAMANHOS.indexOf(t as SizeCode)
    return i === -1 ? ORDEM_TAMANHOS.length : i
  }
  return [...tamanhos].sort((a, b) => posicao(a) - posicao(b))
}

/** O status do cadastro, mais os casos que a grade zerada cria (handoff §6.4 e §7). */
function statusDaPeca(produto: ProdutoAdmin, total: number): { rotulo: string; cor: string } {
  if (produto.status === 'rascunho') return STATUS_PRODUTO.rascunho
  if (total === 0) {
    return produto.aceita_encomenda
      ? { rotulo: 'Sob encomenda', cor: '#8A6A4F' }
      : { rotulo: 'Esgotado', cor: '#A0533F' }
  }
  return STATUS_PRODUTO[produto.status]
}

export function TabelaProdutos({ produtos, vazio }: { produtos: ProdutoAdmin[]; vazio: string }) {
  if (produtos.length === 0) {
    return (
      <div className="text-center" style={{ padding: '48px 22px' }}>
        <p style={{ fontSize: 13.5, color: '#5C574D' }}>{vazio}</p>
        <p className="mt-[6px]" style={{ fontSize: 12, color: '#8A8375' }}>
          Cadastre uma peça em &ldquo;+ Novo produto&rdquo; para ela aparecer aqui.
        </p>
      </div>
    )
  }

  return (
    <TableScroll minWidth={900}>
      <div
        className="grid items-center gap-[14px] border-b border-line px-5 py-[14px] uppercase"
        style={{ gridTemplateColumns: COLUNAS, fontSize: 10.5, letterSpacing: '.14em', color: '#8A8375' }}
      >
        {CABECALHOS.map((c, i) => (
          <span key={c || `col-${i}`}>{c}</span>
        ))}
      </div>

      <ul>
        {produtos.map((produto, i) => {
          const resumo = resumoEstoque(produto.variants ?? [])
          const status = statusDaPeca(produto, resumo.total)
          const rascunho = produto.status === 'rascunho'
          const esgotadas = ordenarTamanhos(resumo.esgotadas)
          const cores = `${resumo.cores} ${resumo.cores === 1 ? 'cor' : 'cores'}`

          return (
            <li
              key={produto.id}
              className="oz-table-row grid items-center gap-[14px] px-5 py-3 transition-colors"
              style={{
                gridTemplateColumns: COLUNAS,
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
                  {produto.categories?.nome ?? 'Sem categoria'} · {cores}
                </span>
              </span>

              <span style={{ fontSize: 12.5, color: '#5C574D' }}>{produto.ref}</span>

              <span style={{ fontSize: 13.5 }}>{brl(produto.preco)}</span>

              {rascunho ? (
                <span style={{ fontSize: 12.5, color: '#8A8375' }}>—</span>
              ) : (
                <span style={{ fontSize: 12.5, color: corEstoque(resumo.total) }}>
                  {num(resumo.total)} un
                  {resumo.total > 0 && esgotadas.length > 0 && (
                    <span style={{ color: '#8A6A4F' }}> · {esgotadas.join(', ')} esgotado</span>
                  )}
                </span>
              )}

              <span
                className="uppercase"
                style={{ fontSize: 10.5, letterSpacing: '.12em', color: status.cor }}
              >
                {status.rotulo}
              </span>

              <Link
                href={`/admin/produtos/${produto.id}/editar`}
                aria-label={`Editar ${produto.nome}`}
                className="justify-self-start uppercase"
                style={{ fontSize: 11, letterSpacing: '.14em', borderBottom: '1px solid #C9C0B1' }}
              >
                Editar
              </Link>
            </li>
          )
        })}
      </ul>
    </TableScroll>
  )
}
