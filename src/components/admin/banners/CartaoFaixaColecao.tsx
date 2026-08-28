'use client'

import { useActionState, useId } from 'react'
import { Card } from '@/components/admin/Card'
import { Placeholder } from '@/components/ui/Placeholder'
import { salvarFaixaColecao, type EstadoAcao } from '@/app/admin/banners/actions'
import type { BannerRow } from '@/lib/database.types'
import { BOTAO, CAMPO, Campo, Recado } from './Pecas'

const INICIAL: EstadoAcao = {}

export function CartaoFaixaColecao({ banner }: { banner: BannerRow | null }) {
  const [estado, acao, salvando] = useActionState(salvarFaixaColecao, INICIAL)
  const base = useId()

  return (
    <Card titulo="Faixa da coleção">
      <form action={acao} className="flex flex-wrap gap-x-[26px] gap-y-[22px]">
        <input type="hidden" name="id" value={banner?.id ?? ''} />

        <div style={{ flex: '1 1 320px', minWidth: 240 }}>
          <Placeholder
            ratio="16/9"
            src={banner?.imagem}
            label="look da coleção · 900×760"
            alt={banner?.titulo ?? 'Faixa da coleção'}
            escuro
            sizes="(max-width: 900px) 100vw, 420px"
          />
        </div>

        <div className="flex flex-col gap-[14px]" style={{ flex: '1 1 320px', minWidth: 260 }}>
          <Campo
            id={`${base}-titulo`}
            rotulo="Título"
            ajuda="Alimenta o bloco “Prove em casa antes de pagar” da home."
          >
            <input
              id={`${base}-titulo`}
              name="titulo"
              defaultValue={banner?.titulo ?? ''}
              placeholder="Prove em casa antes de pagar"
              maxLength={90}
              required
              className="oz-input"
              style={CAMPO}
            />
          </Campo>

          <Campo id={`${base}-texto`} rotulo="Texto">
            <textarea
              id={`${base}-texto`}
              name="texto"
              defaultValue={banner?.texto ?? ''}
              rows={4}
              maxLength={400}
              className="oz-input"
              style={{ ...CAMPO, lineHeight: 1.6, resize: 'vertical' }}
            />
          </Campo>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <button
              type="submit"
              disabled={salvando}
              className="oz-btn oz-btn-primary"
              style={{ ...BOTAO, padding: '13px 22px' }}
            >
              {salvando ? 'Salvando…' : 'Salvar faixa'}
            </button>
            <Recado estado={estado} />
          </div>
        </div>
      </form>
    </Card>
  )
}
