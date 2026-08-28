import { Suspense } from 'react'
import type { Metadata } from 'next'
import { HeroSobre } from '@/components/loja/sobre/HeroSobre'
import { BlocosSobre } from '@/components/loja/sobre/BlocosSobre'
import { Contato, ContatoEsqueleto } from '@/components/loja/sobre/Contato'

export const metadata: Metadata = {
  title: 'Sobre nós',
  description:
    'A Ozzi é uma loja de moda feminina do Centro de Várzea Alegre - CE: curadoria de arara, tecidos que aguentam o calor do Cariri e encomenda sob medida em até 10 dias úteis.',
  alternates: { canonical: '/sobre' },
  openGraph: {
    type: 'website',
    url: '/sobre',
    title: 'Do Centro de Várzea Alegre pro Brasil · Ozzi',
    description:
      'Curadoria de arara, tecidos para 38 graus e encomenda com nome. Conheça a Ozzi e fale com a loja.',
  },
}

export default function SobrePage() {
  return (
    <>
      <HeroSobre />
      <BlocosSobre />
      <Suspense fallback={<ContatoEsqueleto />}>
        <Contato />
      </Suspense>
    </>
  )
}
