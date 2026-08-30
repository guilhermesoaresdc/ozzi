'use client'

import Link from 'next/link'
import { useActionState, useId, useState } from 'react'
import { consultar, type EstadoConsultor } from '@/app/(loja)/consultor/actions'
import { ProductCard } from '@/components/loja/ProductCard'

const INICIAL: EstadoConsultor = {}

const PERGUNTAS = [
  {
    nome: 'veias',
    rotulo: 'A cor das veias no seu pulso',
    opcoes: ['Esverdeadas', 'Azuladas ou arroxeadas', 'Não sei dizer'],
  },
  {
    nome: 'joia',
    rotulo: 'A joia que mais te valoriza',
    opcoes: ['Dourada', 'Prateada', 'As duas ficam bem'],
  },
  {
    nome: 'sol',
    rotulo: 'Sua pele no sol',
    opcoes: ['Doura fácil', 'Vermelha antes de dourar', 'Queima e não doura'],
  },
  {
    nome: 'cabelo',
    rotulo: 'Cor natural do seu cabelo',
    opcoes: ['Preto', 'Castanho escuro', 'Castanho claro', 'Loiro', 'Ruivo', 'Grisalho'],
  },
  {
    nome: 'olhos',
    rotulo: 'Cor dos seus olhos',
    opcoes: ['Castanho escuro', 'Castanho claro ou mel', 'Verde', 'Azul', 'Cinza'],
  },
] as const

const ESTACOES: Record<string, string> = {
  primavera: 'Primavera',
  verao: 'Verão',
  outono: 'Outono',
  inverno: 'Inverno',
}

const SUBTONS: Record<string, string> = {
  quente: 'Subtom quente',
  frio: 'Subtom frio',
  neutro: 'Subtom neutro',
}

const CONTRASTES: Record<string, string> = {
  baixo: 'Contraste suave',
  medio: 'Contraste médio',
  alto: 'Contraste alto',
}

export function FormConsultor() {
  const [estado, acao, enviando] = useActionState(consultar, INICIAL)
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null)
  const fotoId = useId()

  return (
    <>
      <form action={acao} className="mt-11 flex flex-col gap-9">
        <fieldset className="flex flex-col gap-[14px]" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="oz-label" style={{ padding: 0 }}>
            Sua foto — opcional, mas ajuda muito
          </legend>
          <label
            htmlFor={fotoId}
            className="flex cursor-pointer flex-col items-center justify-center gap-[6px] text-center"
            style={{ border: '1px dashed #B8AE9C', padding: '30px 20px', color: '#8A8375', fontSize: 13 }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }} aria-hidden>
              +
            </span>
            <span>{nomeArquivo ?? 'Escolher uma foto sua'}</span>
            <span style={{ fontSize: 11 }}>de luz natural, sem filtro · a foto não fica guardada</span>
          </label>
          <input
            id={fotoId}
            type="file"
            name="foto"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => setNomeArquivo(e.target.files?.[0]?.name ?? null)}
          />
        </fieldset>

        {PERGUNTAS.map((p) => (
          <fieldset key={p.nome} className="flex flex-col gap-[10px]" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="oz-label" style={{ padding: 0 }}>
              {p.rotulo}
            </legend>
            <div className="flex flex-wrap gap-[10px]">
              {p.opcoes.map((o) => (
                <label
                  key={o}
                  className="cursor-pointer"
                  style={{ border: '1px solid #C9C0B1', padding: '9px 15px', fontSize: 12.5 }}
                >
                  <input type="radio" name={p.nome} value={o} className="sr-only peer" />
                  <span className="peer-checked:font-medium">{o}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <button
          type="submit"
          disabled={enviando}
          className="oz-btn oz-btn-primary self-start"
          style={{ padding: '16px 32px' }}
        >
          {enviando ? 'Analisando…' : 'Descobrir minhas cores'}
        </button>
      </form>

      {enviando && (
        <p role="status" className="mt-4" style={{ fontSize: 12.5, color: '#8A8375' }}>
          Isso leva alguns segundos.
        </p>
      )}

      {estado.limite && (
        <p role="status" className="mt-6" style={{ fontSize: 13, color: '#8A6A4F', lineHeight: 1.6 }}>
          {estado.limite}{' '}
          <Link href="/entrar" style={{ borderBottom: '1px solid #C4A88B' }}>
            Criar minha conta
          </Link>
        </p>
      )}

      {estado.erro && (
        <p role="alert" className="mt-6" style={{ fontSize: 13, color: '#A0533F', lineHeight: 1.6 }}>
          {estado.erro}
        </p>
      )}

      {estado.analise && (
        <section className="mt-14" style={{ borderTop: '1px solid #DFD8CB', paddingTop: 40 }}>
          <div className="flex flex-wrap gap-x-9 gap-y-3">
            {[
              SUBTONS[estado.analise.subtom],
              ESTACOES[estado.analise.estacao],
              CONTRASTES[estado.analise.contraste],
            ]
              .filter(Boolean)
              .map((rotulo) => (
                <span key={rotulo} className="oz-eyebrow">
                  {rotulo}
                </span>
              ))}
          </div>

          <p className="mt-5 max-w-[560px]" style={{ fontSize: 15.5, lineHeight: 1.72, color: '#5C574D' }}>
            {estado.analise.resumo}
          </p>

          <h2 className="font-display mt-12" style={{ fontSize: 30, fontWeight: 300 }}>
            As cores que te iluminam
          </h2>
          <ul className="mt-5 flex flex-wrap gap-[14px]">
            {estado.analise.paleta.map((c) => (
              <li key={c.hex + c.nome} className="flex flex-col gap-[7px]">
                <span
                  style={{ width: 68, height: 68, background: c.hex, border: '1px solid #DFD8CB', display: 'block' }}
                  aria-hidden
                />
                <span style={{ fontSize: 11.5, color: '#5C574D' }}>{c.nome}</span>
              </li>
            ))}
          </ul>

          {estado.analise.evitar.length > 0 && (
            <>
              <h2 className="font-display mt-12" style={{ fontSize: 30, fontWeight: 300 }}>
                As que pedem cuidado
              </h2>
              <ul className="mt-5 flex flex-wrap gap-[14px]">
                {estado.analise.evitar.map((c) => (
                  <li key={c.hex + c.nome} className="flex flex-col gap-[7px]">
                    <span
                      style={{ width: 52, height: 52, background: c.hex, border: '1px solid #DFD8CB', display: 'block' }}
                      aria-hidden
                    />
                    <span style={{ fontSize: 11.5, color: '#8A8375' }}>{c.nome}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {estado.pecas && estado.pecas.length > 0 && (
            <>
              <h2 className="font-display mt-14" style={{ fontSize: 30, fontWeight: 300 }}>
                Peças da loja para você
              </h2>
              <p className="mt-2" style={{ fontSize: 13, color: '#8A8375' }}>
                Escolhidas entre o que está em pronta entrega agora, pelas cores que combinam com a sua paleta.
              </p>
              <ul
                className="mt-7 grid gap-[26px_18px]"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}
              >
                {estado.pecas.map((p) => (
                  <li key={p.produto.id}>
                    <ProductCard produto={p.produto} reduzido />
                    {p.combinaCom && (
                      <p className="mt-[6px] flex items-center gap-[7px]" style={{ fontSize: 11, color: '#8A8375' }}>
                        <span
                          style={{ width: 11, height: 11, background: p.cor.hex, border: '1px solid #DFD8CB' }}
                          aria-hidden
                        />
                        {p.cor.nome} · conversa com {p.combinaCom.nome}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </>
  )
}
