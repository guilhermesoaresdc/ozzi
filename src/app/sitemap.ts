import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/supabase/config'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const [{ data: categorias }, { data: produtos }] = await Promise.all([
    supabase.from('categories').select('slug').eq('ativo', true).order('ordem'),
    supabase.from('products').select('slug, criado_em').eq('status', 'ativo'),
  ])

  const fixas: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/novidades`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/sobre`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/sob-encomenda`, changeFrequency: 'weekly', priority: 0.5 },
    ...['trocas', 'prazos', 'medidas', 'pagamento'].map((t) => ({
      url: `${SITE_URL}/ajuda/${t}`,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
  ]

  return [
    ...fixas,
    ...(categorias ?? []).map((c) => ({
      url: `${SITE_URL}/${c.slug}`,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...(produtos ?? []).map((p) => ({
      url: `${SITE_URL}/produto/${p.slug}`,
      lastModified: new Date(p.criado_em),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]
}
