'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/types'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) {
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.is_read).length)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchNotifications()

    const supabase = createClient()
    // Unique channel name avoids "already subscribed" error in React Strict Mode
    const channelName = `notifications-${Math.random().toString(36).slice(2)}`
    const channel = supabase.channel(channelName)

    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const markAsRead = async (id: string) => {
    const supabase = createClient()
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(n => n.map(notif => notif.id === id ? { ...notif, is_read: true } : notif))
    setUnreadCount(c => Math.max(0, c - 1))
  }

  const markAllAsRead = async () => {
    const supabase = createClient()
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false)
    setNotifications(n => n.map(notif => ({ ...notif, is_read: true })))
    setUnreadCount(0)
  }

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refetch: fetchNotifications }
}
