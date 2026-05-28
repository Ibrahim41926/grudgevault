'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { format, isPast } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowRight, Bell, BellOff, Calendar, PauseCircle, RefreshCw, Sparkles, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { useReminders } from '@/hooks/use-reminders'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import type { Reminder } from '@/types'
import { cn } from '@/lib/utils'

const FREQ_LABELS: Record<string, string> = {
  once: 'Une fois',
  daily: 'Quotidien',
  weekly: 'Hebdomadaire',
  monthly: 'Mensuel',
  yearly: 'Annuel',
  custom: 'Personnalisé',
}

type ReminderFilter = 'all' | 'active' | 'overdue' | 'paused'

const FILTER_OPTIONS: Array<{ value: ReminderFilter; label: string; desc: string }> = [
  { value: 'all', label: 'Tous', desc: 'Vue complète' },
  { value: 'active', label: 'Actifs', desc: 'Rappels en cours' },
  { value: 'overdue', label: 'En retard', desc: 'À traiter vite' },
  { value: 'paused', label: 'En pause', desc: 'Temporairement coupés' },
]

function isReminderOverdue(reminder: Reminder): boolean {
  return reminder.is_active && isPast(new Date(reminder.next_trigger_at))
}

function matchesFilter(reminder: Reminder, filter: ReminderFilter): boolean {
  switch (filter) {
    case 'active':
      return reminder.is_active
    case 'overdue':
      return isReminderOverdue(reminder)
    case 'paused':
      return !reminder.is_active
    default:
      return true
  }
}

function getStatusMeta(reminder: Reminder): { label: string; variant: 'default' | 'secondary' | 'destructive' } {
  if (!reminder.is_active) {
    return { label: 'En pause', variant: 'secondary' }
  }

  if (isReminderOverdue(reminder)) {
    return { label: 'En retard', variant: 'destructive' }
  }

  return { label: 'Actif', variant: 'default' }
}

export default function RemindersPage() {
  const { reminders, loading, toggleReminder, deleteReminder } = useReminders()
  const [filter, setFilter] = useState<ReminderFilter>('all')

  const filteredReminders = reminders.filter(reminder => matchesFilter(reminder, filter))
  const activeCount = reminders.filter(reminder => reminder.is_active).length
  const overdueCount = reminders.filter(isReminderOverdue).length
  const pausedCount = reminders.filter(reminder => !reminder.is_active).length

  return (
    <div>
      <PageHeader
        title="Rappels programmés"
        subtitle="Des rappels plus clairs, avec une base issue de la description de chaque rancune."
        action={
          <Badge variant="outline" className="hidden gap-1 border-primary/20 bg-primary/8 text-primary sm:inline-flex">
            <Sparkles className="w-3 h-3" />
            IA guidée par la description
          </Badge>
        }
      />

      <div className="space-y-6 px-6 py-6">
        {loading ? (
          <>
            <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
              <Skeleton className="h-48 rounded-3xl" />
              <Skeleton className="h-48 rounded-3xl" />
            </div>
            <div className="space-y-4">
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} className="h-52 rounded-3xl" />
              ))}
            </div>
          </>
        ) : (
          <>
            <section className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
              <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-[linear-gradient(135deg,rgba(170,90,255,0.12),rgba(255,120,120,0.06))] p-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_42%)]" />
                <div className="relative">
                  <Badge variant="outline" className="border-white/10 bg-white/5 text-white/80">
                    Rappels intelligents
                  </Badge>
                  <h2 className="mt-4 max-w-xl text-2xl font-semibold tracking-tight text-foreground">
                    Chaque rappel reste relié à ce qui a été décrit, pas à une phrase décorative.
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    Les rappels partent maintenant de la description détaillée de la rancune. Les consignes manuelles
                    servent surtout à orienter le ton du message final.
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: 'Total', value: reminders.length, note: 'archives connectées' },
                      { label: 'Actifs', value: activeCount, note: 'encore en circulation' },
                      { label: 'En retard', value: overdueCount, note: 'attention requise' },
                      { label: 'En pause', value: pausedCount, note: 'mis de côté' },
                    ].map(stat => (
                      <div key={stat.label} className="rounded-2xl border border-white/10 bg-black/10 p-3 backdrop-blur-sm">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">{stat.label}</p>
                        <p className="mt-2 text-2xl font-semibold text-foreground">{stat.value}</p>
                        <p className="mt-1 text-xs text-white/55">{stat.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border/60 bg-card/35 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.10)] backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Filtrer les rappels</p>
                    <p className="text-xs text-muted-foreground">Choisissez la vue la plus utile maintenant.</p>
                  </div>
                  <Badge variant="secondary">{filteredReminders.length}</Badge>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {FILTER_OPTIONS.map(option => {
                    const active = option.value === filter

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFilter(option.value)}
                        className={cn(
                          'rounded-2xl border p-3 text-left transition-all',
                          active
                            ? 'border-primary/30 bg-primary/10 text-foreground'
                            : 'border-border/60 bg-background/45 text-muted-foreground hover:border-primary/20 hover:bg-secondary/70 hover:text-foreground'
                        )}
                      >
                        <p className="text-sm font-medium">{option.label}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{option.desc}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            </section>

            {reminders.length === 0 ? (
              <div className="rounded-3xl border border-border/60 bg-card/35 px-6 py-16 text-center shadow-[0_12px_30px_rgba(0,0,0,0.10)] backdrop-blur-xl">
                <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-semibold">Aucun rappel programme</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Ouvrez une rancune et programmez un rappel depuis sa fiche. La description détaillée servira ensuite
                  de base au message final.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link href="/dashboard/grudges">
                    <Button variant="outline" className="min-w-40">
                      Voir les archives
                    </Button>
                  </Link>
                  <Link href="/dashboard/grudges/new">
                    <Button className="gradient-bg min-w-40 border-0 text-white">
                      Ajouter une rancune
                    </Button>
                  </Link>
                </div>
              </div>
            ) : filteredReminders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border/60 bg-background/35 px-6 py-14 text-center">
                <PauseCircle className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                <p className="text-base font-medium">Aucun rappel dans ce filtre</p>
                <p className="mt-2 text-sm text-muted-foreground">Changez de vue pour revoir l'ensemble de vos rappels.</p>
                <Button variant="outline" className="mt-5" onClick={() => setFilter('all')}>
                  Revenir à tous les rappels
                </Button>
              </div>
            ) : (
              <AnimatePresence>
                <div className="space-y-4">
                  {filteredReminders.map((reminder, index) => {
                    const overdue = isReminderOverdue(reminder)
                    const status = getStatusMeta(reminder)

                    return (
                      <motion.article
                        key={reminder.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ delay: index * 0.04 }}
                        className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/35 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.10)] backdrop-blur-xl"
                      >
                        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-primary/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0 flex-1 space-y-4">
                            <div className="flex items-start gap-3">
                              <div
                                className={cn(
                                  'mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border',
                                  reminder.is_active
                                    ? 'border-primary/20 bg-primary/10 text-primary'
                                    : 'border-border/60 bg-secondary/70 text-muted-foreground'
                                )}
                              >
                                {reminder.is_active ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                              </div>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-base font-semibold tracking-tight">{reminder.title}</h3>
                                  <Badge variant={status.variant}>{status.label}</Badge>
                                  {reminder.grudge && (
                                    <Badge variant="outline" className="border-border/60 bg-background/35 text-muted-foreground">
                                      {reminder.grudge.first_name} {reminder.grudge.last_name}
                                    </Badge>
                                  )}
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {reminder.grudge?.title || 'Rancune associée'}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary" className="gap-1.5">
                                <RefreshCw className="w-3 h-3" />
                                {FREQ_LABELS[reminder.frequency]}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'gap-1.5 border-border/60 bg-background/35',
                                  overdue ? 'border-destructive/30 text-destructive' : 'text-muted-foreground'
                                )}
                              >
                                <Calendar className="w-3 h-3" />
                                {format(new Date(reminder.next_trigger_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                              </Badge>
                              <Badge variant="outline" className="gap-1.5 border-primary/20 bg-primary/8 text-primary">
                                <Sparkles className="w-3 h-3" />
                                Base: description
                              </Badge>
                            </div>

                            <div className="rounded-2xl border border-border/60 bg-background/45 p-3">
                              <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                                {reminder.message ? 'Consigne enregistrée' : 'Génération automatique'}
                              </p>
                              <p className="text-sm leading-relaxed text-muted-foreground">
                                {reminder.message || 'Aucune consigne manuelle. Le rappel sera dérivé de la description de la rancune.'}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 flex-row items-center justify-between gap-3 md:flex-col md:items-end">
                            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/45 px-3 py-1.5">
                              <span className="text-xs text-muted-foreground">{reminder.is_active ? 'Actif' : 'En pause'}</span>
                              <Switch
                                checked={reminder.is_active}
                                onCheckedChange={checked => toggleReminder(reminder.id, checked)}
                                aria-label={`Activer ou mettre en pause ${reminder.title}`}
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              {reminder.grudge && (
                                <Link href={`/dashboard/grudges/${reminder.grudge.id}`}>
                                  <Button variant="outline" size="sm" className="gap-1.5">
                                    Voir l'archive
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </Button>
                                </Link>
                              )}
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => deleteReminder(reminder.id)}
                                aria-label={`Supprimer ${reminder.title}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    )
                  })}
                </div>
              </AnimatePresence>
            )}
          </>
        )}
      </div>
    </div>
  )
}
