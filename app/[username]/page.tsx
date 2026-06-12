'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, AlertTriangle, Eye, MousePointerClick, Users,
  Instagram, Twitter, Youtube, MoreHorizontal, ExternalLink, Flag
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { DbUser, DbProfile, DbLink } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ReportModal } from '@/components/report-modal';

interface ProfileData {
  user: DbUser;
  profile: DbProfile;
  links: DbLink[];
}

function SocialIcon({ platform }: { platform: string }) {
  const icons: Record<string, React.ReactNode> = {
    instagram: <Instagram className="w-5 h-5" />,
    twitter: <Twitter className="w-5 h-5" />,
    youtube: <Youtube className="w-5 h-5" />,
    tiktok: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.84 1.56V6.82a4.85 4.85 0 0 1-1.07-.13z"/></svg>,
    telegram: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.504-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>,
    onlyfans: <span className="text-xs font-bold">OF</span>,
  };
  return <>{icons[platform] ?? null}</>;
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showAdultModal, setShowAdultModal] = useState(false);
  const [adultConfirmed, setAdultConfirmed] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const loadProfile = useCallback(async () => {
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('*')
      .eq('username', username.toLowerCase())
      .single();

    if (userErr || !user) { setNotFound(true); setLoading(false); return; }

    if (user.is_suspended) { setNotFound(true); setLoading(false); return; }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!profile || !profile.is_public) { setNotFound(true); setLoading(false); return; }

    const { data: links } = await supabase
      .from('links')
      .select('*')
      .eq('profile_id', profile.id)
      .eq('is_active', true)
      .order('order', { ascending: true });

    setData({ user, profile, links: links ?? [] });

    // Check if +18 confirmation needed
    if (profile.is_adult) {
      const confirmed = localStorage.getItem(`adult_confirmed_${username}`) === 'true';
      if (!confirmed) setShowAdultModal(true);
      else setAdultConfirmed(true);
    }

    setLoading(false);

    // Track view
    fetch('/api/stats/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.toLowerCase() }),
    }).catch(() => {});
  }, [username]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleAdultConfirm = () => {
    localStorage.setItem(`adult_confirmed_${username}`, 'true');
    setAdultConfirmed(true);
    setShowAdultModal(false);
  };

  const handleLinkClick = async (link: DbLink) => {
    if (!data) return;
    fetch('/api/stats/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkId: link.id, profileId: data.profile.id }),
    }).catch(() => {});
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const getSocials = (profile: DbProfile) => {
    const socials = [
      { key: 'instagram', url: profile.social_instagram, label: 'Instagram' },
      { key: 'twitter', url: profile.social_twitter, label: 'Twitter' },
      { key: 'tiktok', url: profile.social_tiktok, label: 'TikTok' },
      { key: 'telegram', url: profile.social_telegram, label: 'Telegram' },
      { key: 'youtube', url: profile.social_youtube, label: 'YouTube' },
      { key: 'onlyfans', url: profile.social_onlyfans, label: 'OnlyFans' },
    ];
    return socials.filter(s => s.url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-bold text-white mb-4">Perfil no encontrado</h1>
        <p className="text-gray-400 mb-8">Este perfil no existe o no está disponible.</p>
        <Link href="/">
          <Button className="nexo-gradient text-white border-0">Volver al inicio</Button>
        </Link>
      </div>
    );
  }

  const { user, profile, links } = data;
  const primaryColor = profile.theme_primary_color || '#ec4899';
  const socials = getSocials(profile);
  const buttonStyle = profile.button_style ?? 'rounded';
  const borderRadius = {
    rounded: '0.75rem',
    pill: '9999px',
    square: '0.25rem',
    outline: '0.75rem',
  }[buttonStyle] ?? '0.75rem';

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: profile.theme_background?.startsWith('#')
          ? `linear-gradient(135deg, ${profile.theme_background}22, #0a0a0f)`
          : '#0a0a0f',
      }}
    >
      {/* Adult modal */}
      <AnimatePresence>
        {showAdultModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-strong rounded-3xl p-8 max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-pink-500/20 border-2 border-pink-500/40 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-pink-400">18+</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Este perfil es para adultos</h2>
              <p className="text-gray-400 mb-2">Este perfil puede contener contenido para adultos.</p>
              <p className="text-gray-400 mb-8 text-sm">Debes ser mayor de 18 años para entrar.</p>
              <div className="space-y-3">
                <Button
                  onClick={handleAdultConfirm}
                  className="w-full nexo-gradient text-white border-0 hover:opacity-90 h-12"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}
                >
                  Tengo 18 años o más
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="w-full border-white/15 text-gray-300 hover:bg-white/5 h-12"
                >
                  Salir
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cover */}
      <div className="relative h-52 md:h-64 overflow-hidden">
        {profile.cover_url ? (
          <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: `linear-gradient(135deg, ${primaryColor}33, #0a0a0f)` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#0a0a0f]" />

        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity">
            <div className="w-6 h-6 nexo-gradient rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">N</span>
            </div>
            <span className="text-white text-sm font-semibold">NexoBio</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 bg-black/30 text-white hover:bg-white/10 backdrop-blur-sm text-xs h-8"
              onClick={() => setShowReport(true)}
            >
              <Flag className="w-3 h-3 mr-1" />
              Reportar
            </Button>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/20 bg-black/30 text-white hover:bg-white/10 backdrop-blur-sm"
              onClick={() => setShowReport(true)}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile info */}
      <div className="max-w-lg mx-auto px-4 -mt-16 relative z-10 pb-16">
        {/* Avatar */}
        <div className="mb-4">
          <div
            className="w-24 h-24 rounded-full border-4 overflow-hidden bg-gray-800 shadow-xl"
            style={{ borderColor: primaryColor }}
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white" style={{ background: `${primaryColor}44` }}>
                {(profile.display_name || user.username)[0]?.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Name and info */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">{profile.display_name || user.username}</h1>
            {user.is_verified && (
              <CheckCircle className="w-5 h-5 fill-blue-500 text-white flex-shrink-0" />
            )}
            {profile.is_adult && (
              <span className="text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded-full">
                18+
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm mb-2">@{user.username}</p>
          {profile.bio && <p className="text-gray-300 text-sm mb-2 leading-relaxed">{profile.bio}</p>}
          {profile.headline && (
            <p className="text-sm font-medium" style={{ color: primaryColor }}>{profile.headline}</p>
          )}
        </div>

        {/* Socials */}
        {socials.length > 0 && (
          <div className="flex gap-3 mb-6 flex-wrap">
            {socials.map((social) => (
              <a
                key={social.key}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all hover:scale-110"
                style={{ background: `${primaryColor}20`, border: `1px solid ${primaryColor}30` }}
              >
                <SocialIcon platform={social.key} />
              </a>
            ))}
          </div>
        )}

        {/* Links */}
        {(!profile.is_adult || adultConfirmed) && (
          <div className="space-y-3 mb-8">
            {links.map((link, i) => (
              <motion.button
                key={link.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => handleLinkClick(link)}
                className="w-full flex items-center gap-3 p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98] group"
                style={{
                  background: buttonStyle === 'outline'
                    ? 'transparent'
                    : `${link.color || primaryColor}18`,
                  border: `1px solid ${link.color || primaryColor}${buttonStyle === 'outline' ? '70' : '30'}`,
                  borderRadius,
                }}
              >
                <div
                  className="w-10 h-10 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                  style={{ background: link.color || primaryColor, borderRadius: '0.5rem' }}
                >
                  {link.icon ? (
                    <span className="text-base">{link.icon}</span>
                  ) : (
                    <ExternalLink className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{link.title}</p>
                  {link.description && (
                    <p className="text-gray-400 text-xs truncate">{link.description}</p>
                  )}
                </div>
                <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors flex-shrink-0" />
              </motion.button>
            ))}

            {links.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-8">No hay enlaces disponibles.</p>
            )}
          </div>
        )}

        {/* Stats */}
        <div
          className="rounded-2xl p-4 grid grid-cols-3 gap-4 text-center mb-8"
          style={{ background: `${primaryColor}10`, border: `1px solid ${primaryColor}20` }}
        >
          <div>
            <div className="flex items-center justify-center gap-1 mb-1" style={{ color: primaryColor }}>
              <Eye className="w-4 h-4" />
              <span className="font-bold">{profile.total_views >= 1000 ? `${(profile.total_views / 1000).toFixed(1)}K` : profile.total_views}</span>
            </div>
            <p className="text-xs text-gray-500">Visitas totales</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 mb-1" style={{ color: primaryColor }}>
              <MousePointerClick className="w-4 h-4" />
              <span className="font-bold">{profile.total_clicks >= 1000 ? `${(profile.total_clicks / 1000).toFixed(1)}K` : profile.total_clicks}</span>
            </div>
            <p className="text-xs text-gray-500">Clics totales</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 mb-1" style={{ color: primaryColor }}>
              <Users className="w-4 h-4" />
              <span className="font-bold">{links.length}</span>
            </div>
            <p className="text-xs text-gray-500">Links activos</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mb-3">
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Términos</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacidad</Link>
            <span>•</span>
            <button onClick={() => setShowReport(true)} className="hover:text-gray-300 transition-colors">
              Reportar perfil
            </button>
          </div>
          <Link href="/" className="inline-flex items-center gap-1.5 opacity-50 hover:opacity-80 transition-opacity">
            <div className="w-4 h-4 nexo-gradient rounded flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">N</span>
            </div>
            <span className="text-xs text-gray-400">Crea tu NexoBio gratis</span>
          </Link>
          <p className="text-xs text-gray-600 mt-1">© {new Date().getFullYear()} NexoBio. Todos los derechos reservados.</p>
        </div>
      </div>

      {/* Report modal */}
      <ReportModal
        username={username}
        open={showReport}
        onClose={() => setShowReport(false)}
      />
    </div>
  );
}
