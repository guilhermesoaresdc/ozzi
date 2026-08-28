import { Placeholder } from '@/components/ui/Placeholder'
import { getSettings } from '@/lib/queries'
import { WHATSAPP } from '@/lib/supabase/config'

const MENSAGEM = 'Olá! Vim pelo site da Ozzi e queria falar com a loja.'

function Dado({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        className="uppercase"
        style={{ fontSize: 10.5, letterSpacing: '.16em', color: '#8A8375', marginBottom: 4 }}
      >
        {label}
      </p>
      <p style={{ color: '#232320' }}>{children}</p>
    </div>
  )
}

/** "Fale com a gente" (handoff §5.9). Os dados vêm de store_settings. */
export async function Contato() {
  const s = await getSettings()
  const perfil = s.instagram.replace(/^@/, '')

  return (
    <section
      id="contato"
      aria-labelledby="contato-titulo"
      className="shell"
      style={{ paddingTop: 64, paddingBottom: 92, scrollMarginTop: 110 }}
    >
      <div
        className="grid items-center"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 'clamp(28px, 4vw, 56px)',
        }}
      >
        <div>
          <h2
            id="contato-titulo"
            className="font-display"
            style={{ fontSize: 38, fontWeight: 300, lineHeight: 1.1, marginBottom: 20 }}
          >
            Fale com a gente
          </h2>

          <div
            className="flex flex-col"
            style={{ gap: 16, fontSize: 14.5, lineHeight: 1.7, color: '#5C574D' }}
          >
            <Dado label="Onde estamos">
              {s.localizacao}
              <br />
              Loja online, com entrega local
            </Dado>

            <Dado label="Atendimento">
              Seg a sex · 8h às 18h
              <br />
              Sábado · 8h às 13h
            </Dado>

            <Dado label="Fale com a gente">
              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(MENSAGEM)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.whatsapp}
              </a>
              <span aria-hidden style={{ padding: '0 6px', color: '#8A8375' }}>
                ·
              </span>
              <a
                href={`https://instagram.com/${perfil}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.instagram}
              </a>
            </Dado>
          </div>
        </div>

        <Placeholder
          label="entrega local · 900×680"
          alt="Entrega local em Várzea Alegre"
          ratio="4/3"
          sizes="(max-width: 900px) 100vw, 50vw"
          className="justify-center"
        />
      </div>
    </section>
  )
}

/** Estado de carregamento (handoff §7): mesma malha, sem conteúdo. */
export function ContatoEsqueleto() {
  return (
    <section className="shell" style={{ paddingTop: 64, paddingBottom: 92 }} role="status" aria-live="polite">
      <span className="sr-only">Carregando os dados de contato…</span>
      <div
        className="grid animate-pulse items-center"
        aria-hidden
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 'clamp(28px, 4vw, 56px)',
        }}
      >
        <div className="flex flex-col" style={{ gap: 22 }}>
          <span className="block" style={{ height: 34, width: 220, background: '#E9E3D9' }} />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col" style={{ gap: 8 }}>
              <span className="block" style={{ height: 9, width: 96, background: '#E9E3D9' }} />
              <span className="block" style={{ height: 12, width: '62%', background: '#FAF7F2', boxShadow: '0 0 0 1px #DFD8CB' }} />
              <span className="block" style={{ height: 12, width: '46%', background: '#FAF7F2', boxShadow: '0 0 0 1px #DFD8CB' }} />
            </div>
          ))}
        </div>
        <span className="block" style={{ aspectRatio: '4/3', background: '#FAF7F2', boxShadow: '0 0 0 1px #DFD8CB' }} />
      </div>
    </section>
  )
}
