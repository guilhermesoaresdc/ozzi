import type { Metadata } from 'next'
import Link from 'next/link'
import { linkWhatsapp, Painel, ProximosPassos, TituloConta } from '@/components/loja/conta/Estados'

export const metadata: Metadata = {
  title: 'Trocas e devoluções',
  description: 'Como funcionam as trocas e devoluções na Ozzi enquanto o pedido de troca não fica pronto.',
}

const HREF = linkWhatsapp(
  'Oi! Queria trocar uma peça de um pedido que fiz no site da Ozzi. Podem me ajudar?',
)

export default function TrocasPage() {
  return (
    <>
      <TituloConta>Trocas e devoluções</TituloConta>

      <Painel
        chapeu="Ainda não disponível"
        titulo="A troca ainda é combinada com a gente"
        texto="O pedido de troca pelo site está em construção. Hoje cada troca é resolvida no WhatsApp, uma a uma: você chama com o código do pedido, a gente confere a peça e combina a numeração nova ou a devolução."
      >
        <a href={HREF} target="_blank" rel="noopener noreferrer" className="oz-btn oz-btn-primary">
          Falar sobre uma troca
        </a>
        <Link href="/conta/pedidos" className="oz-btn oz-btn-tertiary">
          Ver meus pedidos
        </Link>
      </Painel>

      <ProximosPassos
        titulo="O que vem por aqui"
        itens={[
          'Abrir o pedido de troca a partir do próprio pedido, com a peça já preenchida.',
          'Etiqueta de devolução dos Correios para imprimir, quando o envio for por lá.',
          'A troca aparecendo na mesma linha do tempo do pedido, etapa por etapa.',
        ]}
      />
    </>
  )
}
