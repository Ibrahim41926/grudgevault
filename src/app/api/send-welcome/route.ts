import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getResend, FROM_EMAIL, APP_URL } from '@/lib/resend'
import { renderWelcomeEmail } from '@/emails/reminder-email'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  const userName = profile?.full_name || 'Archiviste'
  const userEmail = profile?.email || user.email

  if (!userEmail) {
    return NextResponse.json({ error: 'Email introuvable' }, { status: 400 })
  }

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: userEmail,
    subject: '🗡️ Bienvenue dans vos archives — GrudgeVault',
    html: renderWelcomeEmail({ userName, dashboardUrl: APP_URL }),
  })

  if (error) {
    console.error('Welcome email error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
