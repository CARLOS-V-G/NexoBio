import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';
import { RESERVED_USERNAMES, sanitizeUrl } from '@/lib/types';

const profileSchema = z.object({
  display_name: z.string().min(1).max(60).optional(),
  bio: z.string().max(300).optional(),
  headline: z.string().max(160).optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
  cover_url: z.string().url().optional().or(z.literal('')),
  is_adult: z.boolean().optional(),
  is_public: z.boolean().optional(),
  theme_primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  theme_text_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  theme_background: z.string().optional(),
  button_style: z.enum(['rounded', 'pill', 'square', 'outline']).optional(),
  social_instagram: z.string().max(200).optional().or(z.literal('')),
  social_twitter: z.string().max(200).optional().or(z.literal('')),
  social_tiktok: z.string().max(200).optional().or(z.literal('')),
  social_telegram: z.string().max(200).optional().or(z.literal('')),
  social_youtube: z.string().max(200).optional().or(z.literal('')),
  social_onlyfans: z.string().max(200).optional().or(z.literal('')),
});

const usernameSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_.-]+$/),
});

async function getAuthUser(req: NextRequest) {
  const supabase = createServerClient();
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const body = await req.json();

    // Handle username change separately
    if (body.username !== undefined) {
      const parsed = usernameSchema.safeParse({ username: body.username });
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
      }
      const newUsername = parsed.data.username.toLowerCase();
      if (RESERVED_USERNAMES.includes(newUsername)) {
        return NextResponse.json({ error: 'Username no disponible' }, { status: 400 });
      }
      const supabase = createServerClient();
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', newUsername)
        .neq('id', user.id)
        .maybeSingle();
      if (existing) {
        return NextResponse.json({ error: 'Username ya en uso' }, { status: 400 });
      }
      await supabase.from('users').update({ username: newUsername, updated_at: new Date().toISOString() }).eq('id', user.id);
    }

    // Sanitize social URLs if provided
    const sanitized = { ...body };
    const socialKeys = ['social_instagram', 'social_twitter', 'social_tiktok', 'social_telegram', 'social_youtube', 'social_onlyfans'];
    for (const key of socialKeys) {
      if (sanitized[key]) {
        const safe = sanitizeUrl(sanitized[key]);
        if (!safe) sanitized[key] = '';
        else sanitized[key] = safe;
      }
    }

    const parsed = profileSchema.safeParse(sanitized);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
