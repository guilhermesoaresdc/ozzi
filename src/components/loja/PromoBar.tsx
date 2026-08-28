import { getNotices, getSettings } from '@/lib/queries'
import { FaixaAvisos } from '@/components/loja/FaixaAvisos'

export async function PromoBar() {
  const [settings, avisos] = await Promise.all([getSettings(), getNotices()])
  if (!settings.promo_bar_ativa || avisos.length === 0) return null

  return <FaixaAvisos avisos={avisos.map((a) => ({ id: a.id, texto: a.texto }))} />
}
