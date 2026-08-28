import { Card } from '@/components/admin/Card'
import { num } from '@/lib/format'
import { LinhaLink } from '@/components/admin/visao/LinhaLink'
import { EstadoVazio } from '@/components/admin/visao/EstadoVazio'
import type { VisaoGeral } from '@/lib/admin-queries'

export function PrecisaDeVoce({ itens }: { itens: VisaoGeral['precisaDeVoce'] }) {
  return (
    <Card titulo="Precisa de você" semPadding>
      {itens.length === 0 ? (
        <EstadoVazio texto="Nada pendente por aqui." />
      ) : (
        <div className="flex flex-col">
          {itens.map((item, i) => (
            <LinhaLink key={item.rotulo} href={item.href} py={16} ultima={i === itens.length - 1}>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span style={{ fontSize: 13.5 }}>{item.rotulo}</span>
                <span style={{ fontSize: 11.5, color: '#8A8375' }}>{item.detalhe}</span>
              </span>
              <span className="font-display" style={{ fontSize: 24, color: '#8A6A4F', lineHeight: 1 }}>
                {num(item.contagem)}
              </span>
            </LinhaLink>
          ))}
        </div>
      )}
    </Card>
  )
}
