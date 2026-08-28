import Link from 'next/link'
import { Suspense } from 'react'
import { BuscaPainel } from '@/components/admin/BuscaPainel'

export function PageHeader({
  titulo,
  subtitulo,
  acao,
}: {
  titulo: string
  subtitulo?: string
  acao?: React.ReactNode
}) {
  return (
    <header
      className="sticky top-0 z-50 border-b border-line px-[30px] py-4"
      style={{ background: 'rgba(242,238,231,.94)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <div>
          <h1 className="font-display" style={{ fontSize: 30, fontWeight: 300, lineHeight: 1.1 }}>
            {titulo}
          </h1>
          {subtitulo && (
            <p className="mt-[3px]" style={{ fontSize: 12.5, color: '#8A8375' }}>
              {subtitulo}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-[10px]">
          {/* useSearchParams precisa de fronteira de Suspense se a página virar estática */}
          <Suspense fallback={<div style={{ width: 270, height: 41 }} />}>
            <BuscaPainel />
          </Suspense>
          {acao ?? (
            <Link href="/admin/produtos/novo" className="oz-btn oz-btn-primary" style={{ padding: '13px 22px' }}>
              + Novo produto
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
