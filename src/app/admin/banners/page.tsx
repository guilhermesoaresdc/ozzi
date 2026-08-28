import type { Metadata } from 'next'
import { PageHeader } from '@/components/admin/PageHeader'
import { Agendamentos } from '@/components/admin/banners/Agendamentos'
import { AvisosBarra } from '@/components/admin/banners/AvisosBarra'
import { BannerHome } from '@/components/admin/banners/BannerHome'
import { BannersCategoria } from '@/components/admin/banners/BannersCategoria'
import { CartaoFaixaColecao } from '@/components/admin/banners/CartaoFaixaColecao'
import { listarAvisos, listarBanners, listarCategorias } from '@/lib/admin-queries'
import { getSettings } from '@/lib/queries'

export const metadata: Metadata = { title: 'Banners e avisos' }

export default async function BannersPage() {
  const [avisos, banners, categorias, settings] = await Promise.all([
    listarAvisos(),
    listarBanners(),
    listarCategorias(),
    getSettings(),
  ])

  const hero = banners.find((b) => b.tipo === 'home_hero') ?? null
  const faixa = banners.find((b) => b.tipo === 'faixa_colecao') ?? null

  return (
    <>
      <PageHeader
        titulo="Banners e avisos"
        subtitulo="Imagens da vitrine, faixa de avisos e campanhas agendadas"
      />

      <main className="flex flex-col gap-5" style={{ padding: '26px 30px 60px' }}>
        <AvisosBarra avisos={avisos} faixaAtiva={settings.promo_bar_ativa} />
        <BannerHome banner={hero} />
        <BannersCategoria categorias={categorias} />
        <CartaoFaixaColecao banner={faixa} />
        <Agendamentos banners={banners} avisos={avisos} />
      </main>
    </>
  )
}
