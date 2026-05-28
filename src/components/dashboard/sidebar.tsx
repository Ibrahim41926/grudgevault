'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Plus, Archive, Bell, Settings, LogOut, Sword, BookMarked
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/hooks/use-notifications'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const navItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/grudges', label: 'Mes Rancunes', icon: BookMarked },
  { href: '/dashboard/grudges/new', label: 'Nouvelle Rancune', icon: Plus, highlight: true },
  { href: '/dashboard/reminders', label: 'Rappels', icon: Bell },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, notif: true },
  { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { unreadCount } = useNotifications()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('À bientôt. Les archives restent.')
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen border-r border-border/50 bg-sidebar px-4 py-6">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2.5 mb-8 px-2 group">
        <div className="w-9 h-9 rounded-xl gradient-bg border border-primary/30 flex items-center justify-center grudge-glow group-hover:scale-110 transition-transform">
          <Sword className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold gradient-text tracking-tight">GrudgeVault</span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 3 }}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  item.highlight
                    ? 'gradient-bg text-white grudge-glow border-0'
                    : active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
                {item.notif && unreadCount > 0 && (
                  <Badge className="ml-auto bg-destructive text-white text-[10px] px-1.5 py-0 h-4 min-w-4 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
                {active && !item.highlight && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-accent -z-10"
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors mt-4"
      >
        <LogOut className="w-4 h-4" />
        Se déconnecter
      </button>
    </aside>
  )
}

export function MobileNav() {
  const pathname = usePathname()
  const { unreadCount } = useNotifications()

  const mobileItems = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/dashboard/grudges', label: 'Archives', icon: BookMarked },
    { href: '/dashboard/grudges/new', label: 'Ajouter', icon: Plus, highlight: true },
    { href: '/dashboard/notifications', label: 'Notifs', icon: Bell, notif: true },
    { href: '/dashboard/settings', label: 'Config', icon: Settings },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-sidebar/95 backdrop-blur-lg px-2 pb-safe">
      <div className="flex items-center justify-around py-2">
        {mobileItems.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} className="relative flex flex-col items-center gap-0.5 p-2">
              {item.highlight ? (
                <div className="w-11 h-11 rounded-2xl gradient-bg flex items-center justify-center grudge-glow -mt-5 shadow-lg">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
              ) : (
                <>
                  <item.icon className={cn('w-5 h-5', active ? 'text-primary' : 'text-muted-foreground')} />
                  {item.notif && unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                  )}
                  <span className={cn('text-[10px]', active ? 'text-primary' : 'text-muted-foreground')}>{item.label}</span>
                </>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
