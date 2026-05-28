'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { DashboardStats, Grudge, Reminder } from '@/types'

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentGrudges, setRecentGrudges] = useState<Grudge[]>([])
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([])
  const [topTraitors, setTopTraitors] = useState<{ name: string; count: number; avg_severity: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    Promise.all([
      supabase.from('grudges').select('id, is_archived, is_favorite, severity, category').eq('is_archived', false),
      supabase.from('grudges').select('*, tags:grudge_tags(tag:tags(*))').eq('is_archived', false).order('created_at', { ascending: false }).limit(5),
      supabase.from('reminders').select('*, grudge:grudges(id, title, first_name, last_name)').eq('is_active', true).gte('next_trigger_at', new Date().toISOString()).order('next_trigger_at').limit(5),
      supabase.from('uploads').select('id'),
    ]).then(([grudgesRes, recentRes, remindersRes, uploadsRes]) => {
      const allGrudges = grudgesRes.data || []
      const avgSeverity = allGrudges.length > 0
        ? allGrudges.reduce((sum: number, g: any) => sum + g.severity, 0) / allGrudges.length
        : 0

      const categoryCounts: Record<string, number> = {}
      allGrudges.forEach((g: any) => {
        categoryCounts[g.category] = (categoryCounts[g.category] || 0) + 1
      })
      const topCategory = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0]?.[0] as any

      setStats({
        total_grudges: allGrudges.filter((g: any) => !g.is_archived).length,
        archived_grudges: allGrudges.filter((g: any) => g.is_archived).length,
        favorite_grudges: allGrudges.filter((g: any) => g.is_favorite).length,
        total_uploads: uploadsRes.data?.length || 0,
        avg_severity: Math.round(avgSeverity * 10) / 10,
        top_category: topCategory || null,
      })

      setRecentGrudges((recentRes.data || []).map((g: any) => ({
        ...g,
        tags: g.tags?.map((t: any) => t.tag).filter(Boolean) || [],
      })))

      setUpcomingReminders(remindersRes.data || [])

      // Calculate top traitors
      const traitorMap: Record<string, { count: number; severity_sum: number }> = {}
      allGrudges.forEach((g: any) => {
        const key = g.first_name + ' ' + (g.last_name || '')
        if (!traitorMap[key]) traitorMap[key] = { count: 0, severity_sum: 0 }
        traitorMap[key].count++
        traitorMap[key].severity_sum += g.severity
      })

      const traitors = Object.entries(traitorMap)
        .map(([name, data]) => ({
          name: name.trim(),
          count: data.count,
          avg_severity: Math.round((data.severity_sum / data.count) * 10) / 10,
        }))
        .sort((a, b) => b.count - a.count || b.avg_severity - a.avg_severity)
        .slice(0, 5)

      setTopTraitors(traitors)
      setLoading(false)
    })
  }, [])

  return { stats, recentGrudges, upcomingReminders, topTraitors, loading }
}
