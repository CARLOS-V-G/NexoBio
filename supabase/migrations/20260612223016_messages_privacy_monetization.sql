
-- Conversations (messaging system)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  visitor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  visitor_name TEXT DEFAULT 'Anónimo',
  visitor_email TEXT DEFAULT '',
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  unread_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Privacy settings (geo-blocking, VPN blocking etc)
CREATE TABLE IF NOT EXISTS public.privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  block_vpn BOOLEAN NOT NULL DEFAULT FALSE,
  block_proxy BOOLEAN NOT NULL DEFAULT FALSE,
  block_tor BOOLEAN NOT NULL DEFAULT FALSE,
  country_mode TEXT NOT NULL DEFAULT 'none' CHECK (country_mode IN ('none', 'whitelist', 'blacklist')),
  country_list TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscribers (fan subscriptions)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  subscriber_name TEXT DEFAULT '',
  subscriber_email TEXT DEFAULT '',
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'premium')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments / tips
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  payer_name TEXT DEFAULT 'Anónimo',
  payer_email TEXT DEFAULT '',
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  type TEXT NOT NULL DEFAULT 'tip' CHECK (type IN ('tip', 'subscription', 'one_time', 'custom')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  provider TEXT DEFAULT 'stripe',
  external_id TEXT DEFAULT '',
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Conversations RLS
CREATE POLICY "conv_select_creator" ON public.conversations FOR SELECT TO authenticated
  USING (creator_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN','MODERATOR')));
CREATE POLICY "conv_insert_anon" ON public.conversations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "conv_insert_auth" ON public.conversations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "conv_update_creator" ON public.conversations FOR UPDATE TO authenticated
  USING (creator_id = auth.uid()) WITH CHECK (creator_id = auth.uid());
CREATE POLICY "conv_delete_creator" ON public.conversations FOR DELETE TO authenticated
  USING (creator_id = auth.uid());

-- Messages RLS
CREATE POLICY "msg_select_conv" ON public.messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND creator_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN','MODERATOR')));
CREATE POLICY "msg_insert_anon" ON public.messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "msg_insert_auth" ON public.messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "msg_delete_creator" ON public.messages FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND creator_id = auth.uid()));

-- Privacy settings RLS
CREATE POLICY "privacy_select_own" ON public.privacy_settings FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid()));
CREATE POLICY "privacy_insert_own" ON public.privacy_settings FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid()));
CREATE POLICY "privacy_update_own" ON public.privacy_settings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid()));
CREATE POLICY "privacy_delete_own" ON public.privacy_settings FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_id AND user_id = auth.uid()));

-- Subscriptions RLS
CREATE POLICY "subs_select_creator" ON public.subscriptions FOR SELECT TO authenticated
  USING (creator_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN','MODERATOR')));
CREATE POLICY "subs_insert_auth" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "subs_update_creator" ON public.subscriptions FOR UPDATE TO authenticated
  USING (creator_id = auth.uid()) WITH CHECK (creator_id = auth.uid());
CREATE POLICY "subs_delete_creator" ON public.subscriptions FOR DELETE TO authenticated
  USING (creator_id = auth.uid());

-- Payments RLS
CREATE POLICY "pay_select_creator" ON public.payments FOR SELECT TO authenticated
  USING (creator_id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN','MODERATOR')));
CREATE POLICY "pay_insert_auth" ON public.payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "pay_delete_creator" ON public.payments FOR DELETE TO authenticated
  USING (creator_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_creator ON public.conversations(creator_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_creator ON public.subscriptions(creator_id);
CREATE INDEX IF NOT EXISTS idx_payments_creator ON public.payments(creator_id);
CREATE INDEX IF NOT EXISTS idx_payments_created ON public.payments(created_at);
