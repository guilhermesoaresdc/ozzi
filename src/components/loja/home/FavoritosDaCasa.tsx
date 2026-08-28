import { SectionHeader } from '@/components/loja/SectionHeader'
import { GradeProdutos } from '@/components/loja/home/GradeProdutos'
import { getDestaques, getSettings } from '@/lib/queries'

export async function FavoritosDaCasa() {
  const [destaques, config] = await Promise.all([getDestaques(4), getSettings()])

  return (
    <section className="shell" style={{ paddingTop: 76 }}>
      <div style={{ marginBottom: 26 }}>
        <SectionHeader
          chapeu="Pronta entrega"
          titulo="Favoritos da casa"
          link="/novidades"
          linkLabel="Todos os produtos"
        />
      </div>

      <GradeProdutos
        produtos={destaques}
        parcelas={config.parcelas_max}
        minimo={230}
        espacamento="22px 16px"
        sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 25vw"
        vazio={{
          titulo: 'Os favoritos voltam já',
          texto: 'Nenhuma peça está marcada como destaque no momento. O estoque completo continua disponível.',
          acao: { href: '/novidades', label: 'Ver todos os produtos' },
        }}
      />
    </section>
  )
}
