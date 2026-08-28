/**
 * Configuração pública do Supabase.
 *
 * A chave publicável é feita para viajar no bundle do navegador — quem protege
 * os dados é o RLS, não o segredo da chave. Por isso ela tem um valor padrão
 * aqui: a aplicação sobe sem depender de configuração no painel da Vercel.
 * As variáveis de ambiente, quando presentes, continuam mandando.
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://haqcluuzsquoadbikubs.supabase.co'

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_wxwfUih0NHXJyfi9kxRR0w_W3UIe3Qp'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ozzi.vercel.app'

/** Número no formato internacional, sem símbolos — para os links de wa.me */
export const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? '5588999990000'
