'use client'

import { useActionState, useState } from 'react'
import { definirPadrao, removerEndereco } from '@/components/loja/conta/acoes'
import { AvisoConta } from '@/components/loja/conta/CampoConta'
import type { Endereco, EstadoConta } from '@/components/loja/conta/tipos'

const INICIAL: EstadoConta = {}
const BOTAO = { padding: '10px 16px', fontSize: 11, letterSpacing: '.14em' } as const

export function ListaEnderecos({ enderecos }: { enderecos: Endereco[] }) {
  const [estadoPadrao, marcarPadrao, marcando] = useActionState(definirPadrao, INICIAL)
  const [estadoRemover, remover, removendo] = useActionState(removerEndereco, INICIAL)
  const [confirmando, setConfirmando] = useState<string | null>(null)

  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      <AvisoConta erro={estadoPadrao.erro ?? estadoRemover.erro} ok={estadoPadrao.ok ?? estadoRemover.ok} />

      <ul className="flex flex-col" style={{ gap: 12 }}>
        {enderecos.map((endereco) => {
          const linha = [endereco.rua, endereco.numero].filter(Boolean).join(', ')
          const detalhe = [endereco.complemento, endereco.bairro].filter(Boolean).join(' · ')
          const cidade = `${endereco.cidade} - ${endereco.uf} · CEP ${endereco.cep}`
          const confirmar = confirmando === endereco.id

          return (
            <li
              key={endereco.id}
              style={{ background: '#FAF7F2', border: '1px solid #DFD8CB', padding: '18px 20px' }}
            >
              {endereco.padrao && (
                <span
                  className="mb-[10px] block uppercase"
                  style={{ fontSize: 10.5, letterSpacing: '.14em', color: '#8A6A4F' }}
                >
                  Endereço padrão
                </span>
              )}

              <p style={{ fontSize: 14, lineHeight: 1.55 }}>{linha}</p>
              {detalhe && (
                <p style={{ fontSize: 12.5, color: '#8A8375', lineHeight: 1.6, marginTop: 3 }}>
                  {detalhe}
                </p>
              )}
              <p style={{ fontSize: 12.5, color: '#8A8375', lineHeight: 1.6, marginTop: 3 }}>{cidade}</p>

              <div className="flex flex-wrap items-center" style={{ gap: 10, marginTop: 14 }}>
                {!endereco.padrao && (
                  <form action={marcarPadrao}>
                    <input type="hidden" name="id" value={endereco.id} />
                    <button
                      type="submit"
                      className="oz-btn oz-btn-tertiary"
                      style={BOTAO}
                      disabled={marcando}
                    >
                      Tornar padrão
                    </button>
                  </form>
                )}

                {confirmar ? (
                  <>
                    <form action={remover}>
                      <input type="hidden" name="id" value={endereco.id} />
                      <button
                        type="submit"
                        className="oz-btn oz-btn-tertiary"
                        style={{ ...BOTAO, color: '#A0533F', borderColor: '#A0533F' }}
                        disabled={removendo}
                      >
                        {removendo ? 'Removendo…' : 'Confirmar remoção'}
                      </button>
                    </form>
                    <button
                      type="button"
                      onClick={() => setConfirmando(null)}
                      className="cursor-pointer bg-transparent p-0"
                      style={{ border: 'none', fontSize: 12.5, color: '#8A8375' }}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmando(endereco.id)}
                    className="oz-btn oz-btn-tertiary"
                    style={{ ...BOTAO, color: '#A0533F' }}
                  >
                    Remover
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
