import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { SUPABASE_URL } from '@/lib/supabase/config'

/**
 * Cliente com service role — ignora RLS.
 * Use somente em server actions / route handlers e SEMPRE depois de
 * confirmar o papel de quem chama com `requireAdmin()`.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada')

  return createSupabaseClient<Database>(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
