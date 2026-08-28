'use client'

import { useActionState, useState } from 'react'
import { avancarPedido, cancelarPedido, type EstadoAcao } from '@/app/admin/pedidos/actions'
import type { DeliveryMethod, OrderStatus } from '@/lib/database.types'
import { linkWhatsapp, mensagemWhatsapp, podeCancelar, proximoPasso } from '@/components/admin/pedidos/passos'

const INICIAL: EstadoAcao = {}

const BOTAO = { fontSize: 11, letterSpacing: '.14em' } as const

function Aviso({ estado }: { estado: EstadoAcao }) {
  if (!estado.erro && !estado.ok) return null
  return (
    <p role="status" style={{ fontSize: 12, lineHeight: 1.5, color: estado.erro ? '#A0533F' : '#5C7A5E' }}>
      {estado.erro ?? estado.ok}
    </p>
  )
}

export function ProximoPasso({
  codigo,
  status,
  metodoEntrega,
  clienteNome,
  telefone,
  motivoSemEtiqueta,
}: {
  codigo: string
  status: OrderStatus
  metodoEntrega: DeliveryMethod
  clienteNome: string
  telefone: string | null
  motivoSemEtiqueta: string | null
}) {
  const [estadoAvanco, acaoAvancar, avancando] = useActionState(avancarPedido, INICIAL)
  const [estadoCancelamento, acaoCancelar, cancelando] = useActionState(cancelarPedido, INICIAL)
  const [confirmando, setConfirmando] = useState(false)

  const passo = proximoPasso(status, metodoEntrega)
  const aviso = mensagemWhatsapp({ codigo, cliente_nome: clienteNome, status, metodo_entrega: metodoEntrega })
  const whatsapp = linkWhatsapp(telefone, aviso)

  return (
    <section className="oz-card" style={{ padding: 22 }}>
      <h2 className="font-display" style={{ fontSize: 20, fontWeight: 400, marginBottom: 16 }}>
        Próximo passo
      </h2>

      <div className="flex flex-col gap-[9px]">
        {passo ? (
          <form action={acaoAvancar}>
            <input type="hidden" name="codigo" value={codigo} />
            <input type="hidden" name="proximo" value={passo.proximo} />
            <button
              type="submit"
              disabled={avancando}
              className="oz-btn oz-btn-primary w-full"
              style={{ ...BOTAO, padding: 14, letterSpacing: '.16em' }}
            >
              {avancando ? 'Salvando…' : passo.rotulo}
            </button>
          </form>
        ) : (
          <p style={{ fontSize: 12.5, lineHeight: 1.6, color: '#8A8375' }}>
            {status === 'cancelado'
              ? 'Pedido cancelado. Não há próximo passo por aqui.'
              : 'Pedido entregue. Não há próximo passo por aqui.'}
          </p>
        )}
        <Aviso estado={estadoAvanco} />

        {whatsapp ? (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="oz-btn oz-btn-tertiary w-full"
            style={{ ...BOTAO, padding: 13 }}
          >
            Avisar cliente no WhatsApp
          </a>
        ) : (
          <>
            <button type="button" disabled className="oz-btn oz-btn-tertiary w-full" style={{ ...BOTAO, padding: 13 }}>
              Avisar cliente no WhatsApp
            </button>
            <p style={{ fontSize: 11.5, lineHeight: 1.5, color: '#8A8375' }}>
              Este pedido não tem um WhatsApp válido cadastrado.
            </p>
          </>
        )}

        {motivoSemEtiqueta ? (
          <>
            <button type="button" disabled className="oz-btn oz-btn-tertiary w-full" style={{ ...BOTAO, padding: 13 }}>
              Imprimir etiqueta
            </button>
            <p style={{ fontSize: 11.5, lineHeight: 1.5, color: '#8A8375' }}>{motivoSemEtiqueta}</p>
          </>
        ) : (
          <button
            type="button"
            onClick={() => window.print()}
            className="oz-btn oz-btn-tertiary w-full"
            style={{ ...BOTAO, padding: 13 }}
          >
            Imprimir etiqueta
          </button>
        )}

        {podeCancelar(status) &&
          (confirmando ? (
            <div className="flex flex-col gap-[10px]" style={{ border: '1px solid #E4DDD1', padding: 14 }}>
              <p style={{ fontSize: 12.5, lineHeight: 1.6, color: '#5C574D' }}>
                Cancelar o pedido #{codigo}? O estoque não volta sozinho e o histórico guarda o registro.
              </p>
              <form action={acaoCancelar} className="flex gap-[9px]">
                <input type="hidden" name="codigo" value={codigo} />
                <button
                  type="submit"
                  disabled={cancelando}
                  className="oz-btn flex-1"
                  style={{ ...BOTAO, padding: 11, borderColor: '#A0533F', color: '#A0533F' }}
                >
                  {cancelando ? 'Cancelando…' : 'Sim, cancelar'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmando(false)}
                  className="oz-btn oz-btn-tertiary flex-1"
                  style={{ ...BOTAO, padding: 11 }}
                >
                  Voltar
                </button>
              </form>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmando(true)}
              className="oz-btn w-full"
              style={{ ...BOTAO, padding: 11, color: '#A0533F' }}
            >
              Cancelar pedido
            </button>
          ))}
        <Aviso estado={estadoCancelamento} />
      </div>
    </section>
  )
}
