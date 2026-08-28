import Link from 'next/link'
import { Placeholder } from '@/components/ui/Placeholder'
import { getBanner } from '@/lib/queries'

/** Texto do handoff §5.1 — vale quando não há banner 'faixa_colecao' cadastrado. */
const PADRAO = {
  chapeu: 'Só em Várzea Alegre',
  titulo: 'Prove em casa antes de pagar',
  texto:
    'Na cidade e na região, levamos até três peças para você experimentar com calma. Você paga só o que ficar.',
  textoBotao: 'Como funciona',
  linkBotao: '/sobre',
}

export async function FaixaColecao() {
  const banner = await getBanner('faixa_colecao')

  const chapeu = banner?.chapeu?.trim() || PADRAO.chapeu
  const titulo = banner?.titulo?.trim() || PADRAO.titulo
  const texto = banner?.texto?.trim() || PADRAO.texto
  const textoBotao = banner?.texto_botao?.trim() || PADRAO.textoBotao
  const linkBotao = banner?.link_botao?.trim() || PADRAO.linkBotao

  return (
    <section className="shell" style={{ marginTop: 76 }}>
      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          background: '#232320',
          color: '#F2EEE7',
        }}
      >
        <div style={{ padding: 'clamp(40px,5vw,64px) clamp(28px,4vw,56px)' }}>
          <span className="uppercase" style={{ fontSize: 10.5, letterSpacing: '.26em', color: '#C4A88B' }}>
            {chapeu}
          </span>

          <h2
            className="font-display text-balance"
            style={{
              fontWeight: 300,
              fontSize: 'clamp(32px, 3.4vw, 44px)',
              lineHeight: 1.06,
              margin: '16px 0 18px',
              maxWidth: 420,
            }}
          >
            {titulo}
          </h2>

          <p
            className="text-pretty"
            style={{ fontSize: 15, lineHeight: 1.72, color: '#B3ADA0', maxWidth: 420, marginBottom: 28 }}
          >
            {texto}
          </p>

          <Link href={linkBotao} className="oz-btn oz-btn-outline-light">
            {textoBotao}
          </Link>
        </div>

        <Placeholder
          label="look da coleção · 900×760"
          src={banner?.imagem}
          alt={titulo}
          ratio="auto"
          minHeight={320}
          escuro
          sizes="(max-width: 900px) 100vw, 50vw"
          className="justify-center"
        />
      </div>
    </section>
  )
}
