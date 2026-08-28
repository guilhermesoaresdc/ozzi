import type { Metadata } from 'next'
import { PageHeader } from '@/components/admin/PageHeader'
import { KpisClientes } from '@/components/admin/clientes/KpisClientes'
import { TabelaClientes } from '@/components/admin/clientes/TabelaClientes'
import { kpisClientes } from '@/components/admin/clientes/dados'
import { listarClientes } from '@/lib/admin-queries'
import { num, pct } from '@/lib/format'

export const metadata: Metadata = { title: 'Clientes' }

export default async function ClientesPage() {
  const clientes = await listarClientes()
  const numeros = kpisClientes(clientes)
  const porGasto = [...clientes].sort((a, b) => b.gastoTotal - a.gastoTotal)

  return (
    <>
      <PageHeader
        titulo="Clientes"
        subtitulo={`${num(numeros.total)} cadastros · ${pct(numeros.pctCariri)} do Cariri`}
      />

      <main className="flex flex-col gap-[22px]" style={{ padding: '26px 30px 60px' }}>
        <KpisClientes numeros={numeros} />
        <TabelaClientes clientes={porGasto} />
      </main>
    </>
  )
}
