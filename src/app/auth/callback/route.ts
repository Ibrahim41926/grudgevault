import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Envoyer l'email de bienvenue pour les nouveaux inscrits
      // On vérifie si c'est une première connexion via la date de création
      if (data.user) {
        const createdAt = new Date(data.user.created_at)
        const now = new Date()
        const isNewUser = (now.getTime() - createdAt.getTime()) < 5 * 60 * 1000 // < 5 min

        if (isNewUser) {
          // Appel non bloquant — on ne fait pas échouer la redirection si l'email plante
          fetch(`${origin}/api/send-welcome`, {
            method: 'POST',
            headers: { Cookie: request.headers.get('cookie') || '' },
          }).catch(console.error)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`)
}
