
-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'MODERATOR', 'ADMIN')),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  bio TEXT DEFAULT '',
  headline TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  cover_url TEXT DEFAULT '',
  is_adult BOOLEAN NOT NULL DEFAULT FALSE,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  theme_primary_color TEXT NOT NULL DEFAULT '#ec4899',
  theme_text_color TEXT NOT NULL DEFAULT '#ffffff',
  theme_background TEXT NOT NULL DEFAULT 'dark',
  button_style TEXT NOT NULL DEFAULT 'rounded',
  social_instagram TEXT DEFAULT '',
  social_twitter TEXT DEFAULT '',
  social_tiktok TEXT DEFAULT '',
  social_telegram TEXT DEFAULT '',
  social_youtube TEXT DEFAULT '',
  social_onlyfans TEXT DEFAULT '',
  total_views BIGINT NOT NULL DEFAULT 0,
  total_clicks BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Links table
CREATE TABLE IF NOT EXISTS public.links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT DEFAULT '',
  "order" INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  color TEXT NOT NULL DEFAULT '#ec4899',
  icon TEXT DEFAULT '',
  click_count BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profile views table
CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ip_hash TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  country TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Link clicks table
CREATE TABLE IF NOT EXISTS public.link_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ip_hash TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('illegal_content', 'minor', 'non_consensual', 'spam', 'fraud', 'other')),
  description TEXT DEFAULT '',
  reporter_email TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'DISMISSED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Users RLS policies
CREATE POLICY "users_select_own" ON public.users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "users_delete_own" ON public.users FOR DELETE TO authenticated USING (auth.uid() = id);
CREATE POLICY "users_select_public" ON public.users FOR SELECT TO anon USING (true);
CREATE POLICY "users_admin_all" ON public.users FOR ALL TO service_role USING (true);

-- Profiles RLS policies
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT TO anon USING (is_public = true);
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR is_public = true OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'MODERATOR'))
);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'MODERATOR'))
) WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'MODERATOR'))
);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL TO service_role USING (true);

-- Links RLS policies
CREATE POLICY "links_select_public" ON public.links FOR SELECT TO anon USING (
  is_active = true AND EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND is_public = true)
);
CREATE POLICY "links_select_own" ON public.links FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND (user_id = auth.uid() OR is_public = true))
  OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'MODERATOR'))
);
CREATE POLICY "links_insert_own" ON public.links FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
);
CREATE POLICY "links_update_own" ON public.links FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'MODERATOR'))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'MODERATOR'))
);
CREATE POLICY "links_delete_own" ON public.links FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'MODERATOR'))
);
CREATE POLICY "links_admin_all" ON public.links FOR ALL TO service_role USING (true);

-- Profile views - allow inserts from anon and select by owner
CREATE POLICY "views_insert_anon" ON public.profile_views FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "views_insert_auth" ON public.profile_views FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "views_select_own" ON public.profile_views FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'MODERATOR'))
);
CREATE POLICY "views_admin_all" ON public.profile_views FOR ALL TO service_role USING (true);

-- Link clicks - allow inserts from anon and select by owner
CREATE POLICY "clicks_insert_anon" ON public.link_clicks FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "clicks_insert_auth" ON public.link_clicks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "clicks_select_own" ON public.link_clicks FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'MODERATOR'))
);
CREATE POLICY "clicks_admin_all" ON public.link_clicks FOR ALL TO service_role USING (true);

-- Reports
CREATE POLICY "reports_insert_anon" ON public.reports FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "reports_insert_auth" ON public.reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "reports_select_admin" ON public.reports FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'MODERATOR'))
);
CREATE POLICY "reports_update_admin" ON public.reports FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'MODERATOR'))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'MODERATOR'))
);
CREATE POLICY "reports_admin_all" ON public.reports FOR ALL TO service_role USING (true);

-- Function to auto-create user record after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
  );

  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1))
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_links_profile_id ON public.links(profile_id);
CREATE INDEX IF NOT EXISTS idx_links_order ON public.links(profile_id, "order");
CREATE INDEX IF NOT EXISTS idx_views_profile_id ON public.profile_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_views_created_at ON public.profile_views(created_at);
CREATE INDEX IF NOT EXISTS idx_clicks_profile_id ON public.link_clicks(profile_id);
CREATE INDEX IF NOT EXISTS idx_clicks_link_id ON public.link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_clicks_created_at ON public.link_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_profile_id ON public.reports(profile_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
