import { Card } from '@/components/admin/Card'

export function CartaoEnderecos({
  enderecos,
}: {
  enderecos: { titulo: string; linhas: string[] }[]
}) {
  return (
    <Card>
      <h2 className="font-display" style={{ fontSize: 20, fontWeight: 400, marginBottom: 14 }}>
        Endereços
      </h2>

      {enderecos.length === 0 ? (
        <div style={{ fontSize: 13, lineHeight: 1.6 }}>
          <p style={{ color: '#5C574D' }}>Nenhum endereço salvo neste cadastro.</p>
          <p className="mt-[6px]" style={{ fontSize: 12, color: '#8A8375' }}>
            O endereço aparece aqui quando a cliente informa um no checkout de entrega.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-[14px]" style={{ fontSize: 13, lineHeight: 1.6 }}>
          {enderecos.map((endereco) => (
            <div key={endereco.titulo}>
              <p className="oz-label" style={{ marginBottom: 4 }}>
                {endereco.titulo}
              </p>
              {endereco.linhas.map((linha) => (
                <p key={linha} style={{ color: '#232320' }}>
                  {linha}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
