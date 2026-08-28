import type { Metadata } from 'next'
import { PageHeader } from '@/components/admin/PageHeader'
import { CartaoCupons } from '@/components/admin/config/CartaoCupons'
import { CartaoDadosLoja } from '@/components/admin/config/CartaoDadosLoja'
import { CartaoEntrega } from '@/components/admin/config/CartaoEntrega'
import { CartaoPagamentos } from '@/components/admin/config/CartaoPagamentos'
import { listarCupons, listarEntregas, listarPagamentos } from '@/lib/admin-queries'
import { getSettings } from '@/lib/queries'

export const metadata: Metadata = { title: 'Configurações' }

export default async function ConfiguracoesPage() {
  const [entregas, pagamentos, cupons, settings] = await Promise.all([
    listarEntregas(),
    listarPagamentos(),
    listarCupons(),
    getSettings(),
  ])

  return (
    <>
      <PageHeader titulo="Configurações" subtitulo="Entrega, pagamento, dados da loja e cupons" />

      <main style={{ padding: '26px 30px 60px' }}>
        <div
          className="grid items-start gap-5"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,320px), 1fr))' }}
        >
          <CartaoEntrega entregas={entregas} freteGratisAcima={Number(settings.frete_gratis_acima)} />
          <CartaoPagamentos
            pagamentos={pagamentos}
            descontoPix={Number(settings.desconto_pix)}
            parcelasMax={settings.parcelas_max}
          />
          <CartaoDadosLoja settings={settings} />
          <CartaoCupons cupons={cupons} />
        </div>
      </main>
    </>
  )
}
