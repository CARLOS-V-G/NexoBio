'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Flag, BarChart3, Settings, LogOut, ChevronRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/admin/users', icon: Users, label: 'Usuarios' },
  { href: '/admin/reports', icon: Flag, label: 'Reportes' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, dbUser, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push('/login'); return; }
      if (dbUser && !['ADMIN', 'MODERATOR'].includes(dbUser.role)) {
        router.push('/dashboard');
      }
    }
  }, [loading, user, dbUser, router]);

  if (loading || !dbUser || !['ADMIN', 'MODERATOR'].includes(dbUser.role)) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      <aside className="hidden lg:flex flex-col w-60 border-r border-white/5 bg-[#0d0d14] fixed top-0 left-0 h-full z-40">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 nexo-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-lg text-white">NexoBio</span>
          </div>
          <span className="text-xs text-pink-400 font-medium ml-10">Panel Admin</span>
        </div>

        <nav className="flex-1 p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active ? 'nexo-gradient text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <ArrowLeft className="w-4 h-4" />
            Volver al dashboard
          </Link>
          <div className="px-3 py-2">
            <p className="text-xs text-gray-600 truncate">{dbUser.email}</p>
            <p className="text-xs text-pink-400">{dbUser.role}</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 lg:ml-60">{children}</main>
    </div>
  );
}
