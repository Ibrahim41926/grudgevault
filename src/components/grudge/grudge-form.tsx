'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTags } from '@/hooks/use-tags'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { GRUDGE_CATEGORIES, SEVERITY_LABELS, type GrudgeFormData, type Grudge } from '@/types'
import { Loader2, Plus, X, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

const schema = z.object({
  first_name: z.string().min(1, 'Prénom requis').max(50),
  last_name: z.string().max(50).optional(),
  nickname: z.string().max(50).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  social_handle: z.string().max(100).optional(),
  title: z.string().min(3, '3 caractères minimum').max(200),
  description: z.string().min(10, '10 caractères minimum'),
  category: z.enum(['betrayal', 'lies', 'theft', 'manipulation', 'abandonment', 'humiliation', 'broken_promise', 'gossip', 'sabotage', 'other']),
  incident_date: z.string().min(1, 'Date requise'),
})

interface GrudgeFormProps {
  defaultValues?: Partial<Grudge>
  onSubmit: (data: GrudgeFormData) => Promise<void>
  loading?: boolean
  submitLabel?: string
}

export function GrudgeForm({ defaultValues, onSubmit, loading, submitLabel = 'Archiver la rancune' }: GrudgeFormProps) {
  const [severity, setSeverity] = useState(defaultValues?.severity ?? 5)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    defaultValues?.tags?.map(t => t.id) ?? []
  )
  const [newTagName, setNewTagName] = useState('')
  const { tags, createTag } = useTags()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: defaultValues?.first_name ?? '',
      last_name: defaultValues?.last_name ?? '',
      nickname: defaultValues?.nickname ?? '',
      phone: defaultValues?.phone ?? '',
      email: defaultValues?.email ?? '',
      social_handle: defaultValues?.social_handle ?? '',
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      category: defaultValues?.category ?? 'betrayal',
      incident_date: defaultValues?.incident_date ?? new Date().toISOString().split('T')[0],
    },
  })

  const category = watch('category')

  const handleFormSubmit = async (data: any) => {
    await onSubmit({ ...data, severity, tag_ids: selectedTagIds })
  }

  const handleAddTag = async () => {
    if (!newTagName.trim()) return
    const existing = tags.find(t => t.name.toLowerCase() === newTagName.toLowerCase())
    if (existing) {
      if (!selectedTagIds.includes(existing.id)) setSelectedTagIds(ids => [...ids, existing.id])
    } else {
      const tag = await createTag(newTagName.trim())
      if (tag) setSelectedTagIds(ids => [...ids, tag.id])
    }
    setNewTagName('')
  }

  const sevLabel = SEVERITY_LABELS[severity]

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Person section */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
          👤 Identité du traître
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="first_name">Prénom *</Label>
            <Input id="first_name" {...register('first_name')} placeholder="Kevin" />
            {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="last_name">Nom</Label>
            <Input id="last_name" {...register('last_name')} placeholder="Martin" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nickname">Surnom</Label>
            <Input id="nickname" {...register('nickname')} placeholder="Le traître / La garce" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="incident_date">Date de l'incident *</Label>
            <Input id="incident_date" type="date" {...register('incident_date')} />
            {errors.incident_date && <p className="text-xs text-destructive">{errors.incident_date.message}</p>}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" {...register('phone')} placeholder="+33 6..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} placeholder="traître@example.com" />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="social_handle">Pseudo réseaux</Label>
            <Input id="social_handle" {...register('social_handle')} placeholder="@kevin_le_traître" />
          </div>
        </div>
      </section>

      {/* Grudge details */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
          📁 Détails de la rancune
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Catégorie *</Label>
            <Select defaultValue={defaultValues?.category ?? 'betrayal'} onValueChange={v => setValue('category', v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GRUDGE_CATEGORIES).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Niveau de gravité: <span className={cn('font-bold', sevLabel.color)}>{severity}/10 — {sevLabel.label}</span></Label>
            <div className="pt-2 pb-1">
              <Slider
                min={1} max={10} step={1}
                defaultValue={[severity]}
                onValueChange={(vals) => { const arr = vals as number[]; if (arr.length > 0) setSeverity(arr[0]) }}
                className="severity-bar"
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>1 Anecdotique</span><span>10 Légendaire</span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="title">Titre *</Label>
          <Input id="title" {...register('title')} placeholder="Résumez la trahison en une phrase percutante" />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description complète *</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Racontez les faits en détail. Les archives méritent la vérité."
            rows={6}
          />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>
      </section>

      {/* Tags */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
          🏷️ Tags personnalisés
        </h3>
        <div className="flex gap-2 flex-wrap">
          {tags.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => setSelectedTagIds(ids =>
                ids.includes(tag.id) ? ids.filter(id => id !== tag.id) : [...ids, tag.id]
              )}
              className={cn(
                'text-xs px-2.5 py-1 rounded-full border transition-all',
                selectedTagIds.includes(tag.id)
                  ? 'border-current text-current bg-current/10'
                  : 'border-border text-muted-foreground hover:border-current'
              )}
              style={{ '--tw-text-opacity': 1, color: selectedTagIds.includes(tag.id) ? tag.color : undefined } as any}
            >
              {tag.name}
              {selectedTagIds.includes(tag.id) && <X className="inline w-2.5 h-2.5 ml-1" />}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Nouveau tag..."
              className="pl-8 text-sm"
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter
          </Button>
        </div>
      </section>

      <Button type="submit" disabled={loading} className="w-full gradient-bg text-white border-0 grudge-glow py-6 text-base">
        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Archivage...</> : submitLabel}
      </Button>
    </form>
  )
}
