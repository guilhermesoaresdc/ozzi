/**
 * Linha selecionável de entrega e de pagamento (handoff §5.5 e §5.6).
 * O rádio fica oculto para leitores de tela continuarem enxergando o grupo;
 * o foco aparece no contorno da própria linha.
 */
export function OpcaoRadio({
  nome,
  valor,
  marcado,
  aoMarcar,
  fundoMarcado,
  padding,
  children,
}: {
  nome: string
  valor: string
  marcado: boolean
  aoMarcar: (valor: string) => void
  /** #E9E3D9 na entrega, #FAF7F2 no pagamento. */
  fundoMarcado: string
  padding: string
  children: React.ReactNode
}) {
  return (
    <label
      className="block cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink"
      style={{
        padding,
        background: marcado ? fundoMarcado : 'transparent',
        border: `1px solid ${marcado ? '#232320' : '#DFD8CB'}`,
      }}
    >
      <input
        type="radio"
        name={nome}
        value={valor}
        checked={marcado}
        onChange={() => aoMarcar(valor)}
        className="sr-only"
      />
      {children}
    </label>
  )
}
