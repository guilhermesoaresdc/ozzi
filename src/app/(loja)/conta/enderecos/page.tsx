import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { EsqueletoBloco, Painel, TituloConta } from '@/components/loja/conta/Estados'
import { FormEndereco } from '@/components/loja/conta/FormEndereco'
import { ListaEnderecos } from '@/components/loja/conta/ListaEnderecos'
import { meuCadastro, meusEnderecos } from '@/components/loja/conta/consultas'

export const metadata: Metadata = {
  title: 'Endereços',
  description: 'Os endereços de entrega salvos na sua conta Ozzi.',
}

async function Conteudo() {
  const [{ customer }, enderecos] = await Promise.all([meuCadastro(), meusEnderecos()])

  return (
    <div className="flex flex-col" style={{ gap: 26 }}>
      {enderecos.length > 0 ? (
        <ListaEnderecos enderecos={enderecos} />
      ) : customer ? (
        <Painel
          chapeu="Nenhum endereço salvo"
          titulo="Você ainda não guardou um endereço"
          texto="Salve aqui os endereços que você mais usa. O primeiro entra como padrão, e é ele que a gente confere quando o pedido sai por motoboy ou Correios."
        />
      ) : (
        <Painel
          chapeu="Endereços"
          titulo="Seu cadastro começa no primeiro pedido"
          texto="É no checkout que a gente cria o seu cadastro de cliente — e é a ele que os endereços ficam ligados. Depois da primeira compra, você guarda quantos quiser por aqui."
        >
          <Link href="/novidades" className="oz-btn oz-btn-primary">
            Ver novidades
          </Link>
        </Painel>
      )}

      <FormEndereco podeSalvar={Boolean(customer)} />
    </div>
  )
}

export default function EnderecosPage() {
  return (
    <>
      <TituloConta apoio="Onde a gente entrega quando o pedido não é retirada no Centro.">
        Endereços
      </TituloConta>
      <Suspense fallback={<EsqueletoBloco altura={380} />}>
        <Conteudo />
      </Suspense>
    </>
  )
}
