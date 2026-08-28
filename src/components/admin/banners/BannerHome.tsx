'use client'

import { useActionState, useId, useState } from 'react'
import { Card } from '@/components/admin/Card'
import { Placeholder } from '@/components/ui/Placeholder'
import { publicarBannerHome, type EstadoAcao } from '@/app/admin/banners/actions'
import type { BannerRow } from '@/lib/database.types'
import { AJUDA, AJUDA_IMAGEM, BOTAO, CAMPO, Campo, Recado } from './Pecas'
import { dataLocal, diaMes } from './periodo'

const INICIAL: EstadoAcao = {}

const DUPLA = 'grid gap-[14px]'
const DUPLA_COLUNAS = { gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))' } as const

/** Selo do canto do preview: o que está no ar agora, não o que está no formulário. */
function selo(banner: BannerRow | null): { texto: string; cor: string } {
  if (!banner || !banner.ativo) return { texto: 'Fora do ar', cor: '#8A8375' }

  const agora = new Date()
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
  const de = dataLocal(banner.inicio)
  const ate = dataLocal(banner.fim)

  if (ate && ate < hoje) return { texto: `Encerrado em ${diaMes(banner.fim)}`, cor: '#8A8375' }
  if (de && de > hoje) return { texto: `Agendado para ${diaMes(banner.inicio)}`, cor: '#8A6A4F' }
  if (de) return { texto: `No ar desde ${diaMes(banner.inicio)}`, cor: '#5C7A5E' }
  return { texto: 'No ar', cor: '#5C7A5E' }
}

export function BannerHome({ banner }: { banner: BannerRow | null }) {
  const [estado, acao, salvando] = useActionState(publicarBannerHome, INICIAL)
  const base = useId()

  const doBanco = banner?.imagem ?? ''
  const [origem, setOrigem] = useState(doBanco)
  const [imagem, setImagem] = useState(doBanco)
  const [trocando, setTrocando] = useState(false)

  if (doBanco !== origem) {
    setOrigem(doBanco)
    setImagem(doBanco)
    setTrocando(false)
  }

  const marca = selo(banner)

  return (
    <Card titulo="Banner principal da home">
      <form action={acao} className="flex flex-wrap gap-x-[26px] gap-y-[22px]">
        <input type="hidden" name="id" value={banner?.id ?? ''} />

        <div className="flex flex-col gap-[10px]" style={{ flex: '0 1 240px', minWidth: 200 }}>
          <Placeholder
            ratio="4/5"
            src={imagem || null}
            label="editorial · look principal · 1040×1300"
            alt={banner?.titulo?.replace(/\|/g, ' ') ?? 'Banner principal da home'}
            densidade="denso"
            sizes="240px"
          />

          <div className="flex flex-wrap items-center gap-[8px]">
            <button
              type="button"
              onClick={() => setTrocando(true)}
              className="oz-btn oz-btn-tertiary"
              style={{ ...BOTAO, padding: '10px 16px' }}
            >
              Substituir
            </button>
            <button
              type="button"
              onClick={() => {
                setImagem('')
                setTrocando(false)
              }}
              disabled={!imagem}
              className="oz-btn"
              style={{ ...BOTAO, padding: '10px 16px', color: '#A0533F' }}
            >
              Remover
            </button>
          </div>

          {trocando ? (
            <Campo id={`${base}-imagem`} rotulo="Endereço da imagem" ajuda={AJUDA_IMAGEM}>
              <input
                id={`${base}-imagem`}
                name="imagem"
                value={imagem}
                onChange={(e) => setImagem(e.target.value)}
                placeholder="https://…/storage/v1/object/public/…"
                className="oz-input"
                style={CAMPO}
              />
            </Campo>
          ) : (
            <input type="hidden" name="imagem" value={imagem} />
          )}

          <p style={AJUDA}>recomendado 1040×1300, até 800kb</p>

          <span
            className="inline-flex items-center gap-[7px] uppercase"
            style={{ fontSize: 10.5, letterSpacing: '.14em', color: marca.cor }}
          >
            <span aria-hidden style={{ width: 5, height: 5, background: marca.cor }} />
            {marca.texto}
          </span>
        </div>

        <div className="flex flex-col gap-[14px]" style={{ flex: '1 1 380px', minWidth: 260 }}>
          <Campo id={`${base}-chapeu`} rotulo="Chapéu">
            <input
              id={`${base}-chapeu`}
              name="chapeu"
              defaultValue={banner?.chapeu ?? ''}
              placeholder="Coleção Alta Estação 2026"
              maxLength={80}
              className="oz-input"
              style={CAMPO}
            />
          </Campo>

          <Campo
            id={`${base}-titulo`}
            rotulo="Título"
            ajuda="Separe as três linhas do hero com “|”. A segunda linha entra em marrom na home."
          >
            <input
              id={`${base}-titulo`}
              name="titulo"
              defaultValue={banner?.titulo ?? ''}
              placeholder="Linho, luz|e o sertão|em movimento"
              maxLength={160}
              required
              className="oz-input"
              style={CAMPO}
            />
          </Campo>

          <Campo id={`${base}-texto`} rotulo="Texto de apoio">
            <textarea
              id={`${base}-texto`}
              name="texto"
              defaultValue={banner?.texto ?? ''}
              rows={3}
              maxLength={400}
              className="oz-input"
              style={{ ...CAMPO, lineHeight: 1.6, resize: 'vertical' }}
            />
          </Campo>

          <div className={DUPLA} style={DUPLA_COLUNAS}>
            <Campo id={`${base}-botao`} rotulo="Botão">
              <input
                id={`${base}-botao`}
                name="texto_botao"
                defaultValue={banner?.texto_botao ?? ''}
                placeholder="Comprar pronta entrega"
                maxLength={40}
                className="oz-input"
                style={CAMPO}
              />
            </Campo>

            <Campo id={`${base}-link`} rotulo="Link do botão">
              <input
                id={`${base}-link`}
                name="link_botao"
                defaultValue={banner?.link_botao ?? ''}
                placeholder="/vestidos"
                maxLength={200}
                className="oz-input"
                style={CAMPO}
              />
            </Campo>
          </div>

          <div className={DUPLA} style={DUPLA_COLUNAS}>
            <Campo id={`${base}-inicio`} rotulo="Início">
              <input
                id={`${base}-inicio`}
                name="inicio"
                type="date"
                defaultValue={banner?.inicio ?? ''}
                className="oz-input"
                style={CAMPO}
              />
            </Campo>

            <Campo id={`${base}-fim`} rotulo="Fim">
              <input
                id={`${base}-fim`}
                name="fim"
                type="date"
                defaultValue={banner?.fim ?? ''}
                className="oz-input"
                style={CAMPO}
              />
            </Campo>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <button
              type="submit"
              disabled={salvando}
              className="oz-btn oz-btn-primary"
              style={{ ...BOTAO, padding: '13px 22px' }}
            >
              {salvando ? 'Publicando…' : 'Publicar banner'}
            </button>
            <Recado estado={estado} />
          </div>
        </div>
      </form>
    </Card>
  )
}
