-- ============================================================
-- GrudgeVault - Supabase PostgreSQL Schema
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- ============================================================
-- PROFILES TABLE (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  notifications_email BOOLEAN DEFAULT true,
  notifications_frequency TEXT DEFAULT 'daily' CHECK (notifications_frequency IN ('daily', 'weekly', 'monthly', 'custom')),
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TAGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#8b5cf6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- ============================================================
-- GRUDGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.grudges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Person info
  first_name TEXT NOT NULL,
  last_name TEXT,
  nickname TEXT,
  phone TEXT,
  email TEXT,
  social_handle TEXT,

  -- Grudge details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'betrayal', 'lies', 'theft', 'manipulation', 'abandonment',
    'humiliation', 'broken_promise', 'gossip', 'sabotage', 'other'
  )),
  severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 10),
  incident_date DATE NOT NULL,

  -- Metadata
  is_archived BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  search_vector TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(title, '') || ' ' || coalesce(description, ''))
  ) STORED,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GRUDGE_TAGS (junction table)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.grudge_tags (
  grudge_id UUID REFERENCES public.grudges(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (grudge_id, tag_id)
);

-- ============================================================
-- UPLOADS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.uploads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  grudge_id UUID REFERENCES public.grudges(id) ON DELETE CASCADE NOT NULL,

  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'audio', 'pdf', 'screenshot', 'other')),
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REMINDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  grudge_id UUID REFERENCES public.grudges(id) ON DELETE CASCADE NOT NULL,

  title TEXT NOT NULL,
  message TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('once', 'daily', 'weekly', 'monthly', 'yearly', 'custom')),
  custom_interval_days INTEGER,
  next_trigger_at TIMESTAMPTZ NOT NULL,
  last_triggered_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  grudge_id UUID REFERENCES public.grudges(id) ON DELETE SET NULL,
  reminder_id UUID REFERENCES public.reminders(id) ON DELETE SET NULL,

  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'reminder' CHECK (type IN ('reminder', 'system', 'info')),
  is_read BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_grudges_user_id ON public.grudges(user_id);
CREATE INDEX IF NOT EXISTS idx_grudges_search_vector ON public.grudges USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_grudges_severity ON public.grudges(severity DESC);
CREATE INDEX IF NOT EXISTS idx_grudges_incident_date ON public.grudges(incident_date DESC);
CREATE INDEX IF NOT EXISTS idx_grudges_category ON public.grudges(category);
CREATE INDEX IF NOT EXISTS idx_grudges_is_archived ON public.grudges(is_archived);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON public.tags(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_grudge_id ON public.uploads(grudge_id);
CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON public.uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_next_trigger ON public.reminders(next_trigger_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read) WHERE is_read = false;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grudges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grudge_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- TAGS policies
CREATE POLICY "Users can CRUD own tags" ON public.tags FOR ALL USING (auth.uid() = user_id);

-- GRUDGES policies
CREATE POLICY "Users can CRUD own grudges" ON public.grudges FOR ALL USING (auth.uid() = user_id);

-- GRUDGE_TAGS policies
CREATE POLICY "Users can manage own grudge tags" ON public.grudge_tags FOR ALL
  USING (EXISTS (SELECT 1 FROM public.grudges g WHERE g.id = grudge_id AND g.user_id = auth.uid()));

-- UPLOADS policies
CREATE POLICY "Users can CRUD own uploads" ON public.uploads FOR ALL USING (auth.uid() = user_id);

-- REMINDERS policies
CREATE POLICY "Users can CRUD own reminders" ON public.reminders FOR ALL USING (auth.uid() = user_id);

-- NOTIFICATIONS policies
CREATE POLICY "Users can view/update own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at automatically
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_grudges_updated_at BEFORE UPDATE ON public.grudges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON public.reminders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- STORAGE BUCKETS (run in Supabase dashboard)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('grudge-media', 'grudge-media', false);
--
-- CREATE POLICY "Users can upload own media" ON storage.objects
--   FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
--
-- CREATE POLICY "Users can view own media" ON storage.objects
--   FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);
--
-- CREATE POLICY "Users can delete own media" ON storage.objects
--   FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
