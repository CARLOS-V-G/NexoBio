'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BarChart3, Link2, Shield, Users, Zap, Star, CheckCircle,
  ArrowRight, Globe, Heart, TrendingUp, Lock, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import type { Variants } from 'framer-motion';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] } }),
};

const features = [
  {
    icon: Link2,
    title: 'Links ilimitados',
    description: 'Agrega todos tus links en un solo lugar. Redes sociales, OnlyFans, Telegram, tiendas y más.',
  },
  {
    icon: BarChart3,
    title: 'Estadísticas en tiempo real',
    description: 'Ve cuántas visitas y clics recibe tu perfil. Analiza el rendimiento de cada enlace.',
  },
  {
    icon: Zap,
    title: 'Personalización total',
    description: 'Cambia colores, fondos, estilos de botones y diseña tu bio a tu gusto.',
  },
  {
    icon: Shield,
    title: 'Sistema +18 seguro',
    description: 'Para creadores adultos: aviso de edad, confirmación obligatoria y control total de contenido.',
  },
  {
    icon: Globe,
    title: 'URL personalizada',
    description: 'Tu dirección única: nexobio.com/tunombre. Compártela en todas tus redes.',
  },
  {
    icon: Lock,
    title: 'Privacidad y seguridad',
    description: 'Sistema de reportes, protección anti-bots y control de visibilidad de tu perfil.',
  },
];

const steps = [
  { number: '01', title: 'Crea tu cuenta', description: 'Regístrate gratis en segundos.' },
  { number: '02', title: 'Personaliza tu bio', description: 'Agrega foto, bio, portada y links.' },
  { number: '03', title: 'Comparte tu link', description: 'Comparte nexobio.com/tuusuario.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 nexo-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-lg tracking-tight">NexoBio</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-300 hover:text-white">
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button className="nexo-gradient text-white border-0 hover:opacity-90 transition-opacity">
                Crear cuenta gratis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-pink-500/10 blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-pink-600/8 blur-[80px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-pink-300 mb-8"
          >
            <Star className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
            <span>La plataforma para creadores de contenido</span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="text-5xl md:text-7xl font-bold leading-tight mb-6"
          >
            Tu página de enlaces
            <br />
            <span className="gradient-text">para creadores</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Crea una bio profesional, comparte todos tus links y mide tus visitas en minutos.
            Perfecto para creadores, incluyendo creadores +18.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/register">
              <Button size="lg" className="nexo-gradient text-white border-0 hover:opacity-90 text-base px-8 nexo-glow">
                Crear mi página gratis
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/kumiho">
              <Button size="lg" variant="outline" className="border-white/15 text-white hover:bg-white/5 text-base px-8">
                <Eye className="mr-2 w-4 h-4" />
                Ver demo
              </Button>
            </Link>
          </motion.div>

          <motion.p
            initial="hidden"
            animate="visible"
            custom={4}
            variants={fadeUp}
            className="mt-6 text-sm text-gray-500"
          >
            Gratis para siempre · Sin tarjeta de crédito · Listo en 2 minutos
          </motion.p>
        </div>
      </section>

      {/* Profile preview mockup */}
      <section className="px-4 pb-24">
        <div className="max-w-sm mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-strong rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
            style={{ boxShadow: '0 0 60px rgba(236,72,153,0.15)' }}
          >
            <div className="h-36 relative bg-gradient-to-br from-pink-900/60 to-gray-900">
              <img
                src="https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Cover"
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-transparent to-transparent" />
            </div>
            <div className="px-6 pb-6 -mt-10 relative">
              <div className="w-20 h-20 rounded-full border-4 border-[#12121a] overflow-hidden mb-4 bg-pink-900">
                <img
                  src="https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=200"
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-xl">Kumiho</h3>
                <CheckCircle className="w-5 h-5 fill-blue-500 text-white" />
              </div>
              <p className="text-gray-400 text-sm mb-1">@kumiho</p>
              <p className="text-gray-300 text-sm mb-4">I'm waiting for you... link below 👇</p>
              <div className="space-y-2.5">
                {[
                  { label: 'My exclusive content', desc: 'Undress me 🤩', color: '#ec4899' },
                  { label: 'Join my OnlyFans', desc: 'Exclusive photos & videos', color: '#00AFF0' },
                  { label: 'Private Telegram', desc: 'Hot content every day', color: '#2AABEE' },
                ].map((link) => (
                  <div
                    key={link.label}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
                    style={{ background: `${link.color}20`, border: `1px solid ${link.color}30` }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: link.color }}>
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-white truncate">{link.label}</p>
                      <p className="text-xs text-gray-400 truncate">{link.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="font-bold text-pink-400 text-lg">125K</p>
                  <p className="text-xs text-gray-500">Visitas</p>
                </div>
                <div>
                  <p className="font-bold text-pink-400 text-lg">8.2K</p>
                  <p className="text-xs text-gray-500">Clics</p>
                </div>
                <div>
                  <p className="font-bold text-pink-400 text-lg">420</p>
                  <p className="text-xs text-gray-500">Seguidores</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Todo lo que necesitas
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Una sola herramienta para gestionar tu presencia online y monetizar tu audiencia.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="glass rounded-2xl p-6 hover:border-pink-500/30 transition-colors"
              >
                <div className="w-12 h-12 nexo-gradient rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Empieza en 3 pasos</h2>
          <p className="text-gray-400 mb-16">Sin configuraciones complicadas.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 nexo-gradient rounded-full flex items-center justify-center mx-auto mb-6 nexo-glow">
                  <span className="text-2xl font-bold text-white">{step.number}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-4 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Simple y transparente</h2>
          <p className="text-gray-400 mb-16">Sin cargos ocultos. Empieza gratis hoy.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free */}
            <div className="glass rounded-3xl p-8 text-left border-white/10">
              <p className="text-gray-400 text-sm mb-2">GRATIS</p>
              <p className="text-5xl font-bold mb-1">$0</p>
              <p className="text-gray-400 text-sm mb-6">Para siempre</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Links ilimitados',
                  'Perfil personalizado',
                  'Estadísticas básicas',
                  'Sistema +18',
                  'URL personalizada',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-pink-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block">
                <Button className="w-full nexo-gradient text-white border-0 hover:opacity-90">
                  Empezar gratis
                </Button>
              </Link>
            </div>
            {/* Pro */}
            <div className="relative rounded-3xl p-8 text-left border border-pink-500/40" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(190,24,93,0.05) 100%)' }}>
              <div className="absolute top-4 right-4 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                Próximamente
              </div>
              <p className="text-pink-300 text-sm mb-2">PRO</p>
              <p className="text-5xl font-bold mb-1">$9</p>
              <p className="text-gray-400 text-sm mb-6">por mes</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Todo de Gratis',
                  'Analytics avanzados',
                  'Sin marca NexoBio',
                  'Soporte prioritario',
                  'Monetización directa',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-pink-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button disabled className="w-full bg-white/10 text-white border-0 cursor-not-allowed opacity-60">
                Disponible pronto
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* +18 section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-3xl p-10 md:p-16 text-center border-pink-500/20">
            <div className="w-16 h-16 bg-pink-500/20 border border-pink-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-bold text-pink-400">18+</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Diseñado para creadores adultos
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              NexoBio permite perfiles +18 con controles apropiados. Los visitantes deben confirmar
              su mayoría de edad antes de ver contenido adulto. Cada creador es responsable de sus enlaces.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {[
                { icon: Shield, title: 'Verificación de edad', desc: 'Modal obligatorio antes de ver perfiles adultos.' },
                { icon: Users, title: 'Control del creador', desc: 'Tú decides si tu perfil es público o adulto.' },
                { icon: TrendingUp, title: 'Estadísticas reales', desc: 'Mide el impacto de cada link con datos reales.' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/15 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">{item.title}</p>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Crea tu bio hoy,
            <br />
            <span className="gradient-text">gratis para siempre</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Miles de creadores ya usan NexoBio. Únete ahora.
          </p>
          <Link href="/register">
            <Button size="lg" className="nexo-gradient text-white border-0 hover:opacity-90 text-lg px-10 nexo-glow">
              Crear mi cuenta gratis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 nexo-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">N</span>
            </div>
            <span className="font-bold">NexoBio</span>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm text-gray-400">
            <Link href="/terms" className="hover:text-white transition-colors">Términos</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link>
            <Link href="/login" className="hover:text-white transition-colors">Iniciar sesión</Link>
            <Link href="/register" className="hover:text-white transition-colors">Registrarse</Link>
          </nav>
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} NexoBio. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
