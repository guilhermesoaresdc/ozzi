import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase/config'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  if (path.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/entrar'
      url.searchParams.set('proximo', path)
      return NextResponse.redirect(url)
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  if (path.startsWith('/conta') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/entrar'
    url.searchParams.set('proximo', path)
    return NextResponse.redirect(url)
  }

  return response
}
