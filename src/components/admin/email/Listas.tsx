import { Card } from '@/components/admin/Card'
import { ehDoCariri, type ClienteComResumo } from '@/lib/admin-queries'
import type { EmailListRow } from '@/lib/database.types'
import { num } from '@/lib/format'
import { AJUDA, TituloCartao } from './Pecas'

/** A regra guardada no banco é um código; aqui ela vira frase e vira contagem. */
const REGRAS: Record<string, { texto: string; conta: (c: ClienteComResumo[], alertas: number) => number }> = {
  todos: {
    texto: 'Todo cadastro com opt-in de e-mail',
    conta: (clientes) => clientes.filter((c) => c.opt_in_email).length,
  },
  cariri_120km: {
    texto: 'Cidades do Cariri, num raio de 120 km',
    conta: (clientes) => clientes.filter((c) => c.opt_in_email && ehDoCariri(c.cidade)).length,
  },
  clube_ozzi: {
    texto: 'Quem entrou no Clube Ozzi',
    conta: (clientes) => clientes.filter((c) => c.opt_in_email && c.clube_ozzi).length,
  },
  recorrentes: {
    texto: 'Comprou duas vezes ou mais',
    conta: (clientes) => clientes.filter((c) => c.opt_in_email && c.pedidos >= 2).length,
  },
  avise_me: {
    texto: 'Pediu aviso de volta ao estoque',
    conta: (_clientes, alertas) => alertas,
  },
}

export function Listas({
  listas,
  clientes,
  alertasDeEstoque,
}: {
  listas: EmailListRow[]
  clientes: ClienteComResumo[]
  alertasDeEstoque: number
}) {
  return (
    <Card
      titulo={
        <div className="flex min-w-0 flex-1 flex-col gap-[10px]">
          <TituloCartao titulo="Listas" apoio="Segmentos atualizados automaticamente" />
          <p style={AJUDA}>
            A contagem é feita agora, sobre os cadastros com opt-in de e-mail — não é um número guardado.
          </p>
        </div>
      }
      semPadding
    >
      {listas.length === 0 ? (
        <p className="px-[22px] py-[26px]" style={{ fontSize: 13, color: '#8A8375' }}>
          Nenhuma lista cadastrada.
        </p>
      ) : (
        <ul style={{ padding: '6px 22px 18px' }}>
          {listas.map((lista, i) => {
            const regra = REGRAS[lista.regra]
            const contagem = regra ? regra.conta(clientes, alertasDeEstoque) : null
            return (
              <li
                key={lista.id}
                className="flex items-center justify-between gap-[14px] py-[15px]"
                style={{ borderBottom: i === listas.length - 1 ? undefined : '1px solid #E4DDD1' }}
              >
                <span className="flex min-w-0 flex-col gap-[4px]">
                  <span style={{ fontSize: 13.5 }}>{lista.nome}</span>
                  <span style={{ fontSize: 11.5, color: '#8A8375' }}>{regra?.texto ?? lista.regra}</span>
                </span>
                <span
                  className="font-display whitespace-nowrap"
                  style={{ fontSize: 22, color: contagem === null ? '#8A8375' : undefined }}
                  title={contagem === null ? 'O painel ainda não sabe calcular esta regra.' : undefined}
                >
                  {contagem === null ? '—' : num(contagem)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
