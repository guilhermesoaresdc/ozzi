import { Placeholder } from '@/components/ui/Placeholder'

/** Hero da página Sobre (handoff §5.9) — mesma estrutura do hero da home. */
const LINHAS = ['Do Centro de', 'Várzea Alegre', 'pro Brasil']

const TEXTO =
  'A Ozzi começou em 2019 com um perfil no Instagram, um caderno de encomendas e muita conversa no WhatsApp. Hoje atendemos o Cariri inteiro e enviamos para todo o país — sem perder o jeito de vizinha, que sabe o nome de quem chama.'

export function HeroSobre() {
  return (
    <section className="shell">
      <div
        className="grid border-b border-line"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}
      >
        <div
          className="flex flex-col justify-center"
          style={{ padding: 'clamp(48px,6vw,84px) clamp(0px,4vw,56px) clamp(48px,6vw,84px) 0' }}
        >
          <span
            className="uppercase"
            style={{ fontSize: 10.5, letterSpacing: '.26em', color: '#8A6A4F', marginBottom: 22 }}
          >
            Várzea Alegre · Ceará
          </span>

          <h1
            className="font-display text-balance"
            style={{
              fontWeight: 300,
              fontSize: 'clamp(40px, 5vw, 66px)',
              lineHeight: 1.02,
              marginBottom: 22,
            }}
          >
            {LINHAS.map((linha) => (
              <span key={linha} className="block">
                {linha}
              </span>
            ))}
          </h1>

          <p
            className="text-pretty"
            style={{ fontSize: 15.5, lineHeight: 1.75, color: '#5C574D', maxWidth: 440 }}
          >
            {TEXTO}
          </p>
        </div>

        <Placeholder
          label="araras da coleção · 1000×1100"
          alt="Araras da coleção na loja da Ozzi"
          ratio="auto"
          minHeight={420}
          sizes="(max-width: 900px) 100vw, 50vw"
          priority
          className="justify-center"
        />
      </div>
    </section>
  )
}
