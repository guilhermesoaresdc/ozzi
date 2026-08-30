import Link from 'next/link'
import { getSettings } from '@/lib/queries'
import { Logo } from '@/components/ui/Logo'

const COLUNAS = [
  {
    titulo: 'Comprar',
    links: [
      { label: 'Novidades', href: '/novidades' },
      { label: 'Vestidos', href: '/vestidos' },
      { label: 'Conjuntos', href: '/conjuntos' },
      { label: 'Acessórios', href: '/acessorios' },
      { label: 'Sob encomenda', href: '/sob-encomenda' },
    ],
  },
  {
    titulo: 'Ajuda',
    links: [
      { label: 'Trocas e devoluções', href: '/ajuda/trocas' },
      { label: 'Prazos de entrega', href: '/ajuda/prazos' },
      { label: 'Tabela de medidas', href: '/ajuda/medidas' },
      { label: 'Consultoria de cor', href: '/consultor' },
      { label: 'Formas de pagamento', href: '/ajuda/pagamento' },
    ],
  },
  {
    titulo: 'Ozzi',
    links: [
      { label: 'Sobre nós', href: '/sobre' },
      { label: 'Clube Ozzi', href: '/entrar' },
      { label: 'Trabalhe com a gente', href: '/sobre#contato' },
      { label: 'Instagram', href: 'https://instagram.com/ozzimodafeminina' },
    ],
  },
]

export async function Footer() {
  const s = await getSettings()

  return (
    <footer className="mt-auto" style={{ background: '#232320', color: '#F2EEE7' }}>
      <div
        className="mx-auto grid w-full gap-10 px-7 pt-[60px] pb-[30px]"
        style={{ maxWidth: 1340, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
      >
        <div className="flex flex-col gap-5">
          <Logo invertida />
          <p style={{ color: '#8F8A7E', fontSize: 13.5, lineHeight: 1.7 }}>
            {s.localizacao}
            <br />
            Atendimento online e entrega local
          </p>
        </div>

        {COLUNAS.map((col) => (
          <nav key={col.titulo} aria-label={col.titulo}>
            <h2
              className="uppercase"
              style={{ fontSize: 10.5, letterSpacing: '.18em', fontWeight: 500, color: '#C4A88B' }}
            >
              {col.titulo}
            </h2>
            <ul className="mt-[18px] flex flex-col gap-[10px]">
              {col.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    className="transition-colors hover:!text-[#F2EEE7]"
                    style={{ fontSize: 13.5, color: '#B3ADA0' }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div
        className="mx-auto flex w-full flex-wrap justify-between gap-x-8 gap-y-2 px-7 pt-[22px] pb-10"
        style={{ maxWidth: 1340, borderTop: '1px solid #3A3730', fontSize: 11.5, color: '#8F8A7E' }}
      >
        <span>
          © {new Date().getFullYear()} {s.nome_loja} · CNPJ {s.cnpj}
        </span>
        <span>PIX · Cartão em até {s.parcelas_max}x · Retirada combinada · Correios</span>
      </div>
    </footer>
  )
}
