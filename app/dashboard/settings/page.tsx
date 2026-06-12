'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Requerido'),
  new_password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirm_password: z.string(),
}).refine(d => d.new_password === d.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password'],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user, dbUser, profile } = useAuth();
  const [savingPassword, setSavingPassword] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onChangePassword = async (data: PasswordForm) => {
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: data.new_password });
      if (error) { toast.error(error.message); return; }
      toast.success('Contraseña actualizada');
      reset();
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user || !dbUser) return null;

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Configuración</h1>
        <p className="text-gray-400 text-sm">Administra tu cuenta y preferencias.</p>
      </div>

      <div className="space-y-6">
        {/* Account info */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-white">Cuenta</h2>

          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <div>
              <p className="text-sm text-gray-300">Email</p>
              <p className="text-white font-medium">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <div>
              <p className="text-sm text-gray-300">Username</p>
              <p className="text-white font-medium">@{dbUser.username}</p>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <div>
              <p className="text-sm text-gray-300">Rol</p>
              <p className="text-white font-medium capitalize">{dbUser.role.toLowerCase()}</p>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm text-gray-300">Miembro desde</p>
              <p className="text-white font-medium">{new Date(dbUser.created_at).toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Change password */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-4">Contraseña</h2>
          <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
            <div>
              <Label className="text-gray-300 text-sm mb-1.5 block">Contraseña actual</Label>
              <Input
                type="password"
                {...register('current_password')}
                className="bg-white/5 border-white/10 text-white focus:border-pink-500 h-11"
              />
              {errors.current_password && <p className="text-red-400 text-xs mt-1">{errors.current_password.message}</p>}
            </div>
            <div>
              <Label className="text-gray-300 text-sm mb-1.5 block">Nueva contraseña</Label>
              <Input
                type="password"
                {...register('new_password')}
                className="bg-white/5 border-white/10 text-white focus:border-pink-500 h-11"
              />
              {errors.new_password && <p className="text-red-400 text-xs mt-1">{errors.new_password.message}</p>}
            </div>
            <div>
              <Label className="text-gray-300 text-sm mb-1.5 block">Confirmar contraseña</Label>
              <Input
                type="password"
                {...register('confirm_password')}
                className="bg-white/5 border-white/10 text-white focus:border-pink-500 h-11"
              />
              {errors.confirm_password && <p className="text-red-400 text-xs mt-1">{errors.confirm_password.message}</p>}
            </div>
            <Button
              type="submit"
              disabled={savingPassword}
              className="nexo-gradient text-white border-0 hover:opacity-90 gap-2"
            >
              <Save className="w-4 h-4" />
              {savingPassword ? 'Guardando...' : 'Cambiar contraseña'}
            </Button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl p-6 border border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h2 className="font-semibold text-white">Zona de peligro</h2>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Eliminar tu cuenta es permanente. Perderás todos tus datos, links y estadísticas.
          </p>
          <Button
            variant="outline"
            className="border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            onClick={() => toast.error('Contacta soporte para eliminar tu cuenta.')}
          >
            Eliminar cuenta
          </Button>
        </div>
      </div>
    </div>
  );
}
