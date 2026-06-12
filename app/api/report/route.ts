import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';

const reportSchema = z.object({
  username: z.string().min(1),
  reason: z.enum(['illegal_content', 'minor', 'non_consensual', 'spam', 'fraud', 'other']),
  description: z.string().max(500).optional().default(''),
  reporter_email: z.string().email().optional().or(z.literal('')).default(''),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

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

    const { error } = await supabase.from('reports').insert({
      profile_id: profile.id,
      reason: parsed.data.reason,
      description: parsed.data.description,
      reporter_email: parsed.data.reporter_email,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
