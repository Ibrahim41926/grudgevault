'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tag } from '@/types'
import { toast } from 'sonner'

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTags = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('tags').select('*').order('name')
    if (data) setTags(data)
    setLoading(false)
  }

  useEffect(() => { fetchTags() }, [])

  const createTag = async (name: string, color?: string): Promise<Tag | null> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('tags')
      .insert({ name, color: color || '#8b5cf6', user_id: user.id })
      .select()
      .single()

    if (error) { toast.error('Tag déjà existant ou erreur'); return null }
    setTags(t => [...t, data])
    return data
  }

  const deleteTag = async (id: string) => {
    const supabase = createClient()
    await supabase.from('tags').delete().eq('id', id)
    setTags(t => t.filter(tag => tag.id !== id))
  }

  return { tags, loading, createTag, deleteTag, refetch: fetchTags }
}
