import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';

async function requireAdmin(req: NextRequest) {
  const supabase = createServerClient();
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return null;
  const { data } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (!data || !['ADMIN', 'MODERATOR'].includes(data.role)) return null;
  return user;
}

const actionSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(['suspend', 'unsuspend', 'verify', 'unverify']),
});

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') ?? '';
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = 20;
  const from = (page - 1) * limit;

  let query = supabase
    .from('users')
    .select('*, profiles(display_name, avatar_url, is_adult, is_public, total_views, total_clicks)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (search) {
    query = query.or(`email.ilike.%${search}%,username.ilike.%${search}%`);
  }

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ users: data, total: count });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });

    const supabase = createServerClient();
    const { userId, action } = parsed.data;

    const updates: Record<string, boolean> = {};
    if (action === 'suspend') updates.is_suspended = true;
    if (action === 'unsuspend') updates.is_suspended = false;
    if (action === 'verify') updates.is_verified = true;
    if (action === 'unverify') updates.is_verified = false;

    const { error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
