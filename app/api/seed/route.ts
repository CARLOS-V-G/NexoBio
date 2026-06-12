import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-seed-secret');
  if (secret !== process.env.SEED_SECRET && secret !== 'nexobio-seed-2024') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const supabase = createServerClient();

  try {
    const demoUsers = [
      {
        email: 'kumiho@demo.nexobio.com',
        password: 'Demo@1234',
        username: 'kumiho',
        display_name: 'Kumiho',
      },
      {
        email: 'admin@nexobio.com',
        password: 'Admin@1234',
        username: 'nexoadmin',
        display_name: 'Admin NexoBio',
      },
    ];

    const results = [];

    for (const u of demoUsers) {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', u.username)
        .maybeSingle();

      if (existing) {
        results.push({ username: u.username, status: 'already_exists' });
        continue;
      }

      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { username: u.username, display_name: u.display_name },
      });

      if (error) {
        results.push({ username: u.username, status: 'error', error: error.message });
        continue;
      }

      // Wait for trigger
      await new Promise(r => setTimeout(r, 500));

      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', data.user.id)
        .single();

      if (profile) {
        // Update profile
        await supabase.from('profiles').update({
          display_name: u.display_name,
          bio: u.username === 'kumiho' ? 'Content creator 🔥 Your exclusive content is waiting' : 'NexoBio Administrator',
          headline: u.username === 'kumiho' ? "I'm waiting for you... link below 👇" : '',
          is_adult: u.username === 'kumiho',
          is_public: true,
          theme_primary_color: '#ec4899',
          social_instagram: u.username === 'kumiho' ? 'https://instagram.com' : '',
          social_twitter: u.username === 'kumiho' ? 'https://twitter.com' : '',
          social_tiktok: u.username === 'kumiho' ? 'https://tiktok.com' : '',
          social_telegram: u.username === 'kumiho' ? 'https://t.me' : '',
        }).eq('id', profile.id);

        // Create demo links for kumiho
        if (u.username === 'kumiho') {
          const demoLinks = [
            { title: 'My exclusive content', url: 'https://nexobio.com', description: 'Undress me 🤩', color: '#ec4899', icon: '❤️', order: 0 },
            { title: 'Join my OnlyFans', url: 'https://onlyfans.com', description: 'Exclusive photos & videos', color: '#00AFF0', icon: 'OF', order: 1 },
            { title: 'Private Telegram', url: 'https://t.me', description: 'Hot content every day', color: '#2AABEE', icon: '✈️', order: 2 },
            { title: 'Instagram', url: 'https://instagram.com', description: 'My daily life', color: '#E1306C', icon: '📸', order: 3 },
            { title: 'Custom videos', url: 'https://nexobio.com', description: 'Order your custom video', color: '#FF4500', icon: '🎬', order: 4 },
            { title: 'Tip me', url: 'https://nexobio.com', description: 'Support me ❤️', color: '#22c55e', icon: '💚', order: 5 },
          ];

          await supabase.from('links').insert(
            demoLinks.map(l => ({ ...l, profile_id: profile.id, is_active: true }))
          );

          // Simulate some stats
          await supabase.from('profiles').update({
            total_views: 125600,
            total_clicks: 8200,
          }).eq('id', profile.id);
        }

        // Make admin user ADMIN role
        if (u.username === 'nexoadmin') {
          await supabase.from('users').update({ role: 'ADMIN' }).eq('id', data.user.id);
        }
      }

      results.push({ username: u.username, status: 'created' });
    }

    return NextResponse.json({ success: true, results });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
