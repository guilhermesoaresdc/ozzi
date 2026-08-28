/**
 * Cartão de aviso na linguagem da casa (handoff §7): fundo #FAF7F2, fio
 * #DFD8CB, apoio #8A8375. Serve para lista vazia e para o 404.
 */
export function Aviso({
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
        className="font-display text-balance"
        style={{ fontSize: 26, fontWeight: 300, lineHeight: 1.15 }}
      >
        {titulo}
      </h2>
      <p
        className="text-pretty"
        style={{ fontSize: 13.5, lineHeight: 1.7, color: '#5C574D', maxWidth: 430 }}
      >
        {texto}
      </p>
      {children && <div className="flex flex-wrap justify-center gap-3 pt-2">{children}</div>}
    </div>
  )
}
