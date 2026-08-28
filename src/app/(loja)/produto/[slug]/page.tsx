import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Galeria } from '@/components/loja/produto/Galeria'
import { PainelCompra } from '@/components/loja/produto/PainelCompra'
import { CombinaCom, CombinaComSkeleton } from '@/components/loja/produto/CombinaCom'
import { montarGrade, selecaoInicial, tamanhoUnico } from '@/components/loja/produto/grade'
import type { ItemAcordeao } from '@/components/loja/produto/Acordeao'
import { getProduto, getSettings } from '@/lib/queries'
import { brl, num, pct } from '@/lib/format'
import { precoPix, valorParcela } from '@/lib/pricing'
import { WHATSAPP } from '@/lib/supabase/config'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const produto = await getProduto(slug)
  if (!produto) return { title: 'Peça não encontrada' }

  const disponibilidade = produto.prontaEntrega ? 'Pronta entrega' : 'Sob encomenda'
  const descricao =
    produto.descricao ??
    `${produto.nome} em ${produto.tecido ?? 'tecido selecionado'}. ${disponibilidade} na Ozzi, em Várzea Alegre - CE.`
  const resumo = `${descricao} ${brl(produto.preco)} · ${disponibilidade}.`
  const url = `/produto/${produto.slug}`

  return {
    title: produto.nome,
    description: resumo,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      url,
      siteName: 'Ozzi Moda Feminina',
      title: `${produto.nome} · Ref. ${produto.ref}`,
      description: resumo,
      images: produto.fotos[0] ? [{ url: produto.fotos[0], alt: produto.nome }] : undefined,
    },
  }
}

export default async function ProdutoPage({ params }: Props) {
  const { slug } = await params
  const [produto, config] = await Promise.all([getProduto(slug), getSettings()])
  if (!produto) notFound()

  const taxaPix = Number(config.desconto_pix)
  const parcelas = Number(config.parcelas_max)
  const freteGratis = Number(config.frete_gratis_acima)

  const grade = montarGrade(produto.variantes)
  const inicial = selecaoInicial(grade)

  const chapeu = produto.prontaEntrega
    ? 'Pronta entrega'
    : produto.aceitaEncomenda
      ? 'Sob encomenda'
      : 'Indisponível'

  // Os dois primeiros itens vêm do cadastro; os dois últimos são texto da loja.
  const itensAcordeao: ItemAcordeao[] = [
    { titulo: 'Descrição', corpo: produto.descricao ?? '' },
    { titulo: 'Medidas e numeração', corpo: produto.medidas ?? '' },
    {
      titulo: 'Sob encomenda',
      corpo: produto.aceitaEncomenda
        ? `Numeração ou cor esgotada? Costuramos e entregamos em até ${produto.prazoEncomendaDias} dias úteis, com uma prova de ajuste combinada para quem retira aqui na cidade.`
        : '',
    },
    {
      titulo: 'Envio e retirada',
      corpo: `Retirada grátis combinada no Centro de Várzea Alegre em até 2 horas. Motoboy local no mesmo dia. Correios para todo o Brasil, grátis acima de R$ ${num(freteGratis)}.`,
    },
  ].filter((i) => i.corpo !== '')

  const mensagem = `Olá! Tenho uma dúvida sobre a peça ${produto.nome} (Ref. ${produto.ref}).`
  const hrefWhatsapp = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`

  return (
    <div className="shell" style={{ paddingTop: 24, paddingBottom: 92 }}>
      <nav
        aria-label="Trilha de navegação"
        className="uppercase"
        style={{ fontSize: 11, letterSpacing: '.1em', color: '#8A8375', marginBottom: 24 }}
      >
        <Link href="/">Início</Link>
        {' / '}
        {produto.categoriaSlug && produto.categoriaNome && (
          <>
            <Link href={`/${produto.categoriaSlug}`}>{produto.categoriaNome}</Link>
            {' / '}
          </>
        )}
        <span aria-current="page">{produto.nome}</span>
      </nav>

      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
          gap: 'clamp(28px, 4vw, 60px)',
          alignItems: 'start',
        }}
      >
        <Galeria nome={produto.nome} fotos={produto.fotos} />

        <PainelCompra
          produto={{
            id: produto.id,
            slug: produto.slug,
            nome: produto.nome,
            ref: produto.ref,
            tecido: produto.tecido,
            preco: produto.preco,
            precoComparativo: produto.precoComparativo,
            foto: produto.foto,
            aceitaEncomenda: produto.aceitaEncomenda,
            prazoEncomendaDias: produto.prazoEncomendaDias,
          }}
          grade={grade}
          inicial={inicial}
          chapeu={chapeu}
          precoNoPix={precoPix(produto.preco, taxaPix)}
          rotuloDescontoPix={pct(taxaPix * 100)}
          parcelas={parcelas}
          parcela={valorParcela(produto.preco, parcelas)}
          hrefWhatsapp={hrefWhatsapp}
          itensAcordeao={itensAcordeao}
          mostrarTamanhos={!tamanhoUnico(grade)}
        />
      </div>

      <Suspense fallback={<CombinaComSkeleton />}>
        <CombinaCom categoriaId={produto.categoriaId} excluirId={produto.id} limite={4} />
      </Suspense>
    </div>
  )
}
