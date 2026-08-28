/** Os três blocos da página Sobre (handoff §5.9). Texto final. */
const BLOCOS = [
  {
    titulo: 'Curadoria de araras',
    texto:
      'Cada peça passa pela prova antes de entrar no site. Se o caimento não convence a gente, não vai para a vitrine.',
  },
  {
    titulo: 'Feito para o calor',
    texto:
      'Linho, viscose e algodão em primeiro lugar. Tecidos que respiram e sobrevivem a 38 graus no Cariri.',
  },
  {
    titulo: 'Encomenda com nome',
    texto:
      'Numeração esgotada não é fim de conversa: costuramos sob medida em até 10 dias úteis.',
  },
]

export function BlocosSobre() {
  return (
    <section className="shell" style={{ paddingTop: 64 }}>
      {/* O fio de 1px vai na célula, nunca como fundo do container (handoff §5.1) */}
      <ul
        className="grid gap-px"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))' }}
      >
        {BLOCOS.map((b) => (
          <li key={b.titulo} className="oz-hairline-cell" style={{ padding: '34px 28px' }}>
            <h2
              className="font-display"
              style={{ fontSize: 24, fontWeight: 400, lineHeight: 1.2, marginBottom: 12 }}
            >
              {b.titulo}
            </h2>
            <p className="text-pretty" style={{ fontSize: 14, lineHeight: 1.7, color: '#5C574D' }}>
              {b.texto}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
