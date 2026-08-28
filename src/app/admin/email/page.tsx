import type { Metadata } from 'next'
import { PageHeader } from '@/components/admin/PageHeader'
import { KpisEmail } from '@/components/admin/email/KpisEmail'
import { ListaAutomacoes } from '@/components/admin/email/ListaAutomacoes'
import { Listas } from '@/components/admin/email/Listas'
import { ModeloEmail } from '@/components/admin/email/ModeloEmail'
import { TabelaCampanhas } from '@/components/admin/email/TabelaCampanhas'
import {
  kpisEmail,
  listarAutomacoes,
  listarCampanhas,
  listarClientes,
  listarListas,
} from '@/lib/admin-queries'
import { num } from '@/lib/format'
import { getSettings } from '@/lib/queries'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'E-mail marketing' }

type Busca = Promise<{ [chave: string]: string | string[] | undefined }>

/** O Cariri é UTC−3 o ano inteiro; os campos de agendamento falam nesse fuso. */
const FUSO_LOJA_MS = 3 * 60 * 60 * 1000

/** Instante gravado (UTC) → data e hora da loja, sem depender do fuso do servidor. */
function noFusoDaLoja(iso: string | null): { data: string; hora: string } {
  if (!iso) return { data: '', hora: '' }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { data: '', hora: '' }
  const local = new Date(d.getTime() - FUSO_LOJA_MS)
  return { data: local.toISOString().slice(0, 10), hora: local.toISOString().slice(11, 16) }
}

const CARTOES_LADO_A_LADO = {
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
} as const

/** O cabeçalho fica grudado no topo: a âncora precisa parar antes dele. */
const ANCORA = { scrollMarginTop: 96 } as const

export default async function EmailPage({ searchParams }: { searchParams: Busca }) {
  const { campanha } = await searchParams
  const campanhaId = Array.isArray(campanha) ? campanha[0] : campanha

  const supabase = await createClient()
  const [kpis, campanhas, automacoes, listas, clientes, settings, alertas] = await Promise.all([
    kpisEmail(),
    listarCampanhas(),
    listarAutomacoes(),
    listarListas(),
    listarClientes(),
    getSettings(),
    // A lista "Avise-me" é a fila de quem ainda espera o aviso de volta ao estoque.
    supabase.from('stock_alerts').select('id', { count: 'exact', head: true }).is('notificado_em', null),
  ])

  const ligadas = automacoes.filter((a) => a.ativo).length
  const subtitulo = `${num(kpis.contatos)} ${kpis.contatos === 1 ? 'contato' : 'contatos'} · ${ligadas} ${
    ligadas === 1 ? 'automação ligada' : 'automações ligadas'
  }`

  // Só rascunho e agendada voltam para o modelo: campanha enviada não se reescreve.
  const emEdicao =
    campanhas.find(
      (c) => c.id === campanhaId && (c.status === 'rascunho' || c.status === 'agendada'),
    ) ?? null
  const agendamento = noFusoDaLoja(emEdicao?.agendado_para ?? null)

  return (
    <>
      <PageHeader titulo="E-mail marketing" subtitulo={subtitulo} />

      <main className="flex flex-col gap-[22px]" style={{ padding: '26px 30px 60px' }}>
        <KpisEmail
          contatos={kpis.contatos}
          cadastros={clientes.length}
          abertura={kpis.abertura}
          cliques={kpis.cliques}
          receita={kpis.receita}
          campanhas={campanhas}
        />

        <div id="campanhas" style={ANCORA}>
          <TabelaCampanhas campanhas={campanhas} />
        </div>

        <div className="grid items-start gap-[22px]" style={CARTOES_LADO_A_LADO}>
          <div id="automacoes" style={ANCORA}>
            <ListaAutomacoes automacoes={automacoes} />
          </div>
          <Listas listas={listas} clientes={clientes} alertasDeEstoque={alertas.count ?? 0} />
        </div>

        <div id="modelo-do-email" style={ANCORA}>
          <ModeloEmail
            key={emEdicao?.id ?? 'nova'}
            listas={listas}
            campanha={emEdicao}
            remetente={`${settings.nome_loja} · ${settings.email}`}
            localizacao={settings.localizacao}
            dataInicial={agendamento.data}
            horaInicial={agendamento.hora}
          />
        </div>
      </main>
    </>
  )
}
