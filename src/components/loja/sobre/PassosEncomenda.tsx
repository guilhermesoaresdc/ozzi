/** Como funciona a encomenda — mesma célula com fio de 1px dos benefícios da home. */
const PASSOS = [
  {
    numero: 'I',
    titulo: 'Escolha a peça',
    texto:
      'As peças desta página estão com a grade esgotada, mas continuam à venda: cor e numeração são combinadas com você.',
  },
  {
    numero: 'II',
    titulo: 'Chame a gente',
    texto:
      'Fale no WhatsApp com o nome da peça e a sua numeração. A vendedora confirma tecido, cor e prazo antes de fechar.',
  },
  {
    numero: 'III',
    titulo: 'Dez dias úteis',
    texto:
      'A peça é costurada sob medida e entregue em até 10 dias úteis, com prova de ajuste combinada para quem retira aqui na cidade.',
  },
]

export function PassosEncomenda() {
  return (
    <ul
      className="grid gap-px"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))' }}
    >
      {PASSOS.map((p) => (
        <li key={p.numero} className="oz-hairline-cell" style={{ padding: '30px 24px' }}>
          <span className="font-display" style={{ fontSize: 14, letterSpacing: '.2em', color: '#8A6A4F' }}>
            {p.numero}
          </span>
          <h3
            className="uppercase"
            style={{ fontSize: 13, letterSpacing: '.08em', fontWeight: 500, margin: '13px 0 8px' }}
          >
            {p.titulo}
          </h3>
          <p className="text-pretty" style={{ fontSize: 13.5, lineHeight: 1.65, color: '#5C574D' }}>
            {p.texto}
          </p>
        </li>
      ))}
    </ul>
  )
}
