'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        toast.error(error.includes('Invalid') ? 'Email o contraseña incorrectos' : error);
        setLoading(false);
        return;
      }
      toast.success('¡Bienvenido de nuevo!');
      router.push('/dashboard');
      router.refresh();
    } catch (e) {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center bg-gradient-to-br from-pink-950/50 to-[#0a0a0f]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-pink-500/15 blur-[100px]" />
        </div>
        <div className="relative z-10 text-center p-12">
          <Link href="/" className="flex items-center justify-center gap-2 mb-12">
            <div className="w-10 h-10 nexo-gradient rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">N</span>
            </div>
            <span className="text-2xl font-bold text-white">NexoBio</span>
          </Link>
          <h2 className="text-3xl font-bold text-white mb-4">Tu bio, tus reglas</h2>
          <p className="text-gray-400 text-lg max-w-sm mx-auto">
            Gestiona todos tus links desde un solo lugar y crece tu audiencia.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
            <div className="w-8 h-8 nexo-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-xl font-bold text-white">NexoBio</span>
          </div>

          <div className="glass rounded-3xl p-8 border border-white/8">
            <h1 className="text-2xl font-bold text-white mb-2">Iniciar sesión</h1>
            <p className="text-gray-400 text-sm mb-8">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-pink-400 hover:text-pink-300 font-medium transition-colors">
                Regístrate gratis
              </Link>
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-gray-300 text-sm mb-1.5 block">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  autoComplete="email"
                  {...register('email')}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-pink-500 h-12"
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-300 text-sm mb-1.5 block">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register('password')}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-pink-500 h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full nexo-gradient text-white border-0 hover:opacity-90 h-12 text-base"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Iniciando sesión...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Iniciar sesión
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-gray-500 text-xs mt-6">
            Al acceder, aceptas nuestros{' '}
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Términos</Link>
            {' '}y{' '}
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacidad</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
