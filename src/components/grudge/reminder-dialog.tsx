'use client'

import { useState } from 'react'
import { addDays, addMonths, addWeeks, addYears, format } from 'date-fns'
import { Bell, Loader2, ScrollText, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { ReminderFormData, ReminderFrequency } from '@/types'
import { cn } from '@/lib/utils'

const FREQUENCY_OPTIONS: { value: ReminderFrequency; label: string; desc: string }[] = [
  { value: 'once', label: 'Une seule fois', desc: 'Rappel unique' },
  { value: 'daily', label: 'Quotidien', desc: 'Chaque jour' },
  { value: 'weekly', label: 'Hebdomadaire', desc: 'Chaque semaine' },
  { value: 'monthly', label: 'Mensuel', desc: 'Chaque mois' },
  { value: 'yearly', label: 'Annuel', desc: 'Chaque année' },
  { value: 'custom', label: 'Personnalisé', desc: 'Intervalle au choix' },
]

const MESSAGE_HINTS = [
  { label: 'Sobre', text: 'Garde un ton sobre et factuel.' },
  { label: 'Piquant', text: "Ajoute une pointe d'ironie sans agressivité." },
  { label: 'Très court', text: 'Fais un rappel très court et direct.' },
  { label: 'Mémoire longue', text: "Insiste sur le fait que les archives n'ont rien oublié." },
]

function getNextTrigger(frequency: ReminderFrequency, customDays?: number): string {
  const now = new Date()
  let next: Date

  switch (frequency) {
    case 'daily':
      next = addDays(now, 1)
      break
    case 'weekly':
      next = addWeeks(now, 1)
      break
    case 'monthly':
      next = addMonths(now, 1)
      break
    case 'yearly':
      next = addYears(now, 1)
      break
    case 'custom':
      next = addDays(now, customDays || 7)
      break
    default:
      next = addDays(now, 1)
  }

  return next.toISOString()
}

function getDescriptionExcerpt(description?: string): string | null {
  const trimmed = description?.trim()
  if (!trimmed) {
    return null
  }

  return trimmed.length > 220 ? `${trimmed.slice(0, 220).trim()}...` : trimmed
}

interface ReminderDialogProps {
  open: boolean
  onClose: () => void
  grudgeId: string
  grudgeName: string
  grudgeDescription?: string
  onSave: (data: ReminderFormData) => Promise<boolean>
}

export function ReminderDialog({
  open,
  onClose,
  grudgeId,
  grudgeName,
  grudgeDescription,
  onSave,
}: ReminderDialogProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: `Rappel: ${grudgeName}`,
    message: '',
    frequency: 'monthly' as ReminderFrequency,
    custom_interval_days: 7,
    trigger_date: format(addDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm"),
  })

  const descriptionExcerpt = getDescriptionExcerpt(grudgeDescription)

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const next_trigger_at = form.frequency === 'once'
      ? new Date(form.trigger_date).toISOString()
      : getNextTrigger(form.frequency, form.custom_interval_days)

    const ok = await onSave({
      grudge_id: grudgeId,
      title: form.title,
      message: form.message.trim() || undefined,
      frequency: form.frequency,
      custom_interval_days: form.frequency === 'custom' ? form.custom_interval_days : undefined,
      next_trigger_at,
    })

    setLoading(false)
    if (ok) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="grudge-glass flex max-h-[90vh] max-w-lg flex-col border-border/50">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Programmer un rappel
          </DialogTitle>
          <DialogDescription>
            {"Les archives n'oublient jamais. Vous non plus."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          <div className="rounded-2xl border border-primary/20 bg-primary/8 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Le texte final sera reformulé avant envoi.</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  L&apos;IA part d&apos;abord de la description de la rancune. La consigne optionnelle sert surtout
                  à guider le ton, l&apos;angle ou l&apos;insistance du rappel.
                </p>
              </div>
            </div>
          </div>

          {descriptionExcerpt && (
            <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                <ScrollText className="w-3.5 h-3.5" />
                Base actuelle du rappel
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">{descriptionExcerpt}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Titre du rappel</Label>
            <Input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Consigne optionnelle</Label>
            <Textarea
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              rows={3}
              placeholder="Ex. Reste factuel, mais un peu ironique."
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Si vous laissez vide, la description détaillée de la rancune servira seule de base.
            </p>

            <div className="flex flex-wrap gap-2">
              {MESSAGE_HINTS.map(hint => (
                <button
                  key={hint.label}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, message: hint.text }))}
                  className="rounded-full border border-border/60 bg-secondary/60 px-3 py-1 text-[11px] font-medium text-secondary-foreground transition-colors hover:border-primary/25 hover:bg-primary/10"
                >
                  {hint.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Fréquence</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {FREQUENCY_OPTIONS.map(option => {
                const active = form.frequency === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, frequency: option.value }))}
                    className={cn(
                      'rounded-2xl border p-3 text-left transition-all',
                      active
                        ? 'border-primary/35 bg-primary/12 text-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.03)]'
                        : 'border-border/60 bg-background/35 text-muted-foreground hover:border-primary/20 hover:bg-secondary/70 hover:text-foreground'
                    )}
                  >
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{option.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {form.frequency === 'custom' && (
            <div className="space-y-1.5">
              <Label>Intervalle (jours)</Label>
              <Input
                type="number"
                min={1}
                max={365}
                value={form.custom_interval_days}
                onChange={e => setForm(f => ({ ...f, custom_interval_days: parseInt(e.target.value) || 7 }))}
              />
            </div>
          )}

          {form.frequency === 'once' && (
            <div className="space-y-1.5">
              <Label>Date et heure</Label>
              <Input
                type="datetime-local"
                value={form.trigger_date}
                onChange={e => setForm(f => ({ ...f, trigger_date: e.target.value }))}
                required
              />
            </div>
          )}

          <div className="rounded-2xl border border-dashed border-border/60 bg-background/35 p-3 text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Aperçu du comportement :</span>{' '}
            la description détaillée reste la source principale. La consigne aide surtout à ajuster le style du rappel.
          </div>
          </div>

          <div className="flex flex-shrink-0 gap-2 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="gradient-bg flex-1 border-0 text-white" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bell className="mr-2 h-4 w-4" />}
              Programmer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
