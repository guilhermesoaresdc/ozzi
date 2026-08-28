import Link from 'next/link'
import type { Metadata } from 'next'
import { GradeProdutos } from '@/components/loja/home/GradeProdutos'
import { getSettings, getTodosProdutos } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Novidades',
  description:
    'As últimas peças que entraram no estoque da Ozzi, da mais recente para a mais antiga. Pronta entrega, retirada no Centro de Várzea Alegre e Correios para todo o Brasil.',
  alternates: { canonical: '/novidades' },
}

export default async function NovidadesPage() {
  const [produtos, config] = await Promise.all([getTodosProdutos('novidades'), getSettings()])

  const total = produtos.length
  const emEstoque = produtos.filter((p) => p.prontaEntrega).length
  const entraram =
    total === 1 ? '1 peça nova entrou no estoque' : `${total} peças novas entraram no estoque`
  const todas = total === 1 ? '' : 'todas '
  const disponibilidade =
    emEstoque === total
      ? `${todas}em pronta entrega`
      : emEstoque === 0
        ? `${todas}sob encomenda`
        : `${emEstoque} em pronta entrega`

  return (
    <div className="shell" style={{ paddingTop: 24, paddingBottom: 92 }}>
      <nav
        aria-label="Trilha de navegação"
        className="uppercase"
        style={{ fontSize: 11, letterSpacing: '.1em', color: '#8A8375', marginBottom: 24 }}
      >
        <Link href="/">Início</Link> / <span aria-current="page">Novidades</span>
      </nav>

      <div
        className="flex flex-wrap items-end justify-between gap-x-5 gap-y-3 border-b border-line"
        style={{ paddingBottom: 20, marginBottom: 28 }}
      >
        <div>
          <h1
            className="font-display"
            style={{ fontWeight: 300, fontSize: 'clamp(38px, 4.4vw, 52px)', lineHeight: 1.05 }}
          >
            Novidades
          </h1>
          {total > 0 && (
            <p style={{ fontSize: 14, color: '#5C574D', marginTop: 8 }}>
              {entraram} · {disponibilidade}
            </p>
          )}
        </div>
        {total > 0 && (
          <p className="oz-label" style={{ paddingBottom: 6 }}>
            Da mais recente para a mais antiga
          </p>
        )}
      </div>

      <GradeProdutos
        produtos={produtos}
        parcelas={config.parcelas_max}
        minimo={220}
        espacamento="26px 18px"
        sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 25vw"
        prioritarios={4}
        vazio={{
          titulo: 'Nada novo por aqui ainda',
          texto:
            'A próxima remessa está sendo fotografada. Enquanto isso, dá para garimpar pelas categorias da vitrine.',
          acao: { href: '/', label: 'Ver categorias' },
        }}
      />
    </div>
  )
}
