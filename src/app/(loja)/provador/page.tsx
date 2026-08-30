import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { dataCurta } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Minhas provas',
  description: 'As peças que você provou virtualmente na Ozzi.',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

interface Item {
  id: string
  criado_em: string
  imagem_gerada: string | null
  products: { nome: string; slug: string } | null
}

export default async function ProvadorPage() {
  const supabase = await createClient()
  const jar = await cookies()
  const visitante = jar.get('ozzi_visitante')?.value ?? null

  const { data: clienteId } = await supabase.rpc('my_customer_id')
  const customerId = (clienteId as unknown as string | null) ?? null

  let itens: Item[] = []
  let indisponivel = false

  try {
    const admin = createAdminClient()
    let consulta = admin
      .from('provas')
      .select('id, criado_em, imagem_gerada, products(nome, slug)')
      .eq('status', 'pronta')
      .order('criado_em', { ascending: false })
      .limit(60)

    if (customerId) consulta = consulta.eq('customer_id', customerId)
    else if (visitante) consulta = consulta.eq('visitante_id', visitante)
    else consulta = consulta.eq('id', '00000000-0000-0000-0000-000000000000')

    const { data } = await consulta
    const linhas = (data ?? []) as unknown as Item[]

    // As imagens moram em bucket privado: cada uma vira um link assinado curto.
    itens = await Promise.all(
      linhas.map(async (linha) => {
        if (!linha.imagem_gerada) return linha
        const { data: url } = await admin.storage.from('provas').createSignedUrl(linha.imagem_gerada, 60 * 60)
        return { ...linha, imagem_gerada: url?.signedUrl ?? null }
      }),
    )
  } catch {
    // Sem a chave de servidor configurada, a galeria não tem como ler o bucket.
    indisponivel = true
  }

  return (
    <div className="shell-narrow py-11 pb-24">
      <h1 className="font-display" style={{ fontSize: 'clamp(34px,4vw,46px)', fontWeight: 300, lineHeight: 1.05 }}>
        Minhas provas
      </h1>
      <p className="mt-4 max-w-[520px]" style={{ fontSize: 15.5, lineHeight: 1.72, color: '#5C574D' }}>
        As imagens que você gerou provando as peças. Elas ficam guardadas em área
        privada — só você vê, por um link que expira.
      </p>

      {indisponivel ? (
        <p className="mt-10" style={{ fontSize: 13.5, color: '#8A8375' }}>
          O provador está em configuração. Volte em breve.
        </p>
      ) : itens.length === 0 ? (
        <div className="mt-10 flex flex-col items-start gap-5">
          <p style={{ fontSize: 13.5, color: '#8A8375' }}>
            Você ainda não provou nenhuma peça. Escolha uma e use o &quot;Provar em mim&quot; na página dela.
          </p>
          <Link href="/novidades" className="oz-btn oz-btn-outline">
            Ver novidades
          </Link>
        </div>
      ) : (
        <ul
          className="mt-10 grid gap-[22px_16px]"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}
        >
          {itens.map((item) => (
            <li key={item.id}>
              {item.imagem_gerada && (
                <Image
                  src={item.imagem_gerada}
                  alt={`Você vestindo ${item.products?.nome ?? 'a peça'}`}
                  width={520}
                  height={690}
                  unoptimized
                  style={{ width: '100%', height: 'auto', background: '#E9E3D9' }}
                />
              )}
              <div className="flex flex-col gap-[4px] pt-[12px]">
                {item.products ? (
                  <Link href={`/produto/${item.products.slug}`} style={{ fontSize: 14.5 }}>
                    {item.products.nome}
                  </Link>
                ) : (
                  <span style={{ fontSize: 14.5, color: '#8A8375' }}>Peça removida</span>
                )}
                <span style={{ fontSize: 11.5, color: '#8A8375' }}>{dataCurta(item.criado_em)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
