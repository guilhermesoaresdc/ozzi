/** Conteúdo fixo do handoff §5.1. */
const BENEFICIOS = [
  {
    numero: 'I',
    titulo: 'Pronta entrega',
    texto: 'Tudo que aparece no site está no estoque da loja e sai para postagem no mesmo dia.',
  },
  {
    numero: 'II',
    titulo: 'Retire no centro',
    texto: 'Combine a retirada no Centro de Várzea Alegre em até 2 horas, sem custo.',
  },
  {
    numero: 'III',
    titulo: 'À vista com desconto',
    texto: '10% off à vista no PIX ou dinheiro, ou até 2x sem juros no cartão.',
  },
  {
    numero: 'IV',
    titulo: 'Troca sem dor',
    texto: 'Sete dias para trocar numeração, presencialmente ou pelos Correios.',
  },
]

export function Beneficios() {
  return (
    <section className="shell" style={{ paddingTop: 76, paddingBottom: 92 }}>
      {/* O fio de 1px é box-shadow na célula, nunca fundo no container (handoff §5.1) */}
      <ul
        className="grid gap-px"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))' }}
      >
        {BENEFICIOS.map((b) => (
          <li key={b.numero} className="oz-hairline-cell" style={{ padding: '30px 24px' }}>
            <span className="font-display" style={{ fontSize: 14, letterSpacing: '.2em', color: '#8A6A4F' }}>
              {b.numero}
            </span>
            <h3
              className="uppercase"
              style={{ fontSize: 13, letterSpacing: '.08em', fontWeight: 500, margin: '13px 0 8px' }}
            >
              {b.titulo}
            </h3>
            <p className="text-pretty" style={{ fontSize: 13.5, lineHeight: 1.65, color: '#5C574D' }}>
              {b.texto}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
