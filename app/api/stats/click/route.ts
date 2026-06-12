import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';
import { hashIp } from '@/lib/types';

const clickSchema = z.object({
  linkId: z.string().uuid(),
  profileId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = clickSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });

    const supabase = createServerClient();

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? req.headers.get('x-real-ip')
      ?? 'unknown';
    const ipHash = hashIp(ip);
    const userAgent = req.headers.get('user-agent') ?? '';

    await supabase.from('link_clicks').insert({
      link_id: parsed.data.linkId,
      profile_id: parsed.data.profileId,
      ip_hash: ipHash,
      user_agent: userAgent.substring(0, 255),
    });

    await supabase.rpc('increment_click', { link_id_param: parsed.data.linkId });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
