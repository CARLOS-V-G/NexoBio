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

const updateSchema = z.object({
  reportId: z.string().uuid(),
  status: z.enum(['PENDING', 'REVIEWED', 'DISMISSED']),
});

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  let query = supabase
    .from('reports')
    .select('*, profiles(display_name, avatar_url, users(username, email))')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });

    const supabase = createServerClient();
    const { error } = await supabase
      .from('reports')
      .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
      .eq('id', parsed.data.reportId);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
