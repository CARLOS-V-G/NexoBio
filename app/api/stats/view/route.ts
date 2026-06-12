import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';
import { hashIp } from '@/lib/types';

const viewSchema = z.object({
  username: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = viewSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });

    const supabase = createServerClient();

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('username', parsed.data.username.toLowerCase())
      .single();

    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? req.headers.get('x-real-ip')
      ?? 'unknown';

    const ipHash = hashIp(ip);
    const userAgent = req.headers.get('user-agent') ?? '';

    await Promise.all([
      supabase.from('profile_views').insert({
        profile_id: profile.id,
        ip_hash: ipHash,
        user_agent: userAgent.substring(0, 255),
      }),
      supabase.rpc('increment_view', { profile_id_param: profile.id }),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
