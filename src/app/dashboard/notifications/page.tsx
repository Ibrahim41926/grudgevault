'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications } from '@/hooks/use-notifications'
import { PageHeader } from '@/components/dashboard/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Bell, CheckCheck, Info, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const TYPE_CONFIG = {
  reminder: { icon: Bell, color: 'text-primary', bg: 'bg-primary/10' },
  system: { icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  info: { icon: Info, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
}

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications()

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est lu'}
        action={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="w-3.5 h-3.5 mr-1.5" /> Tout marquer lu
            </Button>
          ) : undefined
        }
      />

      <div className="px-6 py-6 space-y-2">
        {loading ? (
          [...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 grudge-glass rounded-2xl">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="font-semibold mb-2">Aucune notification</p>
            <p className="text-sm text-muted-foreground">Les rappels apparaîtront ici.</p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map((n, i) => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => !n.is_read && markAsRead(n.id)}
                  className={cn(
                    'grudge-glass rounded-xl p-4 flex items-start gap-3 cursor-pointer transition-colors',
                    !n.is_read ? 'border border-primary/20' : 'border border-transparent opacity-70'
                  )}
                >
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', cfg.bg)}>
                    <cfg.icon className={cn('w-4 h-4', cfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-sm font-medium', !n.is_read && 'text-foreground')}>{n.title}</p>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
