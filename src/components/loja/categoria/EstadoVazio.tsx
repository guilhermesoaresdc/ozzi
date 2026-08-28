/**
 * Estado vazio na linguagem da casa (handoff §7): fundo #FAF7F2, fio #DFD8CB,
 * texto de apoio #8A8375. Serve para categoria sem peça e para filtro sem
 * resultado.
 */
export function EstadoVazio({
  chapeu,
  titulo,
  texto,
  children,
}: {
  chapeu?: string
  titulo: string
  texto: string
  children?: React.ReactNode
}) {
  return (
    <div
      className="oz-card flex flex-col items-center text-center"
      style={{ padding: '56px 28px', gap: 12 }}
    >
      {chapeu && <span className="oz-label">{chapeu}</span>}
      <h2
        className="font-display"
        style={{ fontSize: 26, fontWeight: 300, lineHeight: 1.15, textWrap: 'balance' }}
      >
        {titulo}
      </h2>
      <p
        className="text-body"
        style={{ fontSize: 13.5, lineHeight: 1.7, maxWidth: 430, textWrap: 'pretty' }}
      >
        {texto}
      </p>
      {children && <div className="flex flex-wrap justify-center gap-3 pt-2">{children}</div>}
    </div>
  )
}
