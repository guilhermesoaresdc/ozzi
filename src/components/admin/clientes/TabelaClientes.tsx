import Link from 'next/link'
import { TableScroll } from '@/components/admin/Card'
import { cidadeUf } from '@/components/admin/clientes/dados'
import type { ClienteComResumo } from '@/lib/admin-queries'
import { brl, dataCurta, num } from '@/lib/format'

const COLUNAS = '2fr 1.4fr 1fr 1fr 1.2fr'
const CABECALHOS = ['Cliente', 'Cidade', 'Pedidos', 'Gasto total', 'Último pedido']

export function TabelaClientes({ clientes }: { clientes: ClienteComResumo[] }) {
  if (clientes.length === 0) {
    return (
      <div className="oz-card text-center" style={{ padding: '48px 22px' }}>
        <p style={{ fontSize: 13.5, color: '#5C574D' }}>Nenhum cliente cadastrado ainda.</p>
        <p className="mt-[6px]" style={{ fontSize: 12, color: '#8A8375' }}>
          Cada pedido fechado na loja cria o cadastro aqui.
        </p>
      </div>
    )
  }

  return (
    <div className="oz-card">
      <TableScroll minWidth={820}>
        <div
          className="grid gap-[14px] border-b border-line px-5 py-[14px] uppercase"
          style={{ gridTemplateColumns: COLUNAS, fontSize: 10.5, letterSpacing: '.14em', color: '#8A8375' }}
        >
          {CABECALHOS.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>

        <ul>
          {clientes.map((cliente, i) => (
            <li key={cliente.id}>
              <Link
                href={`/admin/clientes/${cliente.id}`}
                className="oz-table-row grid items-center gap-[14px] px-5 py-[15px] hover:text-ink"
                style={{
                  gridTemplateColumns: COLUNAS,
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
                  {cidadeUf(cliente.cidade, cliente.uf) || 'Cidade não informada'}
                </span>

                <span style={{ fontSize: 12.5, color: '#5C574D' }}>{num(cliente.pedidos)}</span>

                <span style={{ fontSize: 13.5 }}>{brl(cliente.gastoTotal)}</span>

                <span style={{ fontSize: 12.5, color: cliente.ultimoPedido ? '#5C574D' : '#8A8375' }}>
                  {cliente.ultimoPedido ? dataCurta(cliente.ultimoPedido) : '—'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </TableScroll>
    </div>
  )
}
