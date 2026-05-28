'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Upload, FileType } from '@/types'
import { toast } from 'sonner'

function getFileType(mimeType: string): FileType {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType === 'application/pdf') return 'pdf'
  return 'other'
}

export function useUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const upload = async (grudgeId: string, file: File): Promise<Upload | null> => {
    setUploading(true)
    setProgress(0)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); return null }

    const ext = file.name.split('.').pop()
    const storagePath = `${user.id}/${grudgeId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

    const { error: storageError } = await supabase.storage
      .from('grudge-media')
      .upload(storagePath, file, { upsert: false })

    if (storageError) {
      toast.error('Erreur upload: ' + storageError.message)
      setUploading(false)
      return null
    }

    setProgress(80)

    const fileType = getFileType(file.type)
    const { data: uploadRecord, error: dbError } = await supabase
      .from('uploads')
      .insert({
        user_id: user.id,
        grudge_id: grudgeId,
        file_name: file.name,
        file_type: fileType,
        file_size: file.size,
        storage_path: storagePath,
        mime_type: file.type,
      })
      .select()
      .single()

    if (dbError) {
      toast.error('Erreur enregistrement fichier')
      setUploading(false)
      return null
    }

    setProgress(100)
    setUploading(false)
    toast.success('Preuve archivée.')
    return uploadRecord
  }

  const getSignedUrl = async (storagePath: string): Promise<string | null> => {
    const supabase = createClient()
    const { data, error } = await supabase.storage
      .from('grudge-media')
      .createSignedUrl(storagePath, 3600)
    if (error) return null
    return data.signedUrl
  }

  const deleteUpload = async (upload: Upload): Promise<boolean> => {
    const supabase = createClient()
    await supabase.storage.from('grudge-media').remove([upload.storage_path])
    const { error } = await supabase.from('uploads').delete().eq('id', upload.id)
    if (error) { toast.error('Erreur suppression'); return false }
    toast.success('Fichier supprimé.')
    return true
  }

  return { upload, uploading, progress, getSignedUrl, deleteUpload }
}
