const BENEFICIOS = [
  {
    numeral: 'I',
    texto: 'Acesso antecipado às novidades, sempre na quinta antes de abrir para todos.',
  },
  {
    numeral: 'II',
    texto: 'Aviso no WhatsApp quando sua numeração favorita volta ao estoque.',
  },
  {
    numeral: 'III',
    texto: 'Cupom de aniversário de 15% para usar em qualquer compra no site.',
  },
]

/** Coluna direita da tela 5.7: o cartão do Clube Ozzi, com os três benefícios. */
export function ClubeOzzi() {
  return (
    <aside
      style={{
        background: '#FAF7F2',
        border: '1px solid #DFD8CB',
        padding: 'clamp(28px, 3vw, 40px)',
      }}
    >
      <p className="oz-eyebrow">Clube Ozzi</p>

      <h2
        className="font-display"
        style={{ marginTop: 14, fontWeight: 300, fontSize: 32, lineHeight: 1.14, letterSpacing: '-.015em' }}
      >
        Quem é de casa
        <br />
        ganha primeiro
      </h2>

      <ol style={{ marginTop: 24 }}>
        {BENEFICIOS.map((beneficio, indice) => (
          <li
            key={beneficio.numeral}
            className="flex"
            style={{
              gap: 18,
              padding: '18px 0',
              borderBottom: indice < BENEFICIOS.length - 1 ? '1px solid #E4DDD1' : undefined,
            }}
          >
            <span
              className="font-display"
              style={{ minWidth: 30, fontSize: 20, lineHeight: 1.3, color: '#8A6A4F' }}
            >
              {beneficio.numeral}
            </span>
            <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#5C574D', textWrap: 'pretty' }}>
              {beneficio.texto}
            </p>
          </li>
        ))}
      </ol>
    </aside>
  )
}
