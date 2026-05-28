'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useGrudges, useDeleteGrudge, useUpdateGrudge } from '@/hooks/use-grudges'
import { useTags } from '@/hooks/use-tags'
import { PageHeader } from '@/components/dashboard/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { GRUDGE_CATEGORIES, SEVERITY_LABELS, type GrudgeFilters, type GrudgeCategory } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Plus, Search, Star, Archive, Trash2, Edit, ChevronRight,
  Filter, SlidersHorizontal, X
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function GrudgesPage() {
  const [filters, setFilters] = useState<GrudgeFilters>({ sort: 'newest', is_archived: false })
  const [showFilters, setShowFilters] = useState(false)
  const { grudges, loading, refetch } = useGrudges(filters)
  const { tags } = useTags()
  const { remove } = useDeleteGrudge()
  const { update } = useUpdateGrudge()

  const handleArchive = async (id: string, current: boolean) => {
    await update(id, { is_archived: !current } as any)
    refetch()
  }

  const handleFavorite = async (id: string, current: boolean) => {
    await update(id, { is_favorite: !current } as any)
    refetch()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer définitivement cette rancune ? Le karma continuera sans elle.')) {
      await remove(id)
      refetch()
    }
  }

  return (
    <div>
      <PageHeader
        title={filters.is_archived ? 'Archives' : 'Mes Rancunes'}
        subtitle={`${grudges.length} entrée${grudges.length !== 1 ? 's' : ''}`}
        action={
          <Link href="/dashboard/grudges/new">
            <Button className="gradient-bg text-white border-0 grudge-glow">
              <Plus className="w-4 h-4 mr-2" /> Nouvelle
            </Button>
          </Link>
        }
      />

      <div className="px-6 py-4 space-y-4">
        {/* Search & filters bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, titre..."
              className="pl-9"
              value={filters.search || ''}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value || undefined }))}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(s => !s)}
            className={cn(showFilters && 'border-primary text-primary')}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grudge-glass rounded-xl p-4 grid sm:grid-cols-3 gap-3">
                <Select value={filters.category || ''} onValueChange={v => setFilters(f => ({ ...f, category: (v as GrudgeCategory) || undefined }))}>
                  <SelectTrigger><SelectValue placeholder="Toutes catégories" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes catégories</SelectItem>
                    {Object.entries(GRUDGE_CATEGORIES).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.sort || 'newest'} onValueChange={v => setFilters(f => ({ ...f, sort: v as any }))}>
                  <SelectTrigger><SelectValue placeholder="Trier par" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Plus récent</SelectItem>
                    <SelectItem value="oldest">Plus ancien</SelectItem>
                    <SelectItem value="severity_high">Gravité ↓</SelectItem>
                    <SelectItem value="severity_low">Gravité ↑</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button
                    variant={filters.is_archived ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setFilters(f => ({ ...f, is_archived: !f.is_archived }))}
                  >
                    <Archive className="w-3 h-3 mr-1" />
                    {filters.is_archived ? 'Actives' : 'Archivées'}
                  </Button>
                  <Button
                    variant={filters.is_favorite ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setFilters(f => ({ ...f, is_favorite: f.is_favorite ? undefined : true }))}
                  >
                    <Star className="w-3 h-3 mr-1" />
                    Favoris
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tags filter */}
        {tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {tags.map(tag => {
              const active = filters.tag_ids?.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  onClick={() => setFilters(f => ({
                    ...f,
                    tag_ids: active
                      ? (f.tag_ids || []).filter(id => id !== tag.id)
                      : [...(f.tag_ids || []), tag.id],
                  }))}
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-full border transition-colors',
                    active ? 'bg-primary/20 border-primary text-primary' : 'border-border text-muted-foreground hover:border-primary/50'
                  )}
                  style={active ? { borderColor: tag.color, color: tag.color } : {}}
                >
                  {tag.name}
                  {active && <X className="inline w-2.5 h-2.5 ml-1" />}
                </button>
              )
            })}
          </div>
        )}

        {/* Grudge list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : grudges.length === 0 ? (
          <div className="text-center py-16 grudge-glass rounded-2xl">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="font-semibold mb-2">Coffre vide</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {filters.search ? 'Aucun résultat pour cette recherche.' : 'Personne ne vous a encore trahi ? Patience.'}
            </p>
            <Link href="/dashboard/grudges/new">
              <Button size="sm" className="gradient-bg text-white border-0">
                <Plus className="w-3 h-3 mr-1" /> Première rancune
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {grudges.map((g, i) => {
                const cat = GRUDGE_CATEGORIES[g.category]
                const sev = SEVERITY_LABELS[g.severity]
                return (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.04 }}
                    className="grudge-glass rounded-xl border border-transparent hover:border-primary/20 transition-colors group"
                  >
                    <div className="flex items-center gap-3 p-4">
                      {/* Severity indicator */}
                      <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{
                        background: g.severity >= 8 ? 'oklch(0.62 0.24 25)' : g.severity >= 5 ? 'oklch(0.72 0.18 45)' : 'oklch(0.72 0.16 145)'
                      }} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/dashboard/grudges/${g.id}`} className="font-semibold text-sm hover:text-primary transition-colors">
                            {g.first_name} {g.last_name}
                            {g.nickname && <span className="text-muted-foreground font-normal text-xs"> «{g.nickname}»</span>}
                          </Link>
                          {g.is_favorite && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{g.title}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                            {cat.emoji} {cat.label}
                          </Badge>
                          <span className={`text-[10px] font-medium ${sev.color}`}>{g.severity}/10</span>
                          {g.tags && g.tags.length > 0 && (
                            <div className="flex gap-1">
                              {g.tags.slice(0, 2).map(t => (
                                <span key={t.id} className="text-[10px] px-1.5 py-0 rounded-full" style={{ background: t.color + '22', color: t.color }}>
                                  {t.name}
                                </span>
                              ))}
                              {g.tags.length > 2 && <span className="text-[10px] text-muted-foreground">+{g.tags.length - 2}</span>}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost" size="icon"
                          className={cn('w-7 h-7', g.is_favorite && 'text-amber-400')}
                          onClick={() => handleFavorite(g.id, g.is_favorite)}
                        >
                          <Star className={cn('w-3.5 h-3.5', g.is_favorite && 'fill-amber-400')} />
                        </Button>
                        <Link href={`/dashboard/grudges/${g.id}/edit`}>
                          <Button variant="ghost" size="icon" className="w-7 h-7">
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost" size="icon"
                          className="w-7 h-7 text-muted-foreground hover:text-amber-400"
                          onClick={() => handleArchive(g.id, g.is_archived)}
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className="w-7 h-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(g.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      <div className="text-right flex-shrink-0 ml-2 hidden sm:block">
                        <div className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(g.incident_date), { addSuffix: true, locale: fr })}
                        </div>
                      </div>

                      <Link href={`/dashboard/grudges/${g.id}`}>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </Link>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
