/** Estado honesto de lista vazia, na linguagem do handoff §7. */
export function EstadoVazio({ texto }: { texto: string }) {
  return (
    <p className="px-[22px] py-[26px]" style={{ fontSize: 13, color: '#8A8375' }}>
      {texto}
    </p>
  )
}
