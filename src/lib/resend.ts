import { Resend } from 'resend'

// Lazy initialization — évite l'erreur au build si RESEND_API_KEY est absent
let _resend: Resend | null = null

export function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY
    if (!key) throw new Error('RESEND_API_KEY manquante dans les variables d\'environnement.')
    _resend = new Resend(key)
  }
  return _resend
}

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'GrudgeVault <onboarding@resend.dev>'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
