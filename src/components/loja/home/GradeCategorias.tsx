import Link from 'next/link'
import { Placeholder } from '@/components/ui/Placeholder'
import { SectionHeader } from '@/components/loja/SectionHeader'
import { EstadoVazio } from '@/components/loja/home/EstadoVazio'
import { getCategoriesWithCounts } from '@/lib/queries'

export async function GradeCategorias() {
  const categorias = await getCategoriesWithCounts()

  return (
    <section className="shell" style={{ paddingTop: 60 }}>
      <div style={{ marginBottom: 26 }}>
        <SectionHeader titulo="Categorias" link="/novidades" linkLabel="Ver tudo" />
      </div>

      {categorias.length === 0 ? (
        <EstadoVazio
          titulo="As categorias estão sendo montadas"
          texto="Assim que a vitrine for organizada, elas aparecem aqui. O catálogo completo continua no ar."
          acao={{ href: '/novidades', label: 'Ver todos os produtos' }}
        />
      ) : (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 210px), 1fr))' }}
        >
          {categorias.map((c) => (
            <Link
              key={c.id}
              href={`/${c.slug}`}
              className="group block"
              aria-label={`${c.nome} · ${c.contagem} ${c.contagem === 1 ? 'peça' : 'peças'}`}
            >
              <Placeholder
                label={`${c.nome.toLowerCase()} · 520×690`}
                src={c.imagem_banner}
                alt={c.nome}
                ratio="3/4"
                densidade="denso"
                sizes="(max-width: 640px) 50vw, (max-width: 1100px) 25vw, 210px"
                className="transition-[filter] group-hover:brightness-[.965]"
              />
              <div
                className="flex items-baseline justify-between gap-[10px]"
                style={{ padding: '12px 2px 0' }}
              >
                <span className="font-display" style={{ fontSize: 22 }}>
                  {c.nome}
                </span>
                <span style={{ fontSize: 10.5, letterSpacing: '.1em', color: '#8A8375' }}>
                  {c.contagem}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
