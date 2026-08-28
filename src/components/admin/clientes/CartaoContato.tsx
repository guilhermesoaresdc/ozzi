import { Card } from '@/components/admin/Card'
import { cidadeUf, type ResumoDoCliente } from '@/components/admin/clientes/dados'
import { linkWhatsapp } from '@/components/admin/pedidos/passos'
import type { CustomerRow } from '@/lib/database.types'
import { dataCurta, primeiroNome } from '@/lib/format'

export function CartaoContato({
  cliente,
  resumo,
}: {
  cliente: CustomerRow
  resumo: ResumoDoCliente
}) {
  const nome = primeiroNome(cliente.nome)
  const mensagem = `${nome ? `Oi, ${nome}!` : 'Oi!'} Aqui é da Ozzi. Tudo bem?`
  const whatsapp = linkWhatsapp(cliente.telefone, mensagem)

  const campos: { label: string; valor: string }[] = [
    { label: 'Nome', valor: cliente.nome },
    { label: 'WhatsApp', valor: cliente.telefone ?? 'Não informado' },
    { label: 'E-mail', valor: cliente.email ?? 'Não informado' },
    { label: 'Cidade', valor: cidadeUf(cliente.cidade, cliente.uf) || 'Não informada' },
    { label: 'Clube Ozzi', valor: cliente.clube_ozzi ? 'Participa' : 'Não participa' },
    {
      label: 'E-mail marketing',
      valor: cliente.opt_in_email ? 'Aceita receber' : 'Não aceita receber',
    },
    { label: 'Cadastro', valor: dataCurta(cliente.criado_em) },
    {
      label: 'Último pedido',
      valor: resumo.ultimoPedido ? dataCurta(resumo.ultimoPedido) : 'Nunca comprou',
    },
  ]

  return (
    <Card>
      <h2 className="font-display" style={{ fontSize: 20, fontWeight: 400, marginBottom: 14 }}>
        Contato
      </h2>

      <div className="flex flex-col gap-[14px]" style={{ fontSize: 13, lineHeight: 1.6 }}>
        {campos.map((campo) => (
          <div key={campo.label}>
            <p className="oz-label" style={{ marginBottom: 4 }}>
              {campo.label}
            </p>
            <p style={{ color: '#232320' }}>{campo.valor}</p>
          </div>
        ))}
      </div>

      {whatsapp ? (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="oz-btn oz-btn-tertiary mt-[18px] w-full"
          style={{ fontSize: 11, letterSpacing: '.14em', padding: 13 }}
        >
          Falar no WhatsApp
        </a>
      ) : (
        <p className="mt-[18px]" style={{ fontSize: 12, lineHeight: 1.5, color: '#8A8375' }}>
          Sem telefone utilizável no cadastro — não dá para abrir o WhatsApp por aqui.
        </p>
      )}
    </Card>
  )
}
