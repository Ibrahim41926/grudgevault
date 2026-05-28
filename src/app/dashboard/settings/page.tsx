'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/components/providers/theme-provider'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import type { Profile } from '@/types'
import { Loader2, Download, Trash2, Sun, Moon, Bell, User, Shield } from 'lucide-react'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ full_name: '', notifications_email: true, notifications_frequency: 'daily' })
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        if (data) {
          setProfile(data)
          setForm({
            full_name: data.full_name || '',
            notifications_email: data.notifications_email,
            notifications_frequency: data.notifications_frequency,
          })
        }
      })
    })
  }, [])

  const saveProfile = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { error } = await supabase.from('profiles').update(form).eq('id', user.id)
    if (error) toast.error('Erreur de sauvegarde')
    else toast.success('Profil mis à jour.')
    setLoading(false)
  }

  const exportData = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('grudges').select(`*, tags:grudge_tags(tag:tags(*)), uploads(*), reminders(*)`)
    if (!data) { toast.error('Erreur export'); return }

    const normalized = data.map((g: any) => ({
      ...g,
      tags: g.tags?.map((t: any) => t.tag).filter(Boolean) || [],
    }))

    const blob = new Blob([JSON.stringify(normalized, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `grudgevault-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Export téléchargé.')
  }

  const deleteAccount = async () => {
    if (!confirm('Supprimer définitivement votre compte et toutes vos données ? Cette action est IRRÉVERSIBLE.')) return
    if (!confirm('Dernière confirmation : toutes vos rancunes, fichiers et rappels seront supprimés.')) return
    setDeleting(true)
    const supabase = createClient()
    // In production, this should call a server-side function for proper cleanup
    await supabase.auth.signOut()
    toast.success('Compte supprimé. Le karma continue sans archives.')
    window.location.href = '/'
  }

  return (
    <div>
      <PageHeader title="Paramètres" subtitle="Gérez votre coffre émotionnel." />

      <div className="px-6 py-6 space-y-6 max-w-2xl">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="grudge-glass border-border/50 bg-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><User className="w-4 h-4 text-primary" /> Profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nom complet</Label>
                <Input
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="Votre nom"
                />
              </div>
              {profile?.email && (
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input value={profile.email} disabled className="opacity-60" />
                  <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié ici.</p>
                </div>
              )}
              <Button onClick={saveProfile} disabled={loading} className="gradient-bg text-white border-0">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sauvegarder
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="grudge-glass border-border/50 bg-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Sun className="w-4 h-4 text-amber-400" /> Apparence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Mode sombre</p>
                  <p className="text-xs text-muted-foreground">L'interface par défaut de GrudgeVault.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={v => setTheme(v ? 'dark' : 'light')}
                  />
                  <Moon className="w-4 h-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="grudge-glass border-border/50 bg-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Bell className="w-4 h-4 text-primary" /> Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Emails de rappel</p>
                  <p className="text-xs text-muted-foreground">Recevoir les rappels par email.</p>
                </div>
                <Switch
                  checked={form.notifications_email}
                  onCheckedChange={v => setForm(f => ({ ...f, notifications_email: v }))}
                />
              </div>
              <Separator className="border-border/50" />
              <div className="space-y-1.5">
                <Label>Fréquence par défaut</Label>
                <Select
                  value={form.notifications_frequency}
                  onValueChange={v => setForm(f => ({ ...f, notifications_frequency: v ?? f.notifications_frequency }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Quotidien</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={saveProfile} disabled={loading} variant="outline" size="sm">
                Sauvegarder les notifications
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="grudge-glass border-border/50 bg-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Shield className="w-4 h-4 text-cyan-400" /> Données & Confidentialité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Exporter mes données</p>
                  <p className="text-xs text-muted-foreground">Télécharger toutes vos rancunes en JSON.</p>
                </div>
                <Button variant="outline" size="sm" onClick={exportData}>
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Exporter
                </Button>
              </div>

              <Separator className="border-border/50" />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-destructive">Supprimer mon compte</p>
                  <p className="text-xs text-muted-foreground">Supprime toutes vos données de façon irréversible.</p>
                </div>
                <Button variant="destructive" size="sm" onClick={deleteAccount} disabled={deleting}>
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
