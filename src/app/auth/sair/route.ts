import { NextResponse, type NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/** Sair da conta. Só POST — encerrar sessão por link visitado seria frágil. */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  // O cabeçalho muda de "Conta" conforme a sessão.
  revalidatePath('/', 'layout')

  // 303 para o navegador seguir com GET depois do POST.
  return NextResponse.redirect(new URL('/', request.url), { status: 303 })
}
