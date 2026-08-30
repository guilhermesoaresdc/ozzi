import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NavAjuda } from '@/components/loja/sobre/NavAjuda'
import { PaginaTexto, type SecaoTexto } from '@/components/loja/sobre/PaginaTexto'

interface Topico {
  titulo: string
  resumo: string
  descricao: string
  secoes: SecaoTexto[]
}

/** As quatro páginas de ajuda do rodapé. Conteúdo final (handoff §5.1, §5.5–5.6, §5.9). */
const AJUDA = {
  trocas: {
    titulo: 'Trocas e devoluções',
    resumo:
      'Sete dias para trocar numeração, presencialmente ou pelos Correios. Dentro do prazo, a troca é por nossa conta.',
    descricao:
      'Como trocar a numeração de uma peça da Ozzi: 7 dias de prazo, troca grátis, presencial no Centro de Várzea Alegre ou pelos Correios.',
    secoes: [
      {
        titulo: 'O prazo',
        paragrafos: [
          'Você tem 7 dias, contados da retirada ou da entrega, para pedir a troca de numeração ou devolver a peça.',
          'A peça precisa voltar sem uso, com a etiqueta presa e na embalagem em que chegou.',
        ],
      },
      {
        titulo: 'Como pedir',
        itens: [
          'Chame a loja no WhatsApp com o número do pedido — ele começa com OZ.',
          'Diga qual peça você quer trocar e qual numeração quer no lugar.',
          'A gente confirma se a numeração está no estoque; se não estiver, a troca vira encomenda e entra no prazo de 10 dias úteis.',
        ],
      },
      {
        titulo: 'Trocar em Várzea Alegre',
        paragrafos: [
          'A troca é combinada no Centro, no mesmo horário do atendimento. Levamos a numeração nova e voltamos com a peça trocada, sem custo.',
        ],
      },
      {
        titulo: 'Trocar pelos Correios',
        paragrafos: [
          'Fora da cidade, a peça volta pelos Correios e a primeira troca de numeração é por nossa conta. Assim que o pacote chega aqui, a peça nova é postada no mesmo dia.',
        ],
      },
      {
        titulo: 'Peça com defeito',
        paragrafos: [
          'Se a peça chegar com algum defeito, mande uma foto no WhatsApp assim que abrir o pacote. A gente resolve com outra peça igual ou com a devolução do valor pago.',
        ],
      },
    ],
  },

  prazos: {
    titulo: 'Prazos de entrega',
    resumo:
      'Tudo que está no site está no estoque da loja e sai para postagem no mesmo dia.',
    descricao:
      'Prazos da Ozzi: retirada grátis no Centro de Várzea Alegre em até 2 horas, motoboy local no mesmo dia e Correios para todo o Brasil, grátis acima de R$ 249.',
    secoes: [
      {
        titulo: 'Como e quando chega',
        tabela: {
          cabecalho: ['Forma', 'Prazo', 'Valor'],
          linhas: [
            ['Retirada no Centro', 'Em até 2 horas, a combinar', 'Grátis'],
            ['Entrega local · motoboy', 'Hoje até 18h · Várzea Alegre', 'R$ 12,00'],
            ['Correios · PAC', '5 a 9 dias úteis', 'Grátis acima de R$ 249'],
            ['Sob encomenda', 'Até 10 dias úteis', 'Conforme a peça'],
          ],
        },
      },
      {
        titulo: 'Retirada no Centro',
        paragrafos: [
          'Sem custo. Depois da confirmação do pagamento você combina o horário no WhatsApp e retira em até 2 horas, no Centro de Várzea Alegre. Não temos loja de rua: a retirada é sempre combinada.',
        ],
      },
      {
        titulo: 'Entrega local por motoboy',
        paragrafos: [
          'Em Várzea Alegre, R$ 12,00 e entrega no mesmo dia — os pedidos confirmados durante o expediente chegam até as 18h.',
        ],
      },
      {
        titulo: 'Correios para todo o Brasil',
        paragrafos: [
          'O PAC leva de 5 a 9 dias úteis, contados da postagem. Acima de R$ 249 o frete é grátis; abaixo disso o valor aparece no resumo do pedido, calculado pelo seu CEP.',
        ],
      },
      {
        titulo: 'Quando o pedido sai',
        paragrafos: [
          'Postamos no mesmo dia os pedidos confirmados dentro do atendimento: de segunda a sexta, das 8h às 18h, e no sábado até as 13h. O que entra depois disso sai no próximo dia útil.',
        ],
      },
      {
        titulo: 'Peça sob encomenda',
        paragrafos: [
          'Se a numeração estiver esgotada, a peça é costurada sob medida e entregue em até 10 dias úteis.',
        ],
      },
    ],
  },

  medidas: {
    titulo: 'Tabela de medidas',
    resumo:
      'A grade da Ozzi vai do P ao GG, e cada peça traz as medidas dela no próprio anúncio.',
    descricao:
      'A grade da Ozzi: P 36/38, M 40/42, G 44/46 e GG 48/50, com orientação de como medir busto, cintura e quadril.',
    secoes: [
      {
        titulo: 'A grade da casa',
        paragrafos: [
          'A referência é a numeração brasileira. Como a modelagem muda o caimento, cada anúncio traz as medidas exatas da peça em "Medidas e numeração".',
        ],
        tabela: {
          cabecalho: ['Tamanho', 'Numeração'],
          linhas: [
            ['P', '36 / 38'],
            ['M', '40 / 42'],
            ['G', '44 / 46'],
            ['GG', '48 / 50'],
            ['Único', 'Acessórios e peças sem grade'],
          ],
        },
      },
      {
        titulo: 'Como medir',
        paragrafos: [
          'Meça por cima de uma roupa leve, com a fita rente ao corpo e sem apertar.',
        ],
        itens: [
          'Busto: passe a fita na parte mais cheia, com os braços relaxados.',
          'Cintura: na parte mais fina do tronco, logo acima do umbigo.',
          'Quadril: na parte mais larga, com os pés juntos.',
        ],
      },
      {
        titulo: 'Na dúvida entre dois números',
        paragrafos: [
          'Cada peça passa pela prova antes de entrar no site, então a gente sabe como ela veste. Mande sua altura e suas medidas no WhatsApp que a vendedora diz qual numeração cai melhor.',
        ],
      },
      {
        titulo: 'Se a sua numeração acabou',
        paragrafos: [
          'Peças com a grade esgotada continuam à venda: costuramos sob medida em até 10 dias úteis.',
        ],
      },
    ],
  },

  pagamento: {
    titulo: 'Formas de pagamento',
    resumo: '10% de desconto à vista no PIX ou dinheiro, ou até 2x sem juros no cartão.',
    descricao:
      'Formas de pagamento da Ozzi: 10% de desconto à vista no PIX ou dinheiro, cartão em até 2x sem juros e fechamento pelo WhatsApp.',
    secoes: [
      {
        titulo: 'O que aceitamos',
        tabela: {
          cabecalho: ['Forma', 'Vantagem', 'Como funciona'],
          linhas: [
            ['PIX', '10% de desconto', 'QR Code na próxima tela · aprovação imediata'],
            ['Cartão de crédito', 'Até 2x sem juros', 'Visa, Master, Elo e Hipercard'],
            ['Combinar no WhatsApp', 'Atendimento humano', 'Uma vendedora finaliza o pedido com você'],
            ['Pagar na retirada', '10% de desconto', 'PIX ou dinheiro na hora de receber a peça'],
          ],
        },
      },
      {
        titulo: 'O desconto do PIX',
        paragrafos: [
          'Os 10% aparecem no resumo assim que você escolhe PIX ou pagamento na retirada, e incidem sobre o valor das peças, não sobre o frete. O código do PIX é gerado na tela seguinte à confirmação do pedido e a baixa é imediata.',
        ],
      },
      {
        titulo: 'Parcelamento no cartão',
        paragrafos: [
          'Até 2x sem juros. O valor de cada parcela aparece embaixo do preço, em toda a vitrine, e o pedido entra na separação assim que o pagamento é aprovado. No cartão não há o desconto à vista.',
        ],
      },
      {
        titulo: 'Pagar na retirada',
        paragrafos: [
          'Para quem retira no Centro de Várzea Alegre: a peça fica separada e o pagamento é feito na hora de receber, em PIX ou dinheiro. Como é à vista, o desconto de 10% vale aqui também.',
        ],
      },
      {
        titulo: 'Fechar pelo WhatsApp',
        paragrafos: [
          'Se preferir conversar, o pedido é criado como pendente e a conversa abre com o resumo da sacola. Ele entra na separação depois que o pagamento é combinado.',
        ],
      },
      {
        titulo: 'Frete grátis',
        paragrafos: [
          'Compras acima de R$ 249 têm frete grátis pelos Correios. A retirada no Centro é sempre grátis.',
        ],
      },
    ],
  },
} satisfies Record<string, Topico>

type SlugAjuda = keyof typeof AJUDA

const ORDEM: SlugAjuda[] = ['trocas', 'prazos', 'medidas', 'pagamento']

const TOPICOS = ORDEM.map((slug) => ({ slug, titulo: AJUDA[slug].titulo }))

type Props = { params: Promise<{ topico: string }> }

export function generateStaticParams() {
  return ORDEM.map((topico) => ({ topico }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topico } = await params
  const dados: Topico | undefined = AJUDA[topico as SlugAjuda]
  if (!dados) return { title: 'Página não encontrada' }

  return {
    title: dados.titulo,
    description: dados.descricao,
    alternates: { canonical: `/ajuda/${topico}` },
    openGraph: {
      type: 'article',
      url: `/ajuda/${topico}`,
      title: `${dados.titulo} · Ozzi`,
      description: dados.descricao,
    },
  }
}

export default async function AjudaPage({ params }: Props) {
  const { topico } = await params
  const dados: Topico | undefined = AJUDA[topico as SlugAjuda]
  if (!dados) notFound()

  return (
    <PaginaTexto chapeu="Ajuda" titulo={dados.titulo} resumo={dados.resumo} secoes={dados.secoes}>
      <NavAjuda atual={topico} topicos={TOPICOS} />
    </PaginaTexto>
  )
}
