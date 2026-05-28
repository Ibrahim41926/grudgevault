'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Reminder, ReminderFormData } from '@/types'
import { toast } from 'sonner'

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReminders = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('reminders')
      .select('*, grudge:grudges(id, title, first_name, last_name)')
      .order('next_trigger_at', { ascending: true })

    if (!error) setReminders(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchReminders() }, [])

  const createReminder = async (data: ReminderFormData): Promise<boolean> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase.from('reminders').insert({ ...data, user_id: user.id })
    if (error) { toast.error('Erreur création rappel'); return false }
    toast.success('Rappel programmé. La mémoire ne faillit pas.')
    await fetchReminders()
    return true
  }

  const toggleReminder = async (id: string, is_active: boolean): Promise<void> => {
    const supabase = createClient()
    await supabase.from('reminders').update({ is_active }).eq('id', id)
    setReminders(r => r.map(rem => rem.id === id ? { ...rem, is_active } : rem))
  }

  const deleteReminder = async (id: string): Promise<void> => {
    const supabase = createClient()
    await supabase.from('reminders').delete().eq('id', id)
    setReminders(r => r.filter(rem => rem.id !== id))
    toast.success('Rappel supprimé.')
  }

  return { reminders, loading, createReminder, toggleReminder, deleteReminder, refetch: fetchReminders }
}
