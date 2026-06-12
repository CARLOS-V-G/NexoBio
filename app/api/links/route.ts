import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';
import { sanitizeUrl } from '@/lib/types';

const linkSchema = z.object({
  title: z.string().min(1, 'Título requerido').max(80),
  url: z.string().url('URL inválida'),
  description: z.string().max(160).optional().default(''),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().default('#ec4899'),
  icon: z.string().max(50).optional().default(''),
  is_active: z.boolean().optional().default(true),
});

const updateLinkSchema = linkSchema.partial();

async function getAuthUserAndProfile(req: NextRequest) {
  const supabase = createServerClient();
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
  if (!profile) return null;
  return { userId: user.id, profileId: profile.id };
}

export async function GET(req: NextRequest) {
  const auth = await getAuthUserAndProfile(req);
  if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('profile_id', auth.profileId)
    .order('order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUserAndProfile(req);
  if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = linkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const safeUrl = sanitizeUrl(parsed.data.url);
    if (!safeUrl) return NextResponse.json({ error: 'URL no permitida' }, { status: 400 });

    const supabase = createServerClient();
    const { data: existing } = await supabase
      .from('links')
      .select('order')
      .eq('profile_id', auth.profileId)
      .order('order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder = (existing?.order ?? -1) + 1;

    const { data, error } = await supabase
      .from('links')
      .insert({ ...parsed.data, url: safeUrl, profile_id: auth.profileId, order: nextOrder })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuthUserAndProfile(req);
  if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    if (rest.url) {
      const safeUrl = sanitizeUrl(rest.url);
      if (!safeUrl) return NextResponse.json({ error: 'URL no permitida' }, { status: 400 });
      rest.url = safeUrl;
    }

    const parsed = updateLinkSchema.safeParse(rest);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('links')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('profile_id', auth.profileId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await getAuthUserAndProfile(req);
  if (!auth) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  const supabase = createServerClient();
  const { error } = await supabase
    .from('links')
    .delete()
    .eq('id', id)
    .eq('profile_id', auth.profileId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
