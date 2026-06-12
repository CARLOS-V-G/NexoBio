'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Flag } from 'lucide-react';
import { toast } from 'sonner';
import { REPORT_REASON_LABELS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const schema = z.object({
  reason: z.enum(['illegal_content', 'minor', 'non_consensual', 'spam', 'fraud', 'other']),
  description: z.string().max(500).optional().default(''),
  reporter_email: z.string().email('Email inválido').optional().or(z.literal('')).default(''),
});

type FormData = z.infer<typeof schema>;

interface Props {
  username: string;
  open: boolean;
  onClose: () => void;
}

export function ReportModal({ username, open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, username }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? 'Error al enviar reporte');
        return;
      }
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-strong rounded-3xl p-6 max-w-sm w-full border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-pink-400" />
                <h2 className="text-lg font-bold text-white">Reportar perfil</h2>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flag className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Reporte enviado</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Gracias por reportar. Nuestro equipo revisará el perfil.
                </p>
                <Button onClick={handleClose} className="nexo-gradient text-white border-0">
                  Cerrar
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label className="text-gray-300 text-sm mb-1.5 block">¿Por qué estás reportando este perfil?</Label>
                  <Select onValueChange={(v) => setValue('reason', v as FormData['reason'])}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-10">
                      <SelectValue placeholder="Selecciona un motivo" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a24] border-white/10">
                      {Object.entries(REPORT_REASON_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value} className="text-white hover:bg-white/10">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.reason && <p className="text-red-400 text-xs mt-1">{errors.reason.message}</p>}
                </div>

                <div>
                  <Label className="text-gray-300 text-sm mb-1.5 block">Descripción (opcional)</Label>
                  <Textarea
                    placeholder="Cuéntanos más detalles sobre el motivo..."
                    {...register('description')}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 resize-none h-24"
                  />
                </div>

                <div>
                  <Label className="text-gray-300 text-sm mb-1.5 block">Tu email (opcional)</Label>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    {...register('reporter_email')}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-10"
                  />
                  {errors.reporter_email && (
                    <p className="text-red-400 text-xs mt-1">{errors.reporter_email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full nexo-gradient text-white border-0 hover:opacity-90 h-10"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </span>
                  ) : 'Enviar reporte'}
                </Button>

                <p className="text-center text-xs text-gray-500">
                  Todos los reportes son revisados por nuestro equipo.
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
