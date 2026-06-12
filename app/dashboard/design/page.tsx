'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Eye, ExternalLink, CheckCircle, Palette, Type, Layout, Sparkles, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { apiPatch } from '@/lib/use-api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { ButtonStyle } from '@/lib/types';
import Link from 'next/link';

const buttonStyles: { value: ButtonStyle; label: string; className: string }[] = [
  { value: 'rounded', label: 'Redondeado', className: 'rounded-xl' },
  { value: 'pill', label: 'Píldora', className: 'rounded-full' },
  { value: 'square', label: 'Cuadrado', className: 'rounded-sm' },
  { value: 'outline', label: 'Contorno', className: 'rounded-xl border-2 bg-transparent' },
];

const presetColors = [
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6',
  '#0ea5e9', '#14b8a6', '#22c55e', '#84cc16',
  '#ffffff', '#94a3b8', '#6b7280', '#374151',
];

const backgroundPresets = [
  { value: 'dark', label: 'Oscuro', bg: 'linear-gradient(180deg, #0a0a12 0%, #0f0f18 100%)' },
  { value: 'midnight', label: 'Medianoche', bg: 'linear-gradient(180deg, #0c0c1d 0%, #1a1a2e 100%)' },
  { value: 'cosmic', label: 'Cosmico', bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)' },
  { value: 'neon', label: 'Neon', bg: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a1a 50%, #0f0a1a 100%)' },
];

const fontOptions = [
  { value: 'inter', label: 'Inter', family: 'Inter, sans-serif' },
  { value: 'poppins', label: 'Poppins', family: 'Poppins, sans-serif' },
  { value: 'montserrat', label: 'Montserrat', family: 'Montserrat, sans-serif' },
  { value: 'playfair', label: 'Playfair', family: 'Playfair Display, serif' },
];

export default function DesignPage() {
  const { dbUser, profile, refreshProfile } = useAuth();
  const [primaryColor, setPrimaryColor] = useState(profile?.theme_primary_color ?? '#ec4899');
  const [textColor, setTextColor] = useState(profile?.theme_text_color ?? '#ffffff');
  const [background, setBackground] = useState(profile?.theme_background ?? 'dark');
  const [buttonStyle, setButtonStyle] = useState<ButtonStyle>((profile?.button_style as ButtonStyle) ?? 'rounded');
  const [selectedFont, setSelectedFont] = useState('inter');
  const [enableAnimations, setEnableAnimations] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { ok, data } = await apiPatch('/api/profile', {
        theme_primary_color: primaryColor,
        theme_text_color: textColor,
        theme_background: background,
        button_style: buttonStyle,
      });
      if (!ok) { toast.error(data.error ?? 'Error al guardar'); return; }
      await refreshProfile();
      toast.success('Diseño guardado');
    } finally {
      setSaving(false);
    }
  };

  if (!profile || !dbUser) return null;

  const previewBorderRadius = {
    rounded: '0.75rem', pill: '9999px', square: '0.25rem', outline: '0.75rem',
  }[buttonStyle];

  const currentBg = backgroundPresets.find(b => b.value === background)?.bg ?? '#0a0a0f';

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Diseño</h1>
          <p className="text-gray-400 text-sm mt-1">Personaliza la apariencia de tu pagina</p>
        </div>
        <div className="flex items-center gap-3">
          {dbUser?.username && (
            <Link
              href={`/${dbUser.username}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Eye size={16} />
              Vista previa
            </Link>
          )}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 hover:opacity-90 gap-2"
          >
            <Save size={16} />
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          {/* Colors */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Palette size={18} className="text-pink-400" />
              <h2 className="font-semibold text-white">Colores</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-400 text-xs mb-2 block">Color primario</Label>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {presetColors.slice(0, 8).map(c => (
                    <button
                      key={c}
                      onClick={() => setPrimaryColor(c)}
                      className={`w-7 h-7 rounded-lg transition-transform hover:scale-110 ${primaryColor === c ? 'ring-2 ring-white ring-offset-1 ring-offset-[#0a0a0f]' : ''}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border border-white/10"
                  />
                  <Input
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="bg-white/5 border-white/10 text-white font-mono text-sm h-9"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-400 text-xs mb-2 block">Color de texto</Label>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {presetColors.slice(8).map(c => (
                    <button
                      key={c}
                      onClick={() => setTextColor(c)}
                      className={`w-7 h-7 rounded-lg transition-transform hover:scale-110 ${textColor === c ? 'ring-2 ring-white ring-offset-1 ring-offset-[#0a0a0f]' : ''}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={e => setTextColor(e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border border-white/10"
                  />
                  <Input
                    value={textColor}
                    onChange={e => setTextColor(e.target.value)}
                    className="bg-white/5 border-white/10 text-white font-mono text-sm h-9"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Background */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Layout size={18} className="text-blue-400" />
              <h2 className="font-semibold text-white">Fondo</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {backgroundPresets.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setBackground(opt.value)}
                  className={`relative rounded-xl h-20 border-2 transition-all overflow-hidden group ${
                    background === opt.value ? 'border-pink-500' : 'border-white/10 hover:border-white/20'
                  }`}
                  style={{ background: opt.bg }}
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                  <span className="relative text-xs text-gray-300 font-medium">{opt.label}</span>
                  {background === opt.value && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center">
                      <CheckCircle size={12} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
              <Label className="text-gray-400 text-xs mb-2 block">Color personalizado</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={background.startsWith('#') ? background : '#0a0a0f'}
                  onChange={e => setBackground(e.target.value)}
                  className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border border-white/10"
                />
                <Input
                  value={background.startsWith('#') ? background : ''}
                  onChange={e => setBackground(e.target.value)}
                  placeholder="Gradiente CSS o color hex"
                  className="bg-white/5 border-white/10 text-white font-mono text-sm h-9"
                />
              </div>
            </div>
          </div>

          {/* Button Style & Font */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Monitor size={18} className="text-purple-400" />
                <h2 className="font-semibold text-white text-sm">Estilo de botones</h2>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {buttonStyles.map(style => (
                  <button
                    key={style.value}
                    onClick={() => setButtonStyle(style.value)}
                    className={`relative p-3 rounded-xl border-2 transition-all ${
                      buttonStyle === style.value ? 'border-pink-500 bg-pink-500/5' : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div
                      className="h-6 mb-2 flex items-center justify-center text-[10px] text-white"
                      style={{
                        background: style.value === 'outline' ? 'transparent' : `${primaryColor}30`,
                        border: `1px solid ${primaryColor}60`,
                        borderRadius: previewBorderRadius,
                      }}
                    >
                      Link
                    </div>
                    <p className="text-[10px] text-gray-400">{style.label}</p>
                    {buttonStyle === style.value && (
                      <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-pink-500 flex items-center justify-center">
                        <CheckCircle size={8} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Type size={18} className="text-emerald-400" />
                <h2 className="font-semibold text-white text-sm">Fuente</h2>
              </div>

              <div className="space-y-2">
                {fontOptions.map(font => (
                  <button
                    key={font.value}
                    onClick={() => setSelectedFont(font.value)}
                    className={`w-full p-2.5 rounded-lg border text-left transition-all ${
                      selectedFont === font.value ? 'border-pink-500 bg-pink-500/5' : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="text-white text-sm" style={{ fontFamily: font.family }}>{font.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Animations */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                  <Sparkles size={18} className="text-yellow-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Animaciones</p>
                  <p className="text-gray-500 text-xs">Efectos hover y transiciones</p>
                </div>
              </div>
              <button
                onClick={() => setEnableAnimations(!enableAnimations)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  enableAnimations ? 'bg-gradient-to-r from-pink-500 to-rose-500' : 'bg-white/10'
                }`}
              >
                <motion.div
                  layout
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md ${enableAnimations ? 'right-1' : 'left-1'}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-6">
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-white text-sm">Vista previa</h2>
              {dbUser?.username && (
                <Link
                  href={`/${dbUser.username}`}
                  target="_blank"
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  <ExternalLink size={12} />
                  Abrir
                </Link>
              )}
            </div>

            {/* Phone mock */}
            <div className="mx-auto max-w-[280px]">
              <div
                className="rounded-[2rem] overflow-hidden border-4 border-gray-800 shadow-2xl"
                style={{
                  background: currentBg,
                }}
              >
                {/* Status bar */}
                <div className="h-6 flex items-center justify-center">
                  <div className="w-20 h-4 bg-black rounded-full" />
                </div>

                {/* Content */}
                <div className="px-5 pb-6 pt-2">
                  {/* Cover */}
                  <div className="h-24 -mx-5 -mt-2 mb-4" style={{ background: `${primaryColor}20` }} />

                  {/* Avatar */}
                  <div
                    className="w-20 h-20 rounded-full border-4 -mt-12 mx-auto mb-3 flex items-center justify-center text-white font-bold text-2xl"
                    style={{ borderColor: primaryColor, background: `${primaryColor}30` }}
                  >
                    {(profile.display_name || dbUser.username)[0]?.toUpperCase()}
                  </div>

                  {/* Name */}
                  <div className="text-center mb-4">
                    <p className="text-white font-bold text-base flex items-center justify-center gap-1">
                      {profile.display_name || dbUser.username}
                      {dbUser.is_verified && (
                        <span className="text-blue-400"><CheckCircle size={14} /></span>
                      )}
                    </p>
                    <p className="text-xs" style={{ color: primaryColor }}>@{dbUser.username}</p>
                    {profile.bio && (
                      <p className="text-gray-300 text-xs mt-2 leading-relaxed">
                        {profile.bio.slice(0, 50)}{profile.bio.length > 50 ? '...' : ''}
                      </p>
                    )}
                  </div>

                  {/* Mock links */}
                  <div className="space-y-2">
                    {['Mi contenido exclusivo', 'Sigueme en redes', 'Tips y apoyo'].map((title, i) => (
                      <motion.div
                        key={title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-3"
                        style={{
                          background: buttonStyle === 'outline' ? 'transparent' : `${primaryColor}20`,
                          border: `1px solid ${primaryColor}40`,
                          borderRadius: previewBorderRadius,
                        }}
                      >
                        <div
                          className="w-6 h-6 rounded-md flex-shrink-0"
                          style={{ background: primaryColor }}
                        />
                        <p className="text-xs text-white font-medium truncate">{title}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* NexoBio branding */}
                  <p className="text-center text-[10px] text-gray-500 mt-4">
                    Creado con NexoBio
                  </p>
                </div>

                {/* Home indicator */}
                <div className="h-6 flex items-center justify-center pb-1">
                  <div className="w-24 h-1 bg-white/20 rounded-full" />
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-gray-500 mt-4">Vista aproximada en movil</p>
          </div>
        </div>
      </div>
    </div>
  );
}
