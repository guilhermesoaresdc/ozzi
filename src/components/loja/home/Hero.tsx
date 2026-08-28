import Link from 'next/link'
import { Placeholder } from '@/components/ui/Placeholder'
import { getBanner } from '@/lib/queries'

/** Texto do handoff §5.1 — vale quando não há banner 'home_hero' cadastrado. */
const PADRAO = {
  chapeu: 'Coleção Alta Estação 2026',
  titulo: 'Linho, luz|e o sertão|em movimento',
  texto:
    'Peças escolhidas uma a uma por quem mora aqui, no Centro de Várzea Alegre. O que está no site sai hoje do estoque.',
  textoBotao: 'Comprar pronta entrega',
  linkBotao: '/novidades',
}

export async function Hero() {
  const banner = await getBanner('home_hero')

  const chapeu = banner?.chapeu?.trim() || PADRAO.chapeu
  const texto = banner?.texto?.trim() || PADRAO.texto
  const textoBotao = banner?.texto_botao?.trim() || PADRAO.textoBotao
  const linkBotao = banner?.link_botao?.trim() || PADRAO.linkBotao

  // O título é guardado com "|" separando as linhas; a segunda é a ênfase em marrom.
  const linhas = (banner?.titulo?.trim() || PADRAO.titulo)
    .split('|')
    .map((l) => l.trim())
    .filter(Boolean)

  return (
    <section className="shell">
      <div
        className="grid border-b border-line"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 330px), 1fr))' }}
      >
        <div
          className="flex flex-col justify-center"
          style={{
            padding: 'clamp(48px,7vw,92px) clamp(0px,4vw,64px) clamp(48px,7vw,92px) 0',
            minHeight: 520,
          }}
        >
          <span
            className="uppercase"
            style={{ fontSize: 10.5, letterSpacing: '.26em', color: '#8A6A4F', marginBottom: 24 }}
          >
            {chapeu}
          </span>

          <h1
            className="font-display text-balance"
            style={{
              fontWeight: 300,
              fontSize: 'clamp(46px, 5.4vw, 78px)',
              lineHeight: 0.98,
              letterSpacing: '-.015em',
              marginBottom: 24,
            }}
          >
            {linhas.map((linha, i) => (
              <span key={`${i}-${linha}`} className="block">
                {i === 1 ? <em style={{ color: '#8A6A4F' }}>{linha}</em> : linha}
              </span>
            ))}
          </h1>

          <p
            className="text-pretty"
            style={{ fontSize: 15.5, lineHeight: 1.72, color: '#5C574D', maxWidth: 410, marginBottom: 38 }}
          >
            {texto}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href={linkBotao} className="oz-btn oz-btn-primary">
              {textoBotao}
            </Link>
            <Link href="/sobre" className="oz-btn oz-btn-outline">
              Conhecer a Ozzi
            </Link>
          </div>
        </div>

        <Placeholder
          label="editorial · look principal · 1040×1300"
          src={banner?.imagem}
          alt={`${linhas.join(' ')} — ${chapeu}`}
          ratio="auto"
          minHeight={460}
          sizes="(max-width: 900px) 100vw, 50vw"
          priority
          className="justify-center"
        />
      </div>
    </section>
  )
}
