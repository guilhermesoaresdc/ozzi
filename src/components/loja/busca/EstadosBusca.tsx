import Link from 'next/link'
import { WHATSAPP } from '@/lib/supabase/config'

/**
 * Estados que faltavam no protótipo (handoff §7): carregando, sem resultado e
 * erro. Mesma linguagem: fundo #FAF7F2, fio #DFD8CB, apoio #8A8375, erro
 * #A0533F. Sem raio, sem sombra decorativa.
 */

function linkWhatsapp(mensagem: string): string {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`
}

function Bloco({ altura, largura = '100%' }: { altura: number | string; largura?: number | string }) {
  return (
    <div
      style={{ height: altura, width: largura, background: '#FAF7F2', boxShadow: '0 0 0 1px #DFD8CB' }}
    />
  )
}

export function EsqueletoResultados({ quantidade = 6 }: { quantidade?: number }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Buscando peças no estoque…</span>
      <div className="animate-pulse" aria-hidden="true">
        <div style={{ marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #DFD8CB' }}>
          <Bloco altura={10} largura={190} />
        </div>
        <div
          className="grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))',
            gap: '24px 16px',
          }}
        >
          {Array.from({ length: quantidade }, (_, i) => (
            <div key={i} className="flex flex-col">
              <div style={{ aspectRatio: '3/4', background: '#FAF7F2', boxShadow: '0 0 0 1px #DFD8CB' }} />
              <div className="flex flex-col gap-[9px]" style={{ padding: '13px 2px 0' }}>
                <Bloco altura={11} largura="64%" />
                <Bloco altura={14} largura="36%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SemResultado({ termo }: { termo: string }) {
  return (
    <div
      className="oz-card flex flex-col items-center text-center"
      style={{ padding: '56px 28px', gap: 12 }}
    >
      <span className="oz-label">Nenhuma peça</span>
      <h2
        className="font-display"
        style={{ fontSize: 26, fontWeight: 300, lineHeight: 1.15, textWrap: 'balance' }}
      >
        Nada encontrado para “{termo}”
      </h2>
      <p
        className="text-body"
        style={{ fontSize: 13.5, lineHeight: 1.7, maxWidth: 430, textWrap: 'pretty' }}
      >
        Tente o nome da peça, uma cor ou a referência (por exemplo, OZ-1042). Se você viu no
        Instagram e não achou aqui, a gente procura no estoque para você.
      </p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Link href="/novidades" className="oz-btn oz-btn-outline">
          Ver novidades
        </Link>
        <a
          href={linkWhatsapp(`Oi! Procurei por "${termo}" no site e não encontrei. Vocês têm algo parecido?`)}
          target="_blank"
          rel="noopener noreferrer"
          className="oz-btn oz-btn-tertiary"
        >
          Procurar no WhatsApp
        </a>
      </div>
    </div>
  )
}

export function ErroDeBusca({ termo, aoTentar }: { termo: string; aoTentar: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center text-center"
      style={{ background: '#FAF7F2', border: '1px solid #A0533F', padding: '56px 28px', gap: 12 }}
    >
      <span className="oz-label" style={{ color: '#A0533F' }}>
        Erro na busca
      </span>
      <h2
        className="font-display"
        style={{ fontSize: 26, fontWeight: 300, lineHeight: 1.15, textWrap: 'balance' }}
      >
        A busca não respondeu agora
      </h2>
      <p
        className="text-body"
        style={{ fontSize: 13.5, lineHeight: 1.7, maxWidth: 430, textWrap: 'pretty' }}
      >
        A conexão com o estoque falhou no meio do caminho. Tente de novo em instantes — ou pergunte
        direto para a loja.
      </p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <button type="button" onClick={aoTentar} className="oz-btn oz-btn-outline cursor-pointer">
          Tentar de novo
        </button>
        <a
          href={linkWhatsapp(
            termo
              ? `Oi! O site não conseguiu buscar "${termo}". Vocês têm essa peça?`
              : 'Oi! A busca do site não está respondendo. Podem me ajudar a achar uma peça?',
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="oz-btn oz-btn-tertiary"
        >
          Falar no WhatsApp
        </a>
      </div>
    </div>
  )
}
