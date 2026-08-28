import type { Metadata } from 'next'
import Link from 'next/link'
import { linkWhatsapp, Painel, ProximosPassos, TituloConta } from '@/components/loja/conta/Estados'

export const metadata: Metadata = {
  title: 'Favoritos',
  description: 'Os favoritos da sua conta Ozzi ainda estão em construção.',
}

const HREF = linkWhatsapp(
  'Oi! Queria guardar uma peça do site para comprar depois. Podem separar para mim?',
)

export default function FavoritosPage() {
  return (
    <>
      <TituloConta>Favoritos</TituloConta>

      <Painel
        chapeu="Ainda não disponível"
        titulo="Os favoritos ainda não estão de pé"
        texto="Preferimos dizer isso do que mostrar uma lista vazia fingindo que funciona. Por enquanto, quem guarda peça para você é a gente: mande o nome no WhatsApp e a peça fica separada."
      >
        <Link href="/novidades" className="oz-btn oz-btn-primary">
          Ver novidades
        </Link>
        <a href={HREF} target="_blank" rel="noopener noreferrer" className="oz-btn oz-btn-tertiary">
          Guardar uma peça no WhatsApp
        </a>
      </Painel>

      <ProximosPassos
        titulo="O que vem por aqui"
        itens={[
          'Salvar a peça direto do cartão da vitrine, sem sair da navegação.',
          'Aviso no WhatsApp quando a sua numeração favorita voltar ao estoque.',
          'A lista de favoritos vira sacola em um clique, na hora de fechar.',
        ]}
      />
    </>
  )
}
