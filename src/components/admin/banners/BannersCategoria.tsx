'use client'

import { useActionState, useId, useState } from 'react'
import { Card } from '@/components/admin/Card'
import { UploadMidia } from '@/components/admin/UploadMidia'
import { Placeholder } from '@/components/ui/Placeholder'
import { CheckSquare } from '@/components/ui/Checkbox'
import { criarCategoria, salvarImagemCategoria, type EstadoAcao } from '@/app/admin/banners/actions'
import type { CategoryRow } from '@/lib/database.types'
import { AJUDA, BOTAO, BotaoTracejado, CAMPO, Campo, Recado } from './Pecas'

const INICIAL: EstadoAcao = {}

const GRADE = { gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))' } as const
const CAIXA = { border: '1px solid #E4DDD1', padding: 16 } as const

/** Sem acento, minúsculo, só letras, números e hífen — enquanto a pessoa digita. */
function limparSlug(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
}

/** "Moda praia" vira "moda-praia" — o endereço da categoria na loja. */
function paraSlug(nome: string): string {
  return limparSlug(nome).replace(/^-+|-+$/g, '')
}

export function BannersCategoria({ categorias }: { categorias: CategoryRow[] }) {
  const [estadoImagem, acaoImagem, salvandoImagem] = useActionState(salvarImagemCategoria, INICIAL)
  const [estadoNova, acaoNova, criandoAgora] = useActionState(criarCategoria, INICIAL)
  const base = useId()

  const doBanco = categorias.map((c) => `${c.id}:${c.imagem_banner ?? ''}`).join('|')
  const [origem, setOrigem] = useState(doBanco)
  const [aberta, setAberta] = useState<string | null>(null)
  const [criando, setCriando] = useState(false)
  const [nome, setNome] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTocado, setSlugTocado] = useState(false)
  const [noMenu, setNoMenu] = useState(false)

  // Deu certo lá no banco: os dois formulários fecham e o cartão volta ao estado de leitura.
  if (doBanco !== origem) {
    setOrigem(doBanco)
    setAberta(null)
    setCriando(false)
    setNome('')
    setSlug('')
    setSlugTocado(false)
    setNoMenu(false)
  }

  const emEdicao = categorias.find((c) => c.id === aberta) ?? null

  return (
    <Card titulo="Banners de categoria">
      <ul className="grid gap-[14px]" style={GRADE}>
        {categorias.map((categoria) => {
          const temFoto = !!categoria.imagem_banner
          return (
            <li key={categoria.id} className="flex flex-col" style={{ border: '1px solid #DFD8CB' }}>
              <Placeholder
                ratio="3/4"
                src={categoria.imagem_banner}
                label={`${categoria.nome.toLowerCase()} · 640×850`}
                alt={temFoto ? `Banner de ${categoria.nome}` : ''}
                densidade="denso"
                sizes="170px"
              />
              <div className="flex flex-col gap-[5px]" style={{ padding: '11px 12px 12px' }}>
                <span style={{ fontSize: 13 }}>{categoria.nome}</span>
                <span
                  className="uppercase"
                  style={{
                    fontSize: 10,
                    letterSpacing: '.14em',
                    color: temFoto ? '#5C7A5E' : '#A0533F',
                  }}
                >
                  {temFoto ? 'No ar' : 'Falta foto'}
                </span>
                <button
                  type="button"
                  onClick={() => setAberta(aberta === categoria.id ? null : categoria.id)}
                  aria-expanded={aberta === categoria.id}
                  className="self-start uppercase"
                  style={{
                    fontSize: 10.5,
                    letterSpacing: '.14em',
                    background: 'none',
                    border: 0,
                    borderBottom: '1px solid #C9C0B1',
                    padding: '0 0 2px',
                    marginTop: 3,
                    cursor: 'pointer',
                  }}
                >
                  Trocar imagem
                </button>
              </div>
            </li>
          )
        })}

        <li className="flex">
          <BotaoTracejado
            onClick={() => setCriando((v) => !v)}
            aberto={criando}
            className="w-full"
            style={{ aspectRatio: '3/4', padding: 12 }}
          >
            + Nova categoria
          </BotaoTracejado>
        </li>
      </ul>

      {emEdicao && (
        <form
          key={emEdicao.id}
          action={acaoImagem}
          className="mt-[16px] flex flex-col gap-[12px]"
          style={CAIXA}
        >
          <input type="hidden" name="categoria" value={emEdicao.id} />
          <ImagemDaCategoria nome={emEdicao.nome} inicial={emEdicao.imagem_banner ?? ''} />

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <button
              type="submit"
              disabled={salvandoImagem}
              className="oz-btn oz-btn-primary"
              style={{ ...BOTAO, padding: '12px 20px' }}
            >
              {salvandoImagem ? 'Salvando…' : 'Salvar imagem'}
            </button>
            <button
              type="button"
              onClick={() => setAberta(null)}
              className="oz-btn oz-btn-tertiary"
              style={{ ...BOTAO, padding: '11px 18px' }}
            >
              Cancelar
            </button>
            <Recado estado={estadoImagem} />
          </div>
        </form>
      )}

      {criando && (
        <form action={acaoNova} className="mt-[16px] flex flex-col gap-[12px]" style={CAIXA}>
          <div
            className="grid gap-[14px]"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))' }}
          >
            <Campo id={`${base}-nome`} rotulo="Nome da categoria">
              <input
                id={`${base}-nome`}
                name="nome"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value)
                  if (!slugTocado) setSlug(paraSlug(e.target.value))
                }}
                placeholder="Ex.: Moda praia"
                maxLength={40}
                required
                className="oz-input"
                style={CAMPO}
              />
            </Campo>

            <Campo
              id={`${base}-slug`}
              rotulo="Endereço na loja"
              ajuda={`A categoria vai atender em ozzi.com.br/${slug || 'endereco'}`}
            >
              <input
                id={`${base}-slug`}
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlugTocado(true)
                  setSlug(limparSlug(e.target.value))
                }}
                placeholder="moda-praia"
                maxLength={40}
                required
                className="oz-input"
                style={CAMPO}
              />
            </Campo>
          </div>

          <label
            className="inline-flex w-fit items-center gap-[9px] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink"
            style={{ fontSize: 12.5, color: '#5C574D', cursor: 'pointer' }}
          >
            <input
              type="checkbox"
              name="no_menu"
              checked={noMenu}
              onChange={(e) => setNoMenu(e.target.checked)}
              className="sr-only"
            />
            <CheckSquare checked={noMenu} size={13} />
            Mostrar no menu principal da loja
          </label>

          <p style={AJUDA}>A foto do banner entra depois, em “Trocar imagem”.</p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <button
              type="submit"
              disabled={criandoAgora}
              className="oz-btn oz-btn-primary"
              style={{ ...BOTAO, padding: '12px 20px' }}
            >
              {criandoAgora ? 'Criando…' : 'Criar categoria'}
            </button>
            <button
              type="button"
              onClick={() => setCriando(false)}
              className="oz-btn oz-btn-tertiary"
              style={{ ...BOTAO, padding: '11px 18px' }}
            >
              Cancelar
            </button>
            <Recado estado={estadoNova} />
          </div>
        </form>
      )}
    </Card>
  )
}

/**
 * Campo de imagem de uma categoria. O formulário que o envolve tem key pelo id
 * da categoria, então trocar de categoria remonta este componente com o valor
 * certo — por isso o estado local pode nascer da prop sem sincronização extra.
 */
function ImagemDaCategoria({ nome, inicial }: { nome: string; inicial: string }) {
  const [imagem, setImagem] = useState(inicial)

  return (
    <div className="flex flex-col gap-[10px]">
      <span className="oz-label">Imagem de {nome}</span>
      <UploadMidia
        valor={imagem ? [imagem] : []}
        onChange={(lista) => setImagem(lista[0] ?? '')}
        pasta="banners/categorias"
        tipo="imagem"
        max={1}
        singular="imagem"
        plural="imagens"
      />
      <input type="hidden" name="imagem" value={imagem} />
    </div>
  )
}
