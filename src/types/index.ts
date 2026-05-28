export type GrudgeCategory =
  | 'betrayal'
  | 'lies'
  | 'theft'
  | 'manipulation'
  | 'abandonment'
  | 'humiliation'
  | 'broken_promise'
  | 'gossip'
  | 'sabotage'
  | 'other'

export type ReminderFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
export type NotificationType = 'reminder' | 'system' | 'info'
export type FileType = 'image' | 'audio' | 'pdf' | 'screenshot' | 'other'

export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  email: string | null
  notifications_email: boolean
  notifications_frequency: string
  theme: string
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface Grudge {
  id: string
  user_id: string
  first_name: string
  last_name: string | null
  nickname: string | null
  phone: string | null
  email: string | null
  social_handle: string | null
  title: string
  description: string
  category: GrudgeCategory
  severity: number
  incident_date: string
  is_archived: boolean
  is_favorite: boolean
  created_at: string
  updated_at: string
  tags?: Tag[]
  uploads?: Upload[]
  reminders?: Reminder[]
}

export interface Upload {
  id: string
  user_id: string
  grudge_id: string
  file_name: string
  file_type: FileType
  file_size: number
  storage_path: string
  mime_type: string | null
  created_at: string
  signedUrl?: string
}

export interface Reminder {
  id: string
  user_id: string
  grudge_id: string
  title: string
  message: string | null
  frequency: ReminderFrequency
  custom_interval_days: number | null
  next_trigger_at: string
  last_triggered_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  grudge?: Pick<Grudge, 'id' | 'title' | 'first_name' | 'last_name'>
}

export interface Notification {
  id: string
  user_id: string
  grudge_id: string | null
  reminder_id: string | null
  title: string
  message: string
  type: NotificationType
  is_read: boolean
  created_at: string
}

export interface GrudgeFormData {
  first_name: string
  last_name?: string
  nickname?: string
  phone?: string
  email?: string
  social_handle?: string
  title: string
  description: string
  category: GrudgeCategory
  severity: number
  incident_date: string
  tag_ids?: string[]
}

export interface ReminderFormData {
  grudge_id: string
  title: string
  message?: string
  frequency: ReminderFrequency
  custom_interval_days?: number
  next_trigger_at: string
}

export interface GrudgeFilters {
  search?: string
  category?: GrudgeCategory | ''
  severity_min?: number
  severity_max?: number
  tag_ids?: string[]
  is_archived?: boolean
  is_favorite?: boolean
  sort?: 'newest' | 'oldest' | 'severity_high' | 'severity_low'
}

export interface DashboardStats {
  total_grudges: number
  archived_grudges: number
  favorite_grudges: number
  total_uploads: number
  avg_severity: number
  top_category: GrudgeCategory | null
}

export const GRUDGE_CATEGORIES: Record<GrudgeCategory, { label: string; emoji: string; color: string }> = {
  betrayal: { label: 'Trahison', emoji: '🗡️', color: 'text-red-400' },
  lies: { label: 'Mensonges', emoji: '🤥', color: 'text-orange-400' },
  theft: { label: 'Vol', emoji: '💸', color: 'text-yellow-400' },
  manipulation: { label: 'Manipulation', emoji: '🕸️', color: 'text-purple-400' },
  abandonment: { label: 'Abandon', emoji: '👻', color: 'text-blue-400' },
  humiliation: { label: 'Humiliation', emoji: '😤', color: 'text-pink-400' },
  broken_promise: { label: 'Promesse brisée', emoji: '💔', color: 'text-rose-400' },
  gossip: { label: 'Ragots', emoji: '🗣️', color: 'text-cyan-400' },
  sabotage: { label: 'Sabotage', emoji: '💣', color: 'text-amber-400' },
  other: { label: 'Autre', emoji: '⚡', color: 'text-gray-400' },
}

export const SEVERITY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Anecdotique', color: 'text-green-400' },
  2: { label: 'Mineur', color: 'text-lime-400' },
  3: { label: 'Irritant', color: 'text-yellow-400' },
  4: { label: 'Pénible', color: 'text-amber-400' },
  5: { label: 'Sérieux', color: 'text-orange-400' },
  6: { label: 'Grave', color: 'text-orange-500' },
  7: { label: 'Profond', color: 'text-red-400' },
  8: { label: 'Dévastateur', color: 'text-red-500' },
  9: { label: 'Impardonnable', color: 'text-red-600' },
  10: { label: 'Légendaire', color: 'text-purple-500' },
}

export const HUMOROUS_LOADING_MESSAGES = [
  "Chargement de vos traumatismes...",
  "Accès aux archives de la rancune...",
  "Consultation du livre des offenses...",
  "Inventaire des trahisons en cours...",
  "Le pardon reste optionnel...",
  "Calibrage du détecteur de traîtres...",
  "Synchronisation avec la mémoire infaillible...",
  "Vos rancunes méritent mieux que l'oubli...",
]
