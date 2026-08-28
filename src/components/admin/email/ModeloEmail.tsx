'use client'

import Link from 'next/link'
import { useActionState, useId, useState } from 'react'
import { Card } from '@/components/admin/Card'
import { Logo } from '@/components/ui/Logo'
import { Placeholder } from '@/components/ui/Placeholder'
import { salvarCampanha, type EstadoAcao } from '@/app/admin/email/actions'
import type { CampanhaComLista } from '@/lib/admin-queries'
import type { EmailListRow } from '@/lib/database.types'
import { AvisoProvedor, BOTAO, BOTAO_SECUNDARIO, CAMPO, Campo, Recado, TituloCartao } from './Pecas'

const INICIAL: EstadoAcao = {}

const TESTE_PENDENTE =
  'O envio de teste depende de um provedor de e-mail, que ainda não está conectado.'

const CAMPOS = 'grid min-w-0 gap-4'
/** Prévia e formulário lado a lado; o formulário ocupa duas colunas (handoff §6.7). */
const CORPO_COLUNAS = { gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))' } as const
const CAMPOS_COLUNAS = { gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' } as const

/** Texto digitado, ou o exemplo em cinza que mostra onde ele vai cair. */
function ou(valor: string, exemplo: string) {
  const limpo = valor.trim()
  return { texto: limpo || exemplo, vazio: limpo.length === 0 }
}

export function ModeloEmail({
  listas,
  campanha,
  remetente,
  localizacao,
  dataInicial,
  horaInicial,
}: {
  listas: EmailListRow[]
  campanha: CampanhaComLista | null
  remetente: string
  localizacao: string
  /** Data e hora do agendamento, já no fuso da loja (calculados no servidor). */
  dataInicial: string
  horaInicial: string
}) {
  const [estado, acao, salvando] = useActionState(salvarCampanha, INICIAL)
  const base = useId()

  const [assunto, setAssunto] = useState(campanha?.assunto ?? '')
  const [preHeader, setPreHeader] = useState(campanha?.pre_header ?? '')
  const [lista, setLista] = useState(campanha?.lista_id ?? listas[0]?.id ?? '')
  const [titulo, setTitulo] = useState('')
  const [botao, setBotao] = useState('')
  const [corpo, setCorpo] = useState('')
  const [data, setData] = useState(dataInicial)
  const [hora, setHora] = useState(horaInicial)

  const previaTitulo = ou(titulo, 'Título do e-mail')
  const previaCorpo = ou(corpo, 'O texto do e-mail entra aqui, em duas ou três linhas.')
  const previaBotao = ou(botao, 'Ver a coleção')
  const previaAssunto = ou(assunto, 'Assunto do e-mail')
  const previaPreHeader = ou(preHeader, 'Pré-cabeçalho, a segunda linha da caixa de entrada')

  const avisoId = `${base}-aviso`

  return (
    <Card
      titulo={
        <TituloCartao
          titulo="Modelo do e-mail"
          apoio="Largura de 600px · imagens em 1200×1500 para telas retina"
        />
      }
      acao={
        <button
          type="button"
          disabled
          title={TESTE_PENDENTE}
          aria-describedby={avisoId}
          className="uppercase"
          style={{
            fontSize: 11,
            letterSpacing: '.14em',
            borderBottom: '1px solid #C9C0B1',
            color: '#9A9385',
            cursor: 'not-allowed',
          }}
        >
          Enviar teste para mim
        </button>
      }
      semPadding
    >
      <form action={acao} className="grid items-start gap-[22px] p-[22px]" style={CORPO_COLUNAS}>
        <input type="hidden" name="id" value={campanha?.id ?? ''} />

        {/* Prévia: o e-mail como a cliente vê, refletindo o que está sendo digitado. */}
        <div className="flex min-w-0 flex-col gap-3" style={{ maxWidth: 600 }}>
          <div className="flex flex-col gap-[3px]">
            <span className="oz-label">Na caixa de entrada</span>
            <span
              className="truncate"
              style={{ fontSize: 13.5, color: previaAssunto.vazio ? '#9A9385' : undefined }}
            >
              {previaAssunto.texto}
            </span>
            <span className="truncate" style={{ fontSize: 11, color: '#8A8375' }}>
              {previaPreHeader.texto}
            </span>
          </div>

          <div
            className="flex flex-col items-center gap-[18px] border border-line text-center"
            style={{ background: '#F2EEE7', padding: '26px 22px' }}
          >
            <Logo size={34} wordmark={16} tagline={false} />

            <Placeholder
              ratio="4/5"
              densidade="denso"
              label="foto da campanha · 1200×1500"
              className="w-full"
              sizes="(max-width: 900px) 90vw, 300px"
            />

            <span
              className="font-display"
              style={{
                fontSize: 26,
                fontWeight: 300,
                lineHeight: 1.15,
                color: previaTitulo.vazio ? '#9A9385' : undefined,
              }}
            >
              {previaTitulo.texto}
            </span>

            <span
              style={{
                fontSize: 13,
                lineHeight: 1.65,
                color: previaCorpo.vazio ? '#9A9385' : '#5C574D',
                whiteSpace: 'pre-line',
              }}
            >
              {previaCorpo.texto}
            </span>

            <span
              className="uppercase"
              style={{
                background: '#232320',
                color: '#F2EEE7',
                padding: '13px 26px',
                fontSize: 10.5,
                letterSpacing: '.16em',
              }}
            >
              {previaBotao.texto}
            </span>

            <span
              className="w-full border-t"
              style={{ borderColor: '#E4DDD1', paddingTop: 6, fontSize: 10, letterSpacing: '.06em', color: '#8A8375' }}
            >
              {localizacao} · descadastrar
            </span>
          </div>
        </div>

        {/* Campos */}
        <div className={CAMPOS} style={{ ...CAMPOS_COLUNAS, gridColumn: 'span 2' }}>
          {campanha && (
            <p style={{ gridColumn: 'span 2', fontSize: 12, color: '#5C574D' }}>
              Editando “{campanha.assunto}”.{' '}
              <Link href="/admin/email#modelo-do-email" style={{ borderBottom: '1px solid #C9C0B1' }}>
                Começar um e-mail novo
              </Link>
            </p>
          )}

          <Campo id={`${base}-assunto`} rotulo="Assunto" colunas={2}>
            <input
              id={`${base}-assunto`}
              name="assunto"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              placeholder="Alta Estação 2026 chegou"
              maxLength={120}
              required
              className="oz-input"
              style={CAMPO}
            />
          </Campo>

          <Campo id={`${base}-pre`} rotulo="Pré-cabeçalho" colunas={2}>
            <input
              id={`${base}-pre`}
              name="pre_header"
              value={preHeader}
              onChange={(e) => setPreHeader(e.target.value)}
              placeholder="Linho, luz e o sertão em movimento"
              maxLength={160}
              className="oz-input"
              style={CAMPO}
            />
          </Campo>

          <Campo
            id={`${base}-remetente`}
            rotulo="Remetente"
            colunas={2}
            ajuda="Vem de Configurações › Dados da loja."
          >
            <input
              id={`${base}-remetente`}
              value={remetente}
              readOnly
              className="oz-input"
              style={{ ...CAMPO, color: '#5C574D' }}
            />
          </Campo>

          <Campo id={`${base}-lista`} rotulo="Lista" colunas={2}>
            <select
              id={`${base}-lista`}
              name="lista"
              value={lista}
              onChange={(e) => setLista(e.target.value)}
              className="oz-input"
              style={CAMPO}
            >
              <option value="">Escolha a lista</option>
              {listas.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nome}
                </option>
              ))}
            </select>
          </Campo>

          <Campo id={`${base}-titulo`} rotulo="Título" colunas={2}>
            <input
              id={`${base}-titulo`}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Chegou a coleção Alta Estação"
              maxLength={90}
              className="oz-input"
              style={CAMPO}
            />
          </Campo>

          <Campo id={`${base}-botao`} rotulo="Botão" colunas={2}>
            <input
              id={`${base}-botao`}
              value={botao}
              onChange={(e) => setBotao(e.target.value)}
              placeholder="Ver a coleção"
              maxLength={40}
              className="oz-input"
              style={CAMPO}
            />
          </Campo>

          <Campo id={`${base}-data`} rotulo="Data">
            <input
              id={`${base}-data`}
              name="data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="oz-input"
              style={CAMPO}
            />
          </Campo>

          <Campo id={`${base}-hora`} rotulo="Hora">
            <input
              id={`${base}-hora`}
              name="hora"
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="oz-input"
              style={CAMPO}
            />
          </Campo>

          <Campo id={`${base}-corpo`} rotulo="Texto do e-mail" colunas={2}>
            <textarea
              id={`${base}-corpo`}
              value={corpo}
              onChange={(e) => setCorpo(e.target.value)}
              rows={4}
              maxLength={600}
              placeholder="Linho, viscose e algodão para o calor do Cariri. Pronta entrega, com retirada no Centro."
              className="oz-input"
              style={{ ...CAMPO, lineHeight: 1.6, resize: 'vertical' }}
            />
          </Campo>

          <div className="flex flex-wrap items-center gap-[10px]" style={{ gridColumn: 'span 2' }}>
            <button
              type="submit"
              name="acao"
              value="agendar"
              disabled={salvando}
              className="oz-btn oz-btn-primary"
              style={BOTAO}
            >
              {salvando ? 'Salvando…' : 'Agendar envio'}
            </button>
            <button
              type="submit"
              name="acao"
              value="rascunho"
              disabled={salvando}
              className="oz-btn oz-btn-tertiary"
              style={BOTAO_SECUNDARIO}
            >
              Salvar rascunho
            </button>
          </div>

          <div className="flex flex-col gap-[10px]" style={{ gridColumn: 'span 2' }}>
            <Recado estado={estado} />
            <span id={avisoId}>
              <AvisoProvedor>
                O painel guarda o cabeçalho do envio — assunto, pré-cabeçalho, lista e agendamento. O
                título, o texto e o botão ficam neste modelo até um provedor de e-mail ser conectado:
                nenhum e-mail sai daqui.
              </AvisoProvedor>
            </span>
          </div>
        </div>
      </form>
    </Card>
  )
}
