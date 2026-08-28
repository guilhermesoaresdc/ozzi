import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Hero } from '@/components/loja/home/Hero'
import { GradeCategorias } from '@/components/loja/home/GradeCategorias'
import { FavoritosDaCasa } from '@/components/loja/home/FavoritosDaCasa'
import { FaixaColecao } from '@/components/loja/home/FaixaColecao'
import { Beneficios } from '@/components/loja/home/Beneficios'
import {
  CategoriasSkeleton,
  FaixaSkeleton,
  FavoritosSkeleton,
  HeroSkeleton,
} from '@/components/loja/home/Skeletons'

export const metadata: Metadata = {
  title: { absolute: 'Ozzi Moda Feminina · Pronta entrega em Várzea Alegre - CE' },
  description:
    'Vestidos, blusas, conjuntos e acessórios em pronta entrega. Retirada no Centro de Várzea Alegre em até 2 horas, PIX com 5% de desconto e Correios para todo o Brasil.',
  alternates: { canonical: '/' },
}

export default function Home() {
  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <Hero />
      </Suspense>

      <Suspense fallback={<CategoriasSkeleton />}>
        <GradeCategorias />
      </Suspense>

      <Suspense fallback={<FavoritosSkeleton />}>
        <FavoritosDaCasa />
      </Suspense>

      <Suspense fallback={<FaixaSkeleton />}>
        <FaixaColecao />
      </Suspense>

      <Beneficios />
    </>
  )
}
