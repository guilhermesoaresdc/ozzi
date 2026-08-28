import Link from 'next/link'
import { WHATSAPP } from '@/lib/supabase/config'

const MENSAGEM = 'Olá! Estou no site da Ozzi e fiquei com uma dúvida.'

/** Rodapé das páginas de ajuda: atalho para a loja e as outras dúvidas. */
export function NavAjuda({
  atual,
  topicos,
}: {
  atual: string
  topicos: { slug: string; titulo: string }[]
}) {
  return (
    <div style={{ marginTop: 44 }}>
      <div className="oz-card" style={{ padding: '28px 26px' }}>
        <h2 className="font-display" style={{ fontSize: 24, fontWeight: 400, marginBottom: 8 }}>
          Não achou a resposta?
        </h2>
        <p
          className="text-pretty"
          style={{ fontSize: 14, lineHeight: 1.7, color: '#5C574D', marginBottom: 20 }}
        >
          A gente responde no WhatsApp de segunda a sexta, das 8h às 18h, e no sábado até as 13h.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(MENSAGEM)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="oz-btn oz-btn-primary"
          >
            Falar no WhatsApp
          </a>
          <Link href="/sobre#contato" className="oz-btn oz-btn-tertiary">
            Ver os contatos da loja
          </Link>
        </div>
      </div>

      <nav aria-label="Outras dúvidas" style={{ marginTop: 34 }}>
        <h2 className="oz-label" style={{ marginBottom: 12 }}>
          Outras dúvidas
        </h2>
        <ul>
          {topicos.map((t) => {
            const ativo = t.slug === atual
            return (
              <li key={t.slug} style={{ borderTop: '1px solid #E4DDD1' }}>
                <Link
                  href={`/ajuda/${t.slug}`}
                  aria-current={ativo ? 'page' : undefined}
                  className="flex items-center justify-between"
                  style={{
                    gap: 14,
                    padding: '14px 0',
                    fontSize: 14.5,
                    color: ativo ? '#8A8375' : '#232320',
                  }}
                >
                  {t.titulo}
                  <span
                    aria-hidden
                    className="uppercase"
                    style={{ fontSize: 10.5, letterSpacing: '.14em', color: '#8A8375' }}
                  >
                    {ativo ? 'Você está aqui' : 'Ver'}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
