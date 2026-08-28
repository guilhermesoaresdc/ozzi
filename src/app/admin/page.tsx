import { PageHeader } from '@/components/admin/PageHeader'
import { KpisVisao } from '@/components/admin/visao/KpisVisao'
import { GraficoVendas } from '@/components/admin/visao/GraficoVendas'
import { PrecisaDeVoce } from '@/components/admin/visao/PrecisaDeVoce'
import { PedidosRecentes } from '@/components/admin/visao/PedidosRecentes'
import { EstoqueAlerta } from '@/components/admin/visao/EstoqueAlerta'
import { visaoGeral } from '@/lib/admin-queries'
import { getUsuario } from '@/lib/queries'
import { dataPorExtenso, primeiroNome, saudacao } from '@/lib/format'

export const metadata = { title: 'Visão geral · Painel da loja' }

export default async function VisaoGeralPage() {
  const agora = new Date()
  const [sessao, dados] = await Promise.all([getUsuario(), visaoGeral(agora)])
  const nome = primeiroNome(sessao?.profile?.nome) || 'Administrador'

  return (
    <>
      <PageHeader
        titulo={`${saudacao(agora)}, ${nome}`}
        subtitulo={`${dataPorExtenso(agora)} · resumo de hoje`}
      />

      <main className="flex flex-col" style={{ padding: '26px 30px 60px', gap: 26 }}>
        <KpisVisao dados={dados} />

        <div className="grid items-start gap-[22px] lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            <GraficoVendas serie={dados.serie} ticketMedio={dados.ticketMedio} />
          </div>
          <div className="min-w-0">
            <PrecisaDeVoce itens={dados.precisaDeVoce} />
          </div>
        </div>

        <div className="grid items-start gap-[22px] lg:grid-cols-2">
          <div className="min-w-0">
            <PedidosRecentes pedidos={dados.recentes} />
          </div>
          <div className="min-w-0">
            <EstoqueAlerta itens={dados.alertaEstoque} />
          </div>
        </div>
      </main>
    </>
  )
}
