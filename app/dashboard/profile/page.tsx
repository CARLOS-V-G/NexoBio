'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Save, Instagram, Twitter, Youtube, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { apiPatch, getAuthHeaders } from '@/lib/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';

const schema = z.object({
  display_name: z.string().min(1, 'Requerido').max(60),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_.-]+$/),
  bio: z.string().max(300).optional(),
  headline: z.string().max(160).optional(),
  social_instagram: z.string().optional(),
  social_twitter: z.string().optional(),
  social_tiktok: z.string().optional(),
  social_telegram: z.string().optional(),
  social_youtube: z.string().optional(),
  social_onlyfans: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const { dbUser, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [isAdult, setIsAdult] = useState(profile?.is_adult ?? false);
  const [isPublic, setIsPublic] = useState(profile?.is_public ?? true);
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      display_name: profile?.display_name ?? '',
      username: dbUser?.username ?? '',
      bio: profile?.bio ?? '',
      headline: profile?.headline ?? '',
      social_instagram: profile?.social_instagram ?? '',
      social_twitter: profile?.social_twitter ?? '',
      social_tiktok: profile?.social_tiktok ?? '',
      social_telegram: profile?.social_telegram ?? '',
      social_youtube: profile?.social_youtube ?? '',
      social_onlyfans: profile?.social_onlyfans ?? '',
    },
  });

  const uploadImage = async (file: File, type: 'avatar' | 'cover') => {
    const setter = type === 'avatar' ? setUploadingAvatar : setUploadingCover;
    setter(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) { toast.error(result.error ?? 'Error al subir imagen'); return; }

      const field = type === 'avatar' ? 'avatar_url' : 'cover_url';
      const { ok, data } = await apiPatch('/api/profile', { [field]: result.url });
      if (!ok) { toast.error(data.error ?? 'Error al guardar'); return; }

      await refreshProfile();
      toast.success(`${type === 'avatar' ? 'Avatar' : 'Portada'} actualizado`);
    } finally {
      setter(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const payload = { ...data, is_adult: isAdult, is_public: isPublic };
      const { ok, data: result } = await apiPatch('/api/profile', payload);
      if (!ok) { toast.error(result.error ?? 'Error al guardar'); return; }
      await refreshProfile();
      toast.success('Perfil guardado correctamente');
    } finally {
      setLoading(false);
    }
  };

  if (!profile || !dbUser) return null;

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Mi perfil</h1>
          <p className="text-gray-400 text-sm">Edita la información de tu perfil público.</p>
        </div>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
          className="nexo-gradient text-white border-0 hover:opacity-90 gap-2"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Images */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-4">Imágenes</h2>

          {/* Cover */}
          <div className="mb-6">
            <Label className="text-gray-300 text-sm mb-2 block">Portada</Label>
            <div className="relative h-32 rounded-xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer hover:border-pink-500/40 transition-colors" onClick={() => coverRef.current?.click()}>
              {profile.cover_url ? (
                <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Clic para subir portada</p>
                    <p className="text-xs text-gray-600">Recomendado: 1080x360px</p>
                  </div>
                </div>
              )}
              {uploadingCover && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
              {profile.cover_url && (
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
            <input
              type="file"
              ref={coverRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], 'cover')}
            />
          </div>

          {/* Avatar */}
          <div>
            <Label className="text-gray-300 text-sm mb-2 block">Avatar</Label>
            <div className="flex items-center gap-4">
              <div
                className="relative w-20 h-20 rounded-full overflow-hidden bg-white/5 border-2 border-white/10 cursor-pointer hover:border-pink-500/40 transition-colors flex-shrink-0"
                onClick={() => avatarRef.current?.click()}
              >
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full nexo-gradient flex items-center justify-center text-white font-bold text-xl">
                    {profile.display_name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-300 mb-1">Foto de perfil</p>
                <p className="text-xs text-gray-500">Recomendado: 512x512px. Máx 5MB.</p>
              </div>
            </div>
            <input
              type="file"
              ref={avatarRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], 'avatar')}
            />
          </div>
        </div>

        {/* Basic info */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-white">Información básica</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300 text-sm mb-1.5 block">Nombre público</Label>
              <Input
                {...register('display_name')}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-pink-500"
              />
              {errors.display_name && <p className="text-red-400 text-xs mt-1">{errors.display_name.message}</p>}
            </div>

            <div>
              <Label className="text-gray-300 text-sm mb-1.5 block">Username</Label>
              <Input
                {...register('username')}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-pink-500"
              />
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
            </div>
          </div>

          <div>
            <Label className="text-gray-300 text-sm mb-1.5 block">Bio</Label>
            <Textarea
              {...register('bio')}
              placeholder="Cuéntale a tus seguidores sobre ti..."
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-pink-500 resize-none h-24"
              maxLength={300}
            />
          </div>

          <div>
            <Label className="text-gray-300 text-sm mb-1.5 block">Texto destacado</Label>
            <Input
              {...register('headline')}
              placeholder="Ej: I'm waiting for you... link below 👇"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-pink-500"
            />
          </div>
        </div>

        {/* Profile config */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-white">Configuración del perfil</h2>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-white text-sm font-medium">Perfil público</p>
              <p className="text-gray-400 text-xs">Tu perfil será visible para todos.</p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
              className="data-[state=checked]:bg-pink-500"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-white/5">
            <div>
              <p className="text-white text-sm font-medium">Perfil +18</p>
              <p className="text-gray-400 text-xs">Muestra advertencia de edad antes de entrar.</p>
            </div>
            <Switch
              checked={isAdult}
              onCheckedChange={setIsAdult}
              className="data-[state=checked]:bg-pink-500"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-white/5">
            <div>
              <p className="text-white text-sm font-medium">Mostrar badge verificado</p>
              <p className="text-gray-400 text-xs">Aparece el check azul en tu perfil.</p>
            </div>
            <Switch
              checked={dbUser.is_verified}
              disabled
              className="data-[state=checked]:bg-blue-500 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Social links */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-white">Redes sociales</h2>
          <p className="text-gray-400 text-sm">Conecta tus redes sociales (opcionales).</p>

          {[
            { key: 'social_instagram', label: 'Instagram', placeholder: 'https://instagram.com/tuusuario', icon: '📸' },
            { key: 'social_twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/tuusuario', icon: '🐦' },
            { key: 'social_tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@tuusuario', icon: '🎵' },
            { key: 'social_telegram', label: 'Telegram', placeholder: 'https://t.me/tuusuario', icon: '✈️' },
            { key: 'social_youtube', label: 'YouTube', placeholder: 'https://youtube.com/@tucanal', icon: '▶️' },
            { key: 'social_onlyfans', label: 'OnlyFans', placeholder: 'https://onlyfans.com/tuusuario', icon: '🔞' },
          ].map((social) => (
            <div key={social.key}>
              <Label className="text-gray-300 text-sm mb-1.5 block">
                {social.icon} {social.label}
              </Label>
              <Input
                {...register(social.key as keyof FormData)}
                placeholder={social.placeholder}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-pink-500"
              />
            </div>
          ))}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full nexo-gradient text-white border-0 hover:opacity-90 h-12 text-base"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Guardando...
            </span>
          ) : 'Guardar cambios'}
        </Button>
      </form>
    </div>
  );
}
