import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';

const reorderSchema = z.object({
  orderedIds: z.array(z.string().uuid()),
});

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
  if (!profile) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });

  try {
    const body = await req.json();
    const parsed = reorderSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });

    const updates = parsed.data.orderedIds.map((id, index) =>
      supabase.from('links').update({ order: index }).eq('id', id).eq('profile_id', profile.id)
    );

    await Promise.all(updates);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
