import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null; // 'avatar' | 'cover'

    if (!file) return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 });
    if (!['avatar', 'cover'].includes(type ?? '')) return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) return NextResponse.json({ error: 'El archivo no puede superar 5MB' }, { status: 400 });

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) return NextResponse.json({ error: 'Formato no permitido' }, { status: 400 });

    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${type}/${user.id}.${ext}`;

    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    const { error: uploadError } = await supabase.storage
      .from('nexobio')
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 });

    const { data: { publicUrl } } = supabase.storage.from('nexobio').getPublicUrl(path);

    return NextResponse.json({ url: publicUrl });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
