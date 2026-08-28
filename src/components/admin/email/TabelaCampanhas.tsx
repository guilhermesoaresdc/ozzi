import Link from 'next/link'
import { Card, TableScroll } from '@/components/admin/Card'
import type { CampanhaComLista } from '@/lib/admin-queries'
import { brl, dataCurta, hora, pct } from '@/lib/format'
import { STATUS_CAMPANHA } from '@/lib/status'
import { TituloCartao } from './Pecas'

const COLUNAS = '2.2fr 1.4fr 1fr .9fr .9fr 1fr 88px'
const CABECALHOS = ['Assunto', 'Lista', 'Envio', 'Abertura', 'Cliques', 'Receita', '']

const ACAO = {
  fontSize: 11,
  letterSpacing: '.12em',
  borderBottom: '1px solid #C9C0B1',
  lineHeight: 1.6,
} as const

const RELATORIO_PENDENTE =
  'O relatório detalhado vem do provedor de e-mail, que ainda não está conectado. Os números desta linha são os que a loja registrou.'

/** O rótulo do envio: o texto gravado, o horário agendado, ou nada ainda. */
function envio(campanha: CampanhaComLista): string {
  if (campanha.envio_rotulo) return campanha.envio_rotulo
  if (campanha.agendado_para) return `${dataCurta(campanha.agendado_para)} · ${hora(campanha.agendado_para)}`
  return '—'
}

/** A ação muda com o estado da campanha (handoff §6.7). */
function acaoDaCampanha(campanha: CampanhaComLista) {
  if (campanha.status === 'enviada') return { rotulo: 'Relatório', destino: null }
  if (campanha.status === 'ativa') return { rotulo: 'Ver fluxo', destino: '#automacoes' }
  return { rotulo: 'Editar', destino: `/admin/email?campanha=${campanha.id}#modelo-do-email` }
}

export function TabelaCampanhas({ campanhas }: { campanhas: CampanhaComLista[] }) {
  return (
    <Card
      titulo={<TituloCartao titulo="Campanhas" apoio="Envios pontuais para listas escolhidas por você" />}
      acao={
        <Link href="#modelo-do-email" className="oz-btn oz-btn-primary" style={{ padding: '12px 22px' }}>
          + Nova campanha
        </Link>
      }
      semPadding
    >
      {campanhas.length === 0 ? (
        <p className="px-[22px] py-[26px]" style={{ fontSize: 13, color: '#8A8375' }}>
          Nenhuma campanha ainda. Escreva a primeira no modelo de e-mail, aqui embaixo.
        </p>
      ) : (
        <TableScroll minWidth={940}>
          <div
            className="grid gap-[14px] border-b border-line px-[22px] py-[14px] uppercase"
            style={{ gridTemplateColumns: COLUNAS, fontSize: 10.5, letterSpacing: '.14em', color: '#8A8375' }}
          >
            {CABECALHOS.map((c, i) => (
              <span key={c || `vazio-${i}`}>{c}</span>
            ))}
          </div>

          <ul>
            {campanhas.map((campanha, i) => {
              const status = STATUS_CAMPANHA[campanha.status]
              const acao = acaoDaCampanha(campanha)
              const medida = campanha.aberturas !== null

              return (
                <li
                  key={campanha.id}
                  className="oz-table-row grid items-center gap-[14px] px-[22px] py-[14px] transition-colors"
                  style={{
                    gridTemplateColumns: COLUNAS,
                    borderBottom: i === campanhas.length - 1 ? undefined : '1px solid #E4DDD1',
                  }}
                >
                  <span className="flex min-w-0 flex-col gap-[3px]">
                    <span className="truncate" style={{ fontSize: 13.5 }}>
                      {campanha.assunto}
                    </span>
                    <span className="truncate" style={{ fontSize: 11, color: '#8A8375' }}>
                      {campanha.pre_header ?? 'Sem pré-cabeçalho'}
                    </span>
                  </span>

                  <span className="truncate" style={{ fontSize: 12.5, color: '#5C574D' }}>
                    {campanha.email_lists?.nome ?? 'Sem lista'}
                  </span>

                  <span className="flex flex-col gap-[3px]">
                    <span style={{ fontSize: 12.5 }}>{envio(campanha)}</span>
                    <span
                      className="uppercase"
                      style={{ fontSize: 10, letterSpacing: '.12em', color: status.cor }}
                    >
                      {status.rotulo}
                    </span>
                  </span>

                  <span style={{ fontSize: 13 }}>{medida ? pct(campanha.aberturas, 0) : '—'}</span>
                  <span style={{ fontSize: 13 }}>{medida ? pct(campanha.cliques, 0) : '—'}</span>
                  <span style={{ fontSize: 13 }}>
                    {campanha.receita === null ? '—' : brl(campanha.receita)}
                  </span>

                  {acao.destino ? (
                    <Link
                      href={acao.destino}
                      className="justify-self-end uppercase transition-colors"
                      style={ACAO}
                    >
                      {acao.rotulo}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      title={RELATORIO_PENDENTE}
                      className="justify-self-end uppercase"
                      style={{ ...ACAO, color: '#9A9385', cursor: 'not-allowed' }}
                    >
                      {acao.rotulo}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </TableScroll>
      )}

      <p className="border-t border-line px-[22px] py-[14px]" style={{ fontSize: 11.5, color: '#8A8375' }}>
        {RELATORIO_PENDENTE}
      </p>
    </Card>
  )
}
