'use client';

import { useEffect, useState } from 'react';
import { Users, Eye, Link2, Flag, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AdminStats {
  totalUsers: number;
  publicProfiles: number;
  adultProfiles: number;
  totalLinks: number;
  pendingReports: number;
  verifiedUsers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    publicProfiles: 0,
    adultProfiles: 0,
    totalLinks: 0,
    pendingReports: 0,
    verifiedUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [usersRes, profilesRes, linksRes, reportsRes] = await Promise.all([
      supabase.from('users').select('id, is_verified', { count: 'exact' }),
      supabase.from('profiles').select('is_public, is_adult', { count: 'exact' }),
      supabase.from('links').select('id', { count: 'exact' }),
      supabase.from('reports').select('id').eq('status', 'PENDING'),
    ]);

    const publicCount = profilesRes.data?.filter(p => p.is_public).length ?? 0;
    const adultCount = profilesRes.data?.filter(p => p.is_adult).length ?? 0;
    const verifiedCount = usersRes.data?.filter(u => u.is_verified).length ?? 0;

    setStats({
      totalUsers: usersRes.count ?? 0,
      publicProfiles: publicCount,
      adultProfiles: adultCount,
      totalLinks: linksRes.count ?? 0,
      pendingReports: reportsRes.data?.length ?? 0,
      verifiedUsers: verifiedCount,
    });
    setLoading(false);
  };

  const statCards = [
    { label: 'Usuarios totales', value: stats.totalUsers, icon: Users, color: '#ec4899' },
    { label: 'Perfiles públicos', value: stats.publicProfiles, icon: Eye, color: '#3b82f6' },
    { label: 'Perfiles adultos', value: stats.adultProfiles, icon: Eye, color: '#f97316', suffix: '18+' },
    { label: 'Links creados', value: stats.totalLinks, icon: Link2, color: '#a855f7' },
    { label: 'Reportes pendientes', value: stats.pendingReports, icon: Flag, color: '#ef4444' },
    { label: 'Usuarios verificados', value: stats.verifiedUsers, icon: CheckCircle, color: '#22c55e' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Panel de Administración</h1>
        <p className="text-gray-400 text-sm">Vista general de la plataforma.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="glass rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${card.color}20` }}>
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{card.value.toLocaleString()}</p>
              <p className="text-sm text-gray-400">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href="/admin/users" className="glass rounded-2xl p-5 hover:border-pink-500/30 transition-colors cursor-pointer block">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-white">Gestionar usuarios</p>
              <p className="text-sm text-gray-400">Ver, suspender y verificar cuentas</p>
            </div>
          </div>
        </a>
        <a href="/admin/reports" className="glass rounded-2xl p-5 hover:border-pink-500/30 transition-colors cursor-pointer block">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Flag className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-white">Gestionar reportes</p>
              <p className="text-sm text-gray-400">{stats.pendingReports} reportes pendientes</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
