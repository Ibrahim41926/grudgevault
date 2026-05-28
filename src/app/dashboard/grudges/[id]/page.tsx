'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  AlertTriangle,
  AtSign,
  Bell,
  Calendar,
  Clock,
  Edit,
  Mail,
  Phone,
  Sparkles,
  Star,
  Trash2,
  User,
} from 'lucide-react'
import { useDeleteGrudge, useGrudge, useUpdateGrudge } from '@/hooks/use-grudges'
import { useReminders } from '@/hooks/use-reminders'
import { PageHeader } from '@/components/dashboard/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ReminderDialog } from '@/components/grudge/reminder-dialog'
import { MediaUpload } from '@/components/grudge/media-upload'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { GRUDGE_CATEGORIES, SEVERITY_LABELS } from '@/types'

export default function GrudgeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { grudge, loading } = useGrudge(id)
  const { remove } = useDeleteGrudge()
  const { update } = useUpdateGrudge()
  const { reminders, createReminder } = useReminders()
  const [showReminderDialog, setShowReminderDialog] = useState(false)

  const grudgeReminders = reminders.filter(reminder => reminder.grudge_id === id)

  if (loading) {
    return (
      <div>
        <div className="border-b border-border/50 px-6 pb-6 pt-8">
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-4 px-6 py-6">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!grudge) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Rancune introuvable.</p>
        <Link href="/dashboard/grudges" className="mt-4 text-sm text-primary hover:underline">
          Retour aux archives
        </Link>
      </div>
    )
  }

  const category = GRUDGE_CATEGORIES[grudge.category]
  const severity = SEVERITY_LABELS[grudge.severity]

  const handleDelete = async () => {
    if (confirm('Supprimer définitivement ? Le karma reste inchangé.')) {
      await remove(grudge.id)
      router.push('/dashboard/grudges')
    }
  }

  const handleFavorite = async () => {
    const payload = { is_favorite: !grudge.is_favorite } as unknown as Parameters<typeof update>[1]
    await update(grudge.id, payload)
  }

  return (
    <div>
      <PageHeader
        title={`${grudge.first_name} ${grudge.last_name || ''}`}
        subtitle={grudge.title}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavorite}
              className={grudge.is_favorite ? 'text-amber-400' : ''}
            >
              <Star className={`h-4 w-4 ${grudge.is_favorite ? 'fill-amber-400' : ''}`} />
            </Button>
            <Link href={`/dashboard/grudges/${grudge.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="mr-1.5 h-3.5 w-3.5" />
                Modifier
              </Button>
            </Link>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Supprimer
            </Button>
          </div>
        }
      />

      <div className="max-w-3xl space-y-6 px-6 py-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="grudge-glass border-border/50 bg-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Identité</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {grudge.first_name} {grudge.last_name}
                </span>
                {grudge.nickname && <span className="text-xs text-muted-foreground">«{grudge.nickname}»</span>}
              </div>

              {grudge.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-xs">{grudge.phone}</span>
                </div>
              )}

              {grudge.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs">{grudge.email}</span>
                </div>
              )}

              {grudge.social_handle && (
                <div className="flex items-center gap-2">
                  <AtSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs">{grudge.social_handle}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Incident : {format(new Date(grudge.incident_date), 'dd MMMM yyyy', { locale: fr })}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Archivé le {format(new Date(grudge.created_at), 'dd/MM/yyyy', { locale: fr })}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="grudge-glass border-border/50 bg-transparent">
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-wrap items-start gap-3">
                <Badge className="bg-secondary text-secondary-foreground">
                  {category.emoji} {category.label}
                </Badge>
                {grudge.tags?.map(tag => (
                  <span
                    key={tag.id}
                    className="rounded-full px-2.5 py-1 text-xs"
                    style={{ background: `${tag.color}22`, color: tag.color }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>

              <div>
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-muted-foreground">Niveau de gravité</span>
                  <span className={`font-bold ${severity.color}`}>
                    {grudge.severity}/10 - {severity.label}
                  </span>
                </div>
                <Progress value={grudge.severity * 10} className="h-2" />
              </div>

              <Separator className="border-border/50" />

              <div>
                <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Description</p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{grudge.description}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <MediaUpload grudgeId={grudge.id} existingUploads={grudge.uploads || []} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="grudge-glass border-border/50 bg-transparent">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Rappels</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowReminderDialog(true)}>
                <Bell className="mr-1.5 h-3.5 w-3.5" />
                Programmer
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4 rounded-2xl border border-primary/20 bg-primary/8 p-3">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    La description ci-dessus sert maintenant de base principale au message de rappel. La consigne
                    optionnelle ne fait qu&apos;orienter le ton final.
                  </p>
                </div>
              </div>

              {grudgeReminders.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun rappel. La mémoire humaine reste défaillante.</p>
              ) : (
                <div className="space-y-2">
                  {grudgeReminders.map(reminder => (
                    <div key={reminder.id} className="rounded-2xl border border-border/60 bg-background/35 p-3 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{reminder.title}</p>
                        <Badge variant={reminder.is_active ? 'default' : 'secondary'} className="text-[10px]">
                          {reminder.is_active ? 'Actif' : 'Pause'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {reminder.frequency} · Prochain :{' '}
                        {format(new Date(reminder.next_trigger_at), 'dd MMM yyyy', { locale: fr })}
                      </p>
                      {reminder.message && <p className="mt-2 text-xs text-muted-foreground">{reminder.message}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <ReminderDialog
        open={showReminderDialog}
        onClose={() => setShowReminderDialog(false)}
        grudgeId={grudge.id}
        grudgeName={`${grudge.first_name} ${grudge.last_name || ''}`}
        grudgeDescription={grudge.description}
        onSave={createReminder}
      />
    </div>
  )
}
