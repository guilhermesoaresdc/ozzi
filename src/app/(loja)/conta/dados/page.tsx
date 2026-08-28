import type { Metadata } from 'next'
import { Suspense } from 'react'
import { EsqueletoBloco, TituloConta } from '@/components/loja/conta/Estados'
import { FormDados } from '@/components/loja/conta/FormDados'
import { meuCadastro } from '@/components/loja/conta/consultas'

export const metadata: Metadata = {
  title: 'Meus dados',
  description: 'Seu nome, contato e documento na Ozzi — o que a gente usa para separar e entregar.',
}

async function Formulario() {
  const { profile, customer, email } = await meuCadastro()

  // O cadastro de cliente é o que os pedidos usam; o perfil é o acesso.
  // Quando os dois existem, o do cliente é o mais recente.
  return (
    <FormDados
      temCadastro={Boolean(customer)}
      inicial={{
        nome: customer?.nome ?? profile?.nome ?? '',
        email,
        telefone: customer?.telefone ?? profile?.telefone ?? '',
        cpf: customer?.cpf ?? profile?.cpf ?? '',
        cidade: customer?.cidade ?? profile?.cidade ?? '',
        uf: customer?.uf ?? profile?.uf ?? '',
      }}
    />
  )
}

export default function MeusDadosPage() {
  return (
    <>
      <TituloConta apoio="É com esses dados que a gente separa o pedido, chama no WhatsApp e emite a nota.">
        Meus dados
      </TituloConta>
      <Suspense fallback={<EsqueletoBloco altura={420} />}>
        <Formulario />
      </Suspense>
    </>
  )
}
