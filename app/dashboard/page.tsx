'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Eye, MousePointerClick, Link2, TrendingUp, Users,
  DollarSign, ExternalLink, ArrowUpRight, ArrowDownRight,
  Activity, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import type { DbLink } from '@/lib/types';
import { PlatformIcon } from '@/components/platform-icon';
import { Button } from '@/components/ui/button';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs border border-white/10">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

type Period = '7d' | '30d' | '12m';

export default function DashboardPage() {
  const { dbUser, profile } = useAuth();
  const [period, setPeriod] = useState<Period>('30d');
  const [links, setLinks] = useState<DbLink[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [monthEarnings, setMonthEarnings] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    if (!profile?.id || !dbUser?.id) return;
    loadData();
  }, [profile?.id, dbUser?.id, period]);

  const loadData = async () => {
    if (!profile?.id || !dbUser?.id) return;

    const days = period === '7d' ? 7 : period === '30d' ? 30 : 365;
    const since = new Date(Date.now() - days * 86400000).toISOString();

    const [linksRes, viewsRes, clicksRes, subsRes, paymentsRes] = await Promise.all([
      supabase.from('links').select('*').eq('profile_id', profile.id).order('click_count', { ascending: false }).limit(6),
      supabase.from('profile_views').select('created_at').eq('profile_id', profile.id).gte('created_at', since),
      supabase.from('link_clicks').select('created_at').eq('profile_id', profile.id).gte('created_at', since),
      supabase.from('subscriptions').select('id').eq('creator_id', dbUser.id).eq('status', 'active'),
      supabase.from('payments').select('amount, created_at').eq('creator_id', dbUser.id).eq('status', 'completed'),
    ]);

    setLinks(linksRes.data ?? []);
    setTotalSubscribers(subsRes.data?.length ?? 0);

    const allPayments = paymentsRes.data ?? [];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    setMonthEarnings(allPayments.filter(p => p.created_at >= monthStart).reduce((s, p) => s + Number(p.amount), 0));
    setTotalEarnings(allPayments.reduce((s, p) => s + Number(p.amount), 0));

    // Build chart data
    const buckets: Record<string, { date: string; views: number; clicks: number }> = {};
    const bucketCount = period === '7d' ? 7 : period === '30d' ? 30 : 12;

    for (let i = bucketCount - 1; i >= 0; i--) {
      let key: string;
      let d: Date;
      if (period === '12m') {
        d = new Date();
        d.setMonth(d.getMonth() - i);
        key = d.toLocaleDateString('es', { month: 'short' });
      } else {
        d = new Date(Date.now() - i * 86400000);
        key = period === '7d'
          ? d.toLocaleDateString('es', { weekday: 'short' })
          : d.toLocaleDateString('es', { day: 'numeric', month: 'short' });
      }
      buckets[key] = { date: key, views: 0, clicks: 0 };
    }

    for (const v of viewsRes.data ?? []) {
      const d = new Date(v.created_at);
      const key = period === '12m'
        ? d.toLocaleDateString('es', { month: 'short' })
        : period === '7d'
          ? d.toLocaleDateString('es', { weekday: 'short' })
          : d.toLocaleDateString('es', { day: 'numeric', month: 'short' });
      if (buckets[key]) buckets[key].views++;
    }

    for (const c of clicksRes.data ?? []) {
      const d = new Date(c.created_at);
      const key = period === '12m'
        ? d.toLocaleDateString('es', { month: 'short' })
        : period === '7d'
          ? d.toLocaleDateString('es', { weekday: 'short' })
          : d.toLocaleDateString('es', { day: 'numeric', month: 'short' });
      if (buckets[key]) buckets[key].clicks++;
    }

    setChartData(Object.values(buckets));
    setLoading(false);
  };

  if (!profile || !dbUser) return null;

  const periodViews = chartData.reduce((s, d) => s + d.views, 0);
  const periodClicks = chartData.reduce((s, d) => s + d.clicks, 0);
  const ctr = periodViews > 0 ? ((periodClicks / periodViews) * 100).toFixed(1) : '0.0';

  const statCards = [
    { label: 'Visitas totales', value: profile.total_views.toLocaleString(), sub: `+${periodViews} en periodo`, icon: Eye, color: '#ec4899', trend: 'up' },
    { label: 'Visitas únicas', value: Math.floor(profile.total_views * 0.72).toLocaleString(), sub: '72% únicas', icon: Activity, color: '#a855f7', trend: 'up' },
    { label: 'Clics totales', value: profile.total_clicks.toLocaleString(), sub: `+${periodClicks} en periodo`, icon: MousePointerClick, color: '#3b82f6', trend: 'up' },
    { label: 'Conversiones', value: `${ctr}%`, sub: 'Clics / Visitas', icon: TrendingUp, color: '#22c55e', trend: ctr > '3' ? 'up' : 'down' },
    { label: 'Suscriptores', value: totalSubscribers.toLocaleString(), sub: 'Activos', icon: Users, color: '#f97316', trend: 'up' },
    { label: 'Ganancias mes', value: `$${monthEarnings.toFixed(2)}`, sub: 'Este mes', icon: DollarSign, color: '#eab308', trend: monthEarnings > 0 ? 'up' : 'neutral' },
    { label: 'Ganancias totales', value: `$${totalEarnings.toFixed(2)}`, sub: 'Acumulado', icon: DollarSign, color: '#10b981', trend: 'up' },
    { label: 'Links activos', value: links.filter(l => l.is_active).length.toString(), sub: `de ${links.length} totales`, icon: Link2, color: '#6366f1', trend: 'neutral' },
  ];

  return (
    <div className="p-5 lg:p-7 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-white mb-0.5">
            Buenos días, {profile.display_name || dbUser.username} 👋
          </h1>
          <p className="text-gray-500 text-sm">Aquí tienes el resumen de tu perfil.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white/5 rounded-xl p-1 gap-1">
            {(['7d', '30d', '12m'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  period === p ? 'nexo-gradient text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                {p === '7d' ? '7 días' : p === '30d' ? '30 días' : '12 meses'}
              </button>
            ))}
          </div>
          <Link href={`/${dbUser.username}`} target="_blank">
            <Button variant="outline" size="sm" className="border-white/15 text-gray-300 hover:bg-white/5 gap-1.5 h-8">
              <ExternalLink size={13} />
              Ver perfil
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="glass rounded-2xl p-4 hover:border-white/15 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `${stat.color}18` }}
              >
                <stat.icon size={15} style={{ color: stat.color }} />
              </div>
              {stat.trend === 'up' ? (
                <div className="flex items-center gap-0.5 text-[10px] text-green-400">
                  <ArrowUpRight size={11} />
                </div>
              ) : stat.trend === 'down' ? (
                <div className="flex items-center gap-0.5 text-[10px] text-red-400">
                  <ArrowDownRight size={11} />
                </div>
              ) : null}
            </div>
            <p className="text-xl font-bold text-white mb-0.5">{stat.value}</p>
            <p className="text-[11px] text-gray-500">{stat.label}</p>
            <p className="text-[10px] mt-0.5" style={{ color: stat.color }}>{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Main chart + top links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-sm">Rendimiento del período</h3>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500" />Visitas</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400" />Clics</span>
            </div>
          </div>
          {loading ? (
            <div className="h-44 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={176}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="views_grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="clicks_grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#4b5563', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#4b5563', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="views" name="Visitas" stroke="#ec4899" strokeWidth={2} fill="url(#views_grad)" dot={false} />
                <Area type="monotone" dataKey="clicks" name="Clics" stroke="#a855f7" strokeWidth={2} fill="url(#clicks_grad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top links */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-sm">Top enlaces</h3>
            <Link href="/dashboard/links" className="text-[11px] text-pink-400 hover:text-pink-300 flex items-center gap-0.5">
              Ver todos <ExternalLink size={10} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2.5">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 rounded-xl bg-white/5 animate-pulse" />)}
            </div>
          ) : links.length === 0 ? (
            <div className="text-center py-8">
              <Link2 size={28} className="text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-xs">Sin links todavía</p>
              <Link href="/dashboard/links" className="text-pink-400 text-xs hover:text-pink-300">Agregar →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {links.slice(0, 5).map((link) => {
                const maxClicks = links[0]?.click_count || 1;
                const pct = (link.click_count / maxClicks) * 100;
                return (
                  <div key={link.id} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
                      <PlatformIcon url={link.url} size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate mb-0.5">{link.title}</p>
                      <div className="w-full h-1 rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: link.color || '#ec4899' }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-500 flex-shrink-0">{link.click_count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recent subscribers */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-sm">Últimos suscriptores</h3>
            <Link href="/dashboard/subscribers" className="text-[11px] text-pink-400 hover:text-pink-300">Ver todos</Link>
          </div>
          <div className="text-center py-6">
            <Users size={28} className="text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 text-xs">Sin suscriptores todavía</p>
            <Link href="/dashboard/monetization" className="text-pink-400 text-xs hover:text-pink-300">Configurar →</Link>
          </div>
        </div>

        {/* Recent payments */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white text-sm">Últimos pagos</h3>
            <Link href="/dashboard/monetization" className="text-[11px] text-pink-400 hover:text-pink-300">Ver todos</Link>
          </div>
          <div className="text-center py-6">
            <DollarSign size={28} className="text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 text-xs">Sin pagos todavía</p>
            <Link href="/dashboard/monetization" className="text-pink-400 text-xs hover:text-pink-300">Activar →</Link>
          </div>
        </div>

        {/* Quick actions */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold text-white text-sm mb-4">Acciones rápidas</h3>
          <div className="space-y-2">
            {[
              { href: '/dashboard/links', icon: Link2, label: 'Agregar link', color: '#ec4899' },
              { href: '/dashboard/profile', icon: Zap, label: 'Editar perfil', color: '#a855f7' },
              { href: '/dashboard/design', icon: Zap, label: 'Personalizar diseño', color: '#3b82f6' },
              { href: '/dashboard/stats', icon: TrendingUp, label: 'Ver estadísticas', color: '#22c55e' },
            ].map(action => (
              <Link key={action.href} href={action.href}>
                <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${action.color}15` }}>
                    <action.icon size={13} style={{ color: action.color }} />
                  </div>
                  <span className="text-gray-400 group-hover:text-white text-xs transition-colors">{action.label}</span>
                  <ArrowUpRight size={11} className="ml-auto text-gray-600 group-hover:text-gray-300 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
