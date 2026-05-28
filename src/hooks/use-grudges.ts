'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Grudge, GrudgeFilters, GrudgeFormData } from '@/types'
import { toast } from 'sonner'

export function useGrudges(filters?: GrudgeFilters) {
  const [grudges, setGrudges] = useState<Grudge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGrudges = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      let query = supabase
        .from('grudges')
        .select(`*, tags:grudge_tags(tag:tags(*)), uploads(*)`)

      if (filters?.search) {
        query = query.textSearch('search_vector', filters.search, { type: 'websearch' })
      }
      if (filters?.category) {
        query = query.eq('category', filters.category)
      }
      if (filters?.severity_min !== undefined) {
        query = query.gte('severity', filters.severity_min)
      }
      if (filters?.severity_max !== undefined) {
        query = query.lte('severity', filters.severity_max)
      }
      if (filters?.is_archived !== undefined) {
        query = query.eq('is_archived', filters.is_archived)
      } else {
        query = query.eq('is_archived', false)
      }
      if (filters?.is_favorite !== undefined) {
        query = query.eq('is_favorite', filters.is_favorite)
      }

      const sortField = filters?.sort === 'oldest' ? 'incident_date'
        : filters?.sort === 'severity_high' || filters?.sort === 'severity_low' ? 'severity'
        : 'created_at'
      const ascending = filters?.sort === 'oldest' || filters?.sort === 'severity_low'
      query = query.order(sortField, { ascending })

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      // Flatten tags
      const normalized = (data || []).map((g: any) => ({
        ...g,
        tags: g.tags?.map((t: any) => t.tag).filter(Boolean) || [],
      }))

      // Filter by tag_ids if provided
      if (filters?.tag_ids && filters.tag_ids.length > 0) {
        const filtered = normalized.filter((g: Grudge) =>
          filters.tag_ids!.some(tid => g.tags?.some(t => t.id === tid))
        )
        setGrudges(filtered)
      } else {
        setGrudges(normalized)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => { fetchGrudges() }, [fetchGrudges])

  return { grudges, loading, error, refetch: fetchGrudges }
}

export function useGrudge(id: string) {
  const [grudge, setGrudge] = useState<Grudge | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const supabase = createClient()

    supabase
      .from('grudges')
      .select(`*, tags:grudge_tags(tag:tags(*)), uploads(*), reminders(*)`)
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setGrudge({
            ...data,
            tags: data.tags?.map((t: any) => t.tag).filter(Boolean) || [],
          })
        }
        setLoading(false)
      })
  }, [id])

  return { grudge, loading }
}

export function useCreateGrudge() {
  const [loading, setLoading] = useState(false)

  const create = async (data: GrudgeFormData): Promise<Grudge | null> => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return null }

    const { tag_ids, ...grudgeData } = data

    const { data: grudge, error } = await supabase
      .from('grudges')
      .insert({ ...grudgeData, user_id: user.id })
      .select()
      .single()

    if (error) {
      toast.error('Erreur lors de la création')
      setLoading(false)
      return null
    }

    if (tag_ids && tag_ids.length > 0) {
      await supabase.from('grudge_tags').insert(
        tag_ids.map(tag_id => ({ grudge_id: grudge.id, tag_id }))
      )
    }

    setLoading(false)
    toast.success('Rancune archivée avec succès.')
    return grudge
  }

  return { create, loading }
}

export function useUpdateGrudge() {
  const [loading, setLoading] = useState(false)

  const update = async (id: string, data: Partial<GrudgeFormData>): Promise<boolean> => {
    setLoading(true)
    const supabase = createClient()
    const { tag_ids, ...grudgeData } = data as any

    const { error } = await supabase
      .from('grudges')
      .update(grudgeData)
      .eq('id', id)

    if (error) {
      toast.error('Erreur lors de la mise à jour')
      setLoading(false)
      return false
    }

    if (tag_ids !== undefined) {
      await supabase.from('grudge_tags').delete().eq('grudge_id', id)
      if (tag_ids.length > 0) {
        await supabase.from('grudge_tags').insert(
          tag_ids.map((tag_id: string) => ({ grudge_id: id, tag_id }))
        )
      }
    }

    setLoading(false)
    toast.success('Rancune mise à jour.')
    return true
  }

  return { update, loading }
}

export function useDeleteGrudge() {
  const remove = async (id: string): Promise<boolean> => {
    const supabase = createClient()
    const { error } = await supabase.from('grudges').delete().eq('id', id)
    if (error) { toast.error('Erreur lors de la suppression'); return false }
    toast.success('Rancune supprimée. Le karma fera le reste.')
    return true
  }
  return { remove }
}
