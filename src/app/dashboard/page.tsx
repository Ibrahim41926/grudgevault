'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useDashboard } from '@/hooks/use-dashboard'
import { PageHeader } from '@/components/dashboard/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { GRUDGE_CATEGORIES, SEVERITY_LABELS, HUMOROUS_LOADING_MESSAGES } from '@/types'
import { formatDistanceToNow, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Plus, Archive, Star, Clock, TrendingUp, Users, Bell, ChevronRight, Flame, type LucideIcon } from 'lucide-react'

const QUOTES = [
  '"Le temps guérit tout... sauf les screenshots."',
  '"Les archives n\'oublient jamais. Le pardon reste optionnel."',
  '"Organisé, documenté, impardonnable."',
  '"La vengeance est un plat qui se mange froid. Les données, elles, restent chaudes."',
]

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string
  value: number | string
  icon: LucideIcon
  color: string
  sub?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
    >
      <Card className="grudge-glass border-border/50 bg-transparent">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-current/10 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { stats, recentGrudges, upcomingReminders, topTraitors, loading } = useDashboard()
  const quote = stats
    ? QUOTES[(stats.total_grudges + stats.favorite_grudges) % QUOTES.length]
    : QUOTES[0]
  const loadingMsg = HUMOROUS_LOADING_MESSAGES[0]

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        subtitle={quote}
        action={
          <Link href="/dashboard/grudges/new">
            <Button className="gradient-bg text-white border-0 grudge-glow">
              <Plus className="w-4 h-4 mr-2" /> Nouvelle rancune
            </Button>
          </Link>
        }
      />

      <div className="px-6 py-6 space-y-8">
        {loading ? (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground italic animate-pulse">{loadingMsg}</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Rancunes" value={stats?.total_grudges ?? 0} icon={Archive} color="text-purple-400" />
              <StatCard label="Favorites" value={stats?.favorite_grudges ?? 0} icon={Star} color="text-amber-400" />
              <StatCard label="Gravité Moyenne" value={stats?.avg_severity?.toFixed(1) ?? '–'} icon={TrendingUp} color="text-red-400" sub="sur 10" />
              <StatCard label="Fichiers Archivés" value={stats?.total_uploads ?? 0} icon={Archive} color="text-cyan-400" />
            </div>

            {/* Emotional damage bar */}
            {stats && stats.total_grudges > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grudge-glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium">Indice de dégâts émotionnels</span>
                  </div>
                  <span className="text-sm font-bold text-red-400">{Math.round((stats.avg_severity / 10) * 100)}%</span>
                </div>
                <Progress value={(stats.avg_severity / 10) * 100} className="h-2 severity-bar" />
                <p className="text-xs text-muted-foreground mt-2">
                  Basé sur {stats.total_grudges} rancune{stats.total_grudges > 1 ? 's' : ''} · Catégorie dominante :{' '}
                  {stats.top_category ? GRUDGE_CATEGORIES[stats.top_category]?.label : '–'}
                </p>
              </motion.div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent grudges */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /> Rancunes récentes</h2>
                  <Link href="/dashboard/grudges" className="text-xs text-primary hover:underline flex items-center gap-1">
                    Voir tout <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                {recentGrudges.length === 0 ? (
                  <div className="grudge-glass rounded-xl p-8 text-center">
                    <p className="text-muted-foreground text-sm mb-4">Votre coffre est vide. Pour l&apos;instant.</p>
                    <Link href="/dashboard/grudges/new">
                      <Button size="sm" className="gradient-bg text-white border-0">
                        <Plus className="w-3 h-3 mr-1" /> Première rancune
                      </Button>
                    </Link>
                  </div>
                ) : (
                  recentGrudges.map((g, i) => {
                    const cat = GRUDGE_CATEGORIES[g.category]
                    const sev = SEVERITY_LABELS[g.severity]
                    return (
                      <motion.div
                        key={g.id}
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                      >
                        <Link href={`/dashboard/grudges/${g.id}`}>
                          <div className="grudge-glass rounded-xl p-4 hover:border-primary/30 border border-transparent transition-colors group">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-semibold truncate">
                                    {g.first_name} {g.last_name}
                                    {g.nickname && <span className="text-muted-foreground font-normal"> «{g.nickname}»</span>}
                                  </span>
                                  {g.is_favorite && <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">{g.title}</p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                    {cat.emoji} {cat.label}
                                  </Badge>
                                  <span className={`text-[10px] font-medium ${sev.color}`}>
                                    Gravité {g.severity}/10 · {sev.label}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(g.incident_date), { addSuffix: true, locale: fr })}
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-2 ml-auto" />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })
                )}
              </div>

              {/* Right column */}
              <div className="space-y-6">
                {/* Top traitors */}
                <div>
                  <h2 className="font-semibold flex items-center gap-2 mb-3"><Users className="w-4 h-4 text-muted-foreground" /> Top Traîtres</h2>
                  {topTraitors.length === 0 ? (
                    <div className="grudge-glass rounded-xl p-4 text-center text-xs text-muted-foreground">
                      Personne encore. Profitez-en.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {topTraitors.map((t, i) => (
                        <motion.div
                          key={t.name}
                          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                          className="grudge-glass rounded-xl px-4 py-3 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-4">#{i + 1}</span>
                            <span className="text-sm font-medium">{t.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-red-400">{t.count}×</div>
                            <div className="text-[10px] text-muted-foreground">moy. {t.avg_severity}/10</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upcoming reminders */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold flex items-center gap-2"><Bell className="w-4 h-4 text-muted-foreground" /> Rappels à venir</h2>
                    <Link href="/dashboard/reminders" className="text-xs text-primary hover:underline">
                      Voir tout
                    </Link>
                  </div>
                  {upcomingReminders.length === 0 ? (
                    <div className="grudge-glass rounded-xl p-4 text-center text-xs text-muted-foreground">
                      Aucun rappel programmé.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {upcomingReminders.slice(0, 3).map((r, i) => (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
                          className="grudge-glass rounded-xl px-4 py-3"
                        >
                          <p className="text-xs font-medium truncate">{r.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {format(new Date(r.next_trigger_at), 'dd MMM yyyy', { locale: fr })}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
