import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { RESERVED_USERNAMES } from '@/lib/types';

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(30, 'Máximo 30 caracteres')
    .regex(/^[a-z0-9_.-]+$/, 'Solo letras minúsculas, números, puntos, guiones y guiones bajos'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  display_name: z.string().min(1, 'Requerido').max(60, 'Máximo 60 caracteres'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { email, username, password, display_name } = parsed.data;
    const lowerUsername = username.toLowerCase();

    if (RESERVED_USERNAMES.includes(lowerUsername)) {
      return NextResponse.json({ error: 'Este username no está disponible' }, { status: 400 });
    }

    // Use service role if available, otherwise anon key for checking username
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabaseCheck = createClient(supabaseUrl, serviceKey ?? supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const { data: existingUser } = await supabaseCheck
      .from('users')
      .select('id')
      .eq('username', lowerUsername)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json({ error: 'Este username ya está en uso' }, { status: 400 });
    }

    // Use anon client for signUp (works without service role)
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabaseAnon.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: lowerUsername,
          display_name,
        },
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already exists')) {
        return NextResponse.json({ error: 'Este email ya está registrado' }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data.user) {
      return NextResponse.json({ error: 'Error al crear la cuenta' }, { status: 400 });
    }

    return NextResponse.json({ success: true, userId: data.user.id });
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
