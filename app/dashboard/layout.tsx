'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, User, Link2, Palette, BarChart3,
  Settings, LogOut, ExternalLink, DollarSign, Users,
  MessageSquare, Shield, Menu, X, ChevronRight, Sparkles,
  Bell, Crown
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface NavItem {
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
  exact?: boolean;
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: '',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    ],
  },
  {
    label: 'Perfil',
    items: [
      { href: '/dashboard/profile', icon: User, label: 'Mi Perfil' },
      { href: '/dashboard/links', icon: Link2, label: 'Mis Links' },
      { href: '/dashboard/design', icon: Palette, label: 'Diseño' },
    ],
  },
  {
    label: 'Analítica',
    items: [
      { href: '/dashboard/stats', icon: BarChart3, label: 'Estadísticas' },
    ],
  },
  {
    label: 'Monetización',
    items: [
      { href: '/dashboard/monetization', icon: DollarSign, label: 'Monetización' },
      { href: '/dashboard/subscribers', icon: Users, label: 'Suscriptores' },
      { href: '/dashboard/messages', icon: MessageSquare, label: 'Mensajes' },
    ],
  },
  {
    label: 'Cuenta',
    items: [
      { href: '/dashboard/privacy', icon: Shield, label: 'Privacidad' },
      { href: '/dashboard/settings', icon: Settings, label: 'Configuración' },
    ],
  },
];

const mobileNav: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Inicio', exact: true },
  { href: '/dashboard/links', icon: Link2, label: 'Links' },
  { href: '/dashboard/stats', icon: BarChart3, label: 'Stats' },
  { href: '/dashboard/messages', icon: MessageSquare, label: 'Mensajes' },
  { href: '/dashboard/settings', icon: Settings, label: 'Config' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, dbUser, profile, loading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 nexo-gradient rounded-xl flex items-center justify-center animate-pulse">
            <span className="text-white font-bold">N</span>
          </div>
          <div className="w-5 h-5 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 nexo-gradient rounded-lg flex items-center justify-center shadow-lg" style={{ boxShadow: '0 0 20px rgba(236,72,153,0.3)' }}>
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="font-bold text-lg text-white tracking-tight">NexoBio</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-hide">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-1">
            {group.label && (
              <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3 py-2 mt-2">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                    active
                      ? 'text-white'
                      : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 nexo-gradient rounded-xl"
                      style={{ opacity: 0.9 }}
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                    />
                  )}
                  <item.icon className="relative z-10 flex-shrink-0" size={16} />
                  <span className="relative z-10">{item.label}</span>
                  {item.href === '/dashboard/messages' && (
                    <span className="relative z-10 ml-auto w-5 h-5 rounded-full bg-pink-500 text-white text-[10px] flex items-center justify-center font-bold">
                      2
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom user card */}
      <div className="p-3 border-t border-white/5 space-y-1">
        {dbUser?.username && (
          <Link
            href={`/${dbUser.username}`}
            target="_blank"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-all"
          >
            <ExternalLink size={14} className="flex-shrink-0" />
            <span className="truncate">nexobio.com/{dbUser.username}</span>
          </Link>
        )}

        {/* Plan badge */}
        <div className="mx-1 my-1 rounded-xl p-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/15">
          <div className="flex items-center gap-2 mb-2">
            <Crown size={14} className="text-yellow-400" />
            <span className="text-xs font-semibold text-white">Plan Gratuito</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="w-1/3 h-full nexo-gradient rounded-full" />
          </div>
          <p className="text-[10px] text-gray-500 mt-1.5">Actualiza a Pro para más funciones</p>
        </div>

        {/* User info */}
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer group">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-pink-900/50 flex-shrink-0 ring-2 ring-pink-500/20">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full nexo-gradient flex items-center justify-center text-white font-bold text-sm">
                {(profile?.display_name || dbUser?.username || '?')[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-xs truncate">{profile?.display_name || dbUser?.username}</p>
            <p className="text-gray-500 text-[10px] truncate">@{dbUser?.username}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
            title="Cerrar sesión"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#08080f] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-white/[0.06] bg-[#0d0d16] fixed top-0 left-0 h-full z-40">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.25 }}
              className="lg:hidden fixed left-0 top-0 h-full w-64 z-50 border-r border-white/[0.06] bg-[#0d0d16]"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 lg:ml-60 min-h-screen flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-white/5 bg-[#0d0d16]/90 backdrop-blur-xl sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Menu size={18} />
          </button>
          <Link href="/" className="flex items-center gap-1.5">
            <div className="w-6 h-6 nexo-gradient rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">N</span>
            </div>
            <span className="font-bold text-white text-sm">NexoBio</span>
          </Link>
          <div className="flex-1" />
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white transition-colors relative">
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-pink-500" />
          </button>
        </div>

        {/* Page content */}
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="flex-1"
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-[#0d0d16]/95 backdrop-blur-xl">
        <div className="flex items-center justify-around px-1 py-1.5 safe-area-bottom">
          {mobileNav.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                  active ? 'text-pink-400' : 'text-gray-600'
                }`}
              >
                <div className="relative">
                  <item.icon size={20} />
                  {item.href === '/dashboard/messages' && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-pink-500 border border-[#0d0d16]" />
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
