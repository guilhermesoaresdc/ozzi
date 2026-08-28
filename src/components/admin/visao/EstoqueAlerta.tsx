import { Card } from '@/components/admin/Card'
import { Placeholder } from '@/components/ui/Placeholder'
import { corEstoque } from '@/lib/status'
import { num } from '@/lib/format'
import { LinhaLink } from '@/components/admin/visao/LinhaLink'
import { EstadoVazio } from '@/components/admin/visao/EstadoVazio'
import type { ResumoEstoque, VisaoGeral } from '@/lib/admin-queries'
import type { Json } from '@/lib/database.types'

function primeiraFoto(fotos: Json): string | null {
  if (!Array.isArray(fotos)) return null
  const foto = fotos[0]
  return typeof foto === 'string' && foto ? foto : null
}

/** "todas esgotadas", "P, M esgotados" ou "grade completa". */
function numeracoes(resumo: ResumoEstoque): string {
  if (resumo.total === 0) return 'todas as numerações esgotadas'
  if (resumo.esgotadas.length === 0) return 'grade completa'
  return `${resumo.esgotadas.join(', ')} ${resumo.esgotadas.length === 1 ? 'esgotado' : 'esgotados'}`
}

export function EstoqueAlerta({ itens }: { itens: VisaoGeral['alertaEstoque'] }) {
  return (
    <Card titulo="Estoque em alerta" semPadding>
      {itens.length === 0 ? (
        <EstadoVazio texto="Nenhuma peça no vermelho — a grade das peças ativas está em dia." />
      ) : (
        <div className="flex flex-col">
          {itens.map(({ produto, resumo }, i) => (
            <LinhaLink
              key={produto.id}
              href={`/admin/produtos/${produto.id}/editar`}
              py={12}
              ultima={i === itens.length - 1}
            >
              <Placeholder
                className="w-[38px] shrink-0"
                densidade="mini"
                ratio="3/4"
                src={primeiraFoto(produto.fotos)}
                alt=""
                sizes="38px"
              />
              <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                <span style={{ fontSize: 13.5 }}>{produto.nome}</span>
                <span style={{ fontSize: 11.5, color: '#8A8375' }}>
                  {produto.ref} · {numeracoes(resumo)}
                </span>
              </span>
              <span
                className="whitespace-nowrap uppercase"
                style={{ fontSize: 12, letterSpacing: '.1em', color: corEstoque(resumo.total) }}
              >
                {resumo.total === 0 ? 'Esgotado' : `${num(resumo.total)} un`}
              </span>
            </LinhaLink>
          ))}
        </div>
      )}
    </Card>
  )
}
