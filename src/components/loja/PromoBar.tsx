import { getNotices, getSettings } from '@/lib/queries'

export async function PromoBar() {
  const [settings, avisos] = await Promise.all([getSettings(), getNotices()])
  if (!settings.promo_bar_ativa || avisos.length === 0) return null

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-x-[30px] gap-y-3 px-6 py-[10px] text-center"
      style={{ background: '#232320', color: '#F2EEE7', fontSize: 10.5, letterSpacing: '.18em' }}
    >
      {avisos.map((a, i) => (
        <span key={a.id} className="contents">
          {i > 0 && (
            <span aria-hidden style={{ opacity: 0.3 }}>
              /
            </span>
          )}
          <span className="uppercase">{a.texto}</span>
        </span>
      ))}
    </div>
  )
}
