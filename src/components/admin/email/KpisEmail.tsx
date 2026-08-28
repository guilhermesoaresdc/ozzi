import { Kpi } from '@/components/admin/Card'
import type { CampanhaComLista } from '@/lib/admin-queries'
import { brl, num, pct } from '@/lib/format'

/**
 * Os quatro KPIs do handoff §6.7, todos com fonte no banco. "Contatos ativos"
 * conta os cadastros com opt-in; as médias saem só das campanhas que já têm
 * número medido.
 */
export function KpisEmail({
  contatos,
  cadastros,
  abertura,
  cliques,
  receita,
  campanhas,
}: {
  contatos: number
  cadastros: number
  abertura: number
  cliques: number
  receita: number
  campanhas: CampanhaComLista[]
}) {
  const medidas = campanhas.filter((c) => c.aberturas !== null)
  const semOptIn = cadastros - contatos
  const maiorClique = medidas.reduce((maior, c) => Math.max(maior, Number(c.cliques ?? 0)), 0)
  const comReceita = campanhas.filter((c) => Number(c.receita ?? 0) > 0).length

  const plural = (n: number, um: string, muitos: string) => `${n} ${n === 1 ? um : muitos}`

  return (
    <div className="grid gap-px" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
      <Kpi
        label="Contatos ativos"
        valor={num(contatos)}
        tendencia={
          semOptIn === 0
            ? `todos os ${plural(cadastros, 'cadastro aceita', 'cadastros aceitam')} e-mail`
            : `${plural(semOptIn, 'cadastro', 'cadastros')} sem opt-in`
        }
      />
      <Kpi
        label="Abertura média"
        valor={medidas.length === 0 ? '—' : pct(abertura, 0)}
        tendencia={
          medidas.length === 0
            ? 'nenhum envio medido ainda'
            : `média de ${plural(medidas.length, 'campanha medida', 'campanhas medidas')}`
        }
      />
      <Kpi
        label="Cliques"
        valor={medidas.length === 0 ? '—' : pct(cliques, 1)}
        tendencia={maiorClique > 0 ? `melhor envio: ${pct(maiorClique, 0)}` : 'nenhum clique registrado'}
      />
      <Kpi
        label="Receita por e-mail"
        valor={brl(receita)}
        tendencia={
          comReceita === 0
            ? 'nenhuma campanha gerou receita ainda'
            : `${plural(comReceita, 'campanha gerou', 'campanhas geraram')} receita`
        }
        cor={comReceita > 0 ? '#5C7A5E' : '#5C574D'}
      />
    </div>
  )
}
