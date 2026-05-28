import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getResend, FROM_EMAIL, APP_URL } from '@/lib/resend'
import { rewriteReminderMessageWithOpenAI } from '@/lib/reminder-rewrite'
import { renderReminderEmail } from '@/emails/reminder-email'
import { format, addDays, addWeeks, addMonths, addYears } from 'date-fns'
import { fr } from 'date-fns/locale'

// Sécurisation : seul Vercel Cron (ou un appel avec le bon secret) peut déclencher
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return true // Pas de secret configuré = dev local
  return authHeader === `Bearer ${cronSecret}`
}

function getNextTriggerDate(frequency: string, customDays?: number | null): Date {
  const now = new Date()
  switch (frequency) {
    case 'daily': return addDays(now, 1)
    case 'weekly': return addWeeks(now, 1)
    case 'monthly': return addMonths(now, 1)
    case 'yearly': return addYears(now, 1)
    case 'custom': return addDays(now, customDays ?? 7)
    default: return addDays(now, 1)
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Service role key pour bypass RLS côté serveur
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const now = new Date().toISOString()

  // Récupérer tous les rappels actifs arrivés à échéance
  const { data: reminders, error } = await supabase
    .from('reminders')
    .select(`
      *,
      grudge:grudges(id, title, description, first_name, last_name, incident_date)
    `)
    .eq('is_active', true)
    .lte('next_trigger_at', now)

  if (error) {
    console.error('Cron reminders error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!reminders || reminders.length === 0) {
    return NextResponse.json({ sent: 0, message: 'Aucun rappel à envoyer.' })
  }

  // Récupérer les profils séparément (reminders.user_id → auth.users, pas profiles)
  const userIds = [...new Set(reminders.map(r => r.user_id))]
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', userIds)
  const profileMap = new Map(profilesData?.map(p => [p.id, p]) ?? [])

  // Fallback : récupérer l'email depuis auth.users si absent dans profiles
  for (const userId of userIds) {
    const profile = profileMap.get(userId)
    if (!profile?.email) {
      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(userId)
      if (authUser?.email) {
        const existing = profile ?? { id: userId, full_name: null, email: null }
        profileMap.set(userId, { ...existing, email: authUser.email })
      }
    }
  }

  let sent = 0
  let errors = 0
  const results: string[] = []

  for (const reminder of reminders) {
    const profile = profileMap.get(reminder.user_id)
    const userEmail = profile?.email
    const userName = profile?.full_name || 'Archiviste'
    const grudge = reminder.grudge

    if (!userEmail || !grudge) {
      results.push(`[SKIP] Reminder ${reminder.id} — email ou rancune manquant`)
      continue
    }

    const traitorName = `${grudge.first_name} ${grudge.last_name || ''}`.trim()
    const incidentDate = format(new Date(grudge.incident_date), 'dd MMMM yyyy', { locale: fr })
    const grudgeDescription = grudge.description?.trim()
    const reminderMessageHint = reminder.message?.trim() || null
    const baseMessage = grudgeDescription || reminderMessageHint || `Rappelle-toi ce que ${traitorName} t'a fait.`
    let message = baseMessage

    try {
      message = await rewriteReminderMessageWithOpenAI({
        userId: reminder.user_id,
        reminderTitle: reminder.title,
        grudgeTitle: grudge.title,
        grudgeDescription: grudgeDescription || baseMessage,
        traitorName,
        incidentDate,
        originalMessage: baseMessage,
        reminderMessageHint,
      })
    } catch (openAIError) {
      console.warn(`OpenAI rewrite failed for reminder ${reminder.id}:`, openAIError)
    }

    // Envoyer l'email
    const { error: sendError } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: `🗡️ ${reminder.title}`,
      html: renderReminderEmail({
        userName,
        traitorName,
        grudgeTitle: grudge.title,
        message,
        incidentDate,
        dashboardUrl: APP_URL,
      }),
    })

    if (sendError) {
      console.error(`Email failed for reminder ${reminder.id}:`, sendError)
      errors++
      results.push(`[ERROR] Reminder ${reminder.id} — ${sendError.message}`)
      continue
    }

    sent++

    // Créer une notification interne
    await supabase.from('notifications').insert({
      user_id: reminder.user_id,
      grudge_id: grudge.id,
      reminder_id: reminder.id,
      title: reminder.title,
      message,
      type: 'reminder',
    })

    // Mettre à jour next_trigger_at ou désactiver si 'once'
    if (reminder.frequency === 'once') {
      await supabase
        .from('reminders')
        .update({ is_active: false, last_triggered_at: now })
        .eq('id', reminder.id)
    } else {
      const nextDate = getNextTriggerDate(reminder.frequency, reminder.custom_interval_days)
      await supabase
        .from('reminders')
        .update({ next_trigger_at: nextDate.toISOString(), last_triggered_at: now })
        .eq('id', reminder.id)
    }

    results.push(`[OK] Reminder ${reminder.id} → ${userEmail}`)
  }

  console.log(`Cron reminders: ${sent} envoyés, ${errors} erreurs`)

  return NextResponse.json({
    sent,
    errors,
    total: reminders.length,
    results,
  })
}
