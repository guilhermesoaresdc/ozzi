import { Suspense } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { SectionHeader } from '@/components/loja/SectionHeader'
import { PassosEncomenda } from '@/components/loja/sobre/PassosEncomenda'
import { EsqueletoEncomenda, ListaEncomenda } from '@/components/loja/sobre/ListaEncomenda'

export const metadata: Metadata = {
  title: 'Sob encomenda',
  description:
    'Peças com a numeração esgotada que continuam à venda: costuramos sob medida e entregamos em até 10 dias úteis, com retirada no Centro de Várzea Alegre ou envio pelos Correios.',
  alternates: { canonical: '/sob-encomenda' },
  openGraph: {
    type: 'website',
    url: '/sob-encomenda',
    title: 'Sob encomenda · Ozzi',
    description: 'Numeração esgotada não é fim de conversa: sob medida em até 10 dias úteis.',
  },
}

export default function SobEncomendaPage() {
  return (
    <div className="shell" style={{ paddingTop: 24, paddingBottom: 92 }}>
      <nav
        aria-label="Trilha de navegação"
        className="uppercase"
        style={{ fontSize: 11, letterSpacing: '.1em', color: '#8A8375', marginBottom: 30 }}
      >
        <Link href="/" className="text-muted hover:text-accent">
          Início
        </Link>
        <span aria-hidden style={{ padding: '0 7px' }}>
          /
        </span>
        <span aria-current="page" className="text-ink">
          Sob encomenda
        </span>
      </nav>

      <header style={{ maxWidth: 720, marginBottom: 44 }}>
        <span className="oz-eyebrow block" style={{ marginBottom: 18 }}>
          Encomenda com nome
        </span>
        <h1
          className="font-display text-balance"
          style={{
            fontWeight: 300,
            fontSize: 'clamp(34px, 4.4vw, 52px)',
            lineHeight: 1.06,
            letterSpacing: '-.015em',
            marginBottom: 18,
          }}
        >
          Numeração esgotada não é fim de conversa
        </h1>
        <p className="text-pretty" style={{ fontSize: 15.5, lineHeight: 1.72, color: '#5C574D' }}>
          Quando a grade de uma peça acaba, ela continua no site: a gente costura sob medida e
          entrega em até 10 dias úteis. Você combina cor e numeração com a loja e escolhe do mesmo
          jeito entre retirar no Centro de Várzea Alegre ou receber em casa.
        </p>
      </header>

      <PassosEncomenda />

      <div style={{ marginTop: 64, marginBottom: 26 }}>
        <SectionHeader
          chapeu="Peças com a grade esgotada"
          titulo="Para encomendar"
          link="/novidades"
          linkLabel="Ver a pronta entrega"
        />
      </div>

      <Suspense fallback={<EsqueletoEncomenda />}>
        <ListaEncomenda />
      </Suspense>
    </div>
  )
}
