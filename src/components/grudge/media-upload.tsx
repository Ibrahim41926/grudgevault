'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUpload } from '@/hooks/use-uploads'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { Upload } from '@/types'
import { Upload as UploadIcon, Image, FileAudio, FileText, Trash2, ExternalLink, Paperclip, Mic, RotateCcw, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

interface MediaUploadProps {
  grudgeId: string
  existingUploads: Upload[]
}

const FILE_ICONS: Record<string, any> = {
  image: Image,
  screenshot: Image,
  audio: FileAudio,
  pdf: FileText,
  other: Paperclip,
}

const ACCEPTED = 'image/*,audio/*,application/pdf'
const MAX_SIZE_MB = 50

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function MediaUpload({ grudgeId, existingUploads }: MediaUploadProps) {
  const [uploads, setUploads] = useState<Upload[]>(existingUploads)
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { upload, uploading, progress, getSignedUrl, deleteUpload } = useUpload()

  // Voice recorder state
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(t => t.stop())
      }

      recorder.start()
      setRecording(true)
      setRecordingTime(0)
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000)
    } catch {
      toast.error('Impossible d\'accéder au microphone.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const discardRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
  }

  const saveRecording = async () => {
    if (!audioBlob) return
    const fileName = `vocal_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.webm`
    const file = new File([audioBlob], fileName, { type: 'audio/webm' })
    const result = await upload(grudgeId, file)
    if (result) {
      setUploads(prev => [...prev, result])
      discardRecording()
    }
  }

  useEffect(() => {
    setUploads(existingUploads)
  }, [existingUploads])

  const loadSignedUrl = async (up: Upload) => {
    if (signedUrls[up.id]) return
    const url = await getSignedUrl(up.storage_path)
    if (url) setSignedUrls(prev => ({ ...prev, [up.id]: url }))
  }

  const handleFiles = async (files: FileList) => {
    for (const file of Array.from(files)) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        alert(`${file.name} dépasse ${MAX_SIZE_MB} MB.`)
        continue
      }
      const result = await upload(grudgeId, file)
      if (result) setUploads(prev => [...prev, result])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files)
  }

  const handleDelete = async (up: Upload) => {
    if (!confirm('Supprimer ce fichier ?')) return
    const ok = await deleteUpload(up)
    if (ok) setUploads(prev => prev.filter(u => u.id !== up.id))
  }

  return (
    <Card className="grudge-glass border-border/50 bg-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-muted-foreground uppercase tracking-widest">Preuves & Fichiers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
            dragging ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50 hover:bg-primary/5'
          )}
        >
          <input
            ref={fileRef}
            type="file"
            multiple
            accept={ACCEPTED}
            className="hidden"
            onChange={e => e.target.files && handleFiles(e.target.files)}
          />
          <UploadIcon className={cn('w-8 h-8 mx-auto mb-2', dragging ? 'text-primary' : 'text-muted-foreground')} />
          <p className="text-sm text-muted-foreground">
            Déposez des fichiers ou <span className="text-primary">cliquez pour parcourir</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">Images, audio, PDF · Max {MAX_SIZE_MB} MB</p>
        </div>

        {/* Voice recorder */}
        <div className="rounded-xl border border-border/50 bg-secondary/30 p-3">
          {!recording && !audioBlob && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full gap-2 text-muted-foreground hover:text-foreground"
              onClick={startRecording}
            >
              <Mic className="w-4 h-4" />
              Enregistrer un mémo vocal
            </Button>
          )}

          {recording && (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-mono text-sm text-red-400">{formatDuration(recordingTime)}</span>
                <span className="text-xs text-muted-foreground">Enregistrement en cours...</span>
              </div>
              <Button type="button" size="sm" variant="destructive" onClick={stopRecording}>
                <Square className="mr-1.5 h-3.5 w-3.5" />
                Arrêter
              </Button>
            </div>
          )}

          {audioBlob && !recording && (
            <div className="space-y-2">
              {audioUrl && <audio src={audioUrl} controls className="h-9 w-full" />}
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="ghost" className="flex-1" onClick={discardRecording}>
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Recommencer
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="gradient-bg flex-1 border-0 text-white"
                  onClick={saveRecording}
                  disabled={uploading}
                >
                  <UploadIcon className="mr-1.5 h-3.5 w-3.5" />
                  Archiver
                </Button>
              </div>
            </div>
          )}
        </div>

        {uploading && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Archivage en cours...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}

        {/* File list */}
        <AnimatePresence>
          {uploads.map(up => {
            const Icon = FILE_ICONS[up.file_type] || Paperclip
            return (
              <motion.div
                key={up.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{up.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(up.file_size / 1024).toFixed(0)} KB · {format(new Date(up.created_at), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost" size="icon"
                    className="w-7 h-7"
                    onClick={async () => {
                      await loadSignedUrl(up)
                      if (signedUrls[up.id]) window.open(signedUrls[up.id], '_blank')
                    }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="w-7 h-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(up)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {uploads.length === 0 && !uploading && (
          <p className="text-xs text-muted-foreground text-center">Aucune preuve archivée pour l'instant.</p>
        )}
      </CardContent>
    </Card>
  )
}
