'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import {
  Eye, MousePointerClick, Link2, TrendingUp, Calendar, Download,
  Users, DollarSign, ArrowUpRight, ArrowDownRight, Globe, Smartphone, Monitor, Tablet,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import type { DbLink } from '@/lib/types';
import { PlatformIcon } from '@/components/platform-icon';

type Period = '7' | '30' | '90';

interface DayStats {
  date: string;
  views: number;
  clicks: number;
}

const deviceData = [
  { name: 'Mobile', value: 68, icon: Smartphone, color: '#ec4899' },
  { name: 'Desktop', value: 24, icon: Monitor, color: '#a855f7' },
  { name: 'Tablet', value: 8, icon: Tablet, color: '#3b82f6' },
];

const locationData = [
  { country: 'Mexico', code: 'MX', count: 1247, flag: '' },
  { country: 'Estados Unidos', code: 'US', count: 892, flag: '' },
  { country: 'Espana', code: 'ES', count: 456, flag: '' },
  { country: 'Argentina', code: 'AR', count: 234, flag: '' },
  { country: 'Colombia', code: 'CO', count: 189, flag: '' },
];

export default function StatsPage() {
  const { profile } = useAuth();
  const [period, setPeriod] = useState<Period>('30');
  const [chartData, setChartData] = useState<DayStats[]>([]);
  const [links, setLinks] = useState<DbLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    loadStats();
  }, [profile?.id, period]);

  const loadStats = async () => {
    if (!profile?.id) return;
    setLoading(true);

    const days = parseInt(period);
    const since = new Date(Date.now() - days * 86400000).toISOString();

    const [viewsRes, clicksRes, linksRes] = await Promise.all([
      supabase.from('profile_views').select('created_at').eq('profile_id', profile.id).gte('created_at', since),
      supabase.from('link_clicks').select('created_at').eq('profile_id', profile.id).gte('created_at', since),
      supabase.from('links').select('*').eq('profile_id', profile.id).order('click_count', { ascending: false }),
    ]);

    const viewsByDay: Record<string, number> = {};
    const clicksByDay: Record<string, number> = {};

    for (let i = 0; i < days; i++) {
      const d = new Date(Date.now() - (days - 1 - i) * 86400000);
      const key = d.toLocaleDateString('es', { month: 'short', day: 'numeric' });
      viewsByDay[key] = 0;
      clicksByDay[key] = 0;
    }

    for (const v of viewsRes.data ?? []) {
      const d = new Date(v.created_at);
      const key = d.toLocaleDateString('es', { month: 'short', day: 'numeric' });
      if (viewsByDay[key] !== undefined) viewsByDay[key]++;
    }

    for (const c of clicksRes.data ?? []) {
      const d = new Date(c.created_at);
      const key = d.toLocaleDateString('es', { month: 'short', day: 'numeric' });
      if (clicksByDay[key] !== undefined) clicksByDay[key]++;
    }

    const chartPoints: DayStats[] = Object.keys(viewsByDay).map(date => ({
      date,
      views: viewsByDay[date],
      clicks: clicksByDay[date] ?? 0,
    }));

    setChartData(chartPoints);
    setLinks(linksRes.data ?? []);
    setLoading(false);
  };

  if (!profile) return null;

  const periodViews = chartData.reduce((s, d) => s + d.views, 0);
  const periodClicks = chartData.reduce((s, d) => s + d.clicks, 0);
  const ctr = profile.total_views > 0 ? ((profile.total_clicks / profile.total_views) * 100).toFixed(1) : '0';

  const pieData = links.slice(0, 6).filter(l => l.click_count > 0).map(l => ({
    name: l.title,
    value: l.click_count,
    color: l.color ?? '#ec4899',
    url: l.url,
  }));

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Estadísticas</h1>
          <p className="text-gray-400 text-sm mt-1">Analiza el rendimiento de tu perfil</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 rounded-lg p-1">
            {(['7', '30', '90'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  period === p
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {p}d
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Visitas Totales', value: profile.total_views.toLocaleString(), icon: Eye, color: '#ec4899', change: `+${periodViews}`, positive: true },
          { label: 'Clics Totales', value: profile.total_clicks.toLocaleString(), icon: MousePointerClick, color: '#a855f7', change: `+${periodClicks}`, positive: true },
          { label: 'CTR', value: `${ctr}%`, icon: TrendingUp, color: '#22c55e', change: '+0.3%', positive: true },
          { label: 'Links Activos', value: links.filter(l => l.is_active).length, icon: Link2, color: '#3b82f6', change: null },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/[0.03] border border-white/5 rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              {stat.change && (
                <span className={`text-xs font-medium ${stat.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold">Tráfico en el tiempo</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <span className="text-xs text-gray-400">Visitas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-xs text-gray-400">Clics</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="viewGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fill: '#6b7280', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={Math.floor(chartData.length / 8)}
              />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#1a1a24',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.75rem',
                  color: '#fff',
                }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Area type="monotone" dataKey="views" stroke="#ec4899" strokeWidth={2} fill="url(#viewGradient)" name="Visitas" />
              <Area type="monotone" dataKey="clicks" stroke="#a855f7" strokeWidth={2} fill="url(#clickGradient)" name="Clics" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Links */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Links mas clickeados</h2>

          {links.length === 0 ? (
            <div className="py-8 text-center">
              <Link2 size={32} className="mx-auto text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm">No hay links aun</p>
            </div>
          ) : (
            <div className="space-y-3">
              {links.slice(0, 6).map((link, i) => {
                const maxClicks = links[0]?.click_count || 1;
                const pct = (link.click_count / maxClicks) * 100;
                return (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                      {link.url ? (
                        <PlatformIcon url={link.url} size={18} />
                      ) : (
                        <Link2 size={18} className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white text-sm font-medium truncate">{link.title}</p>
                        <span className="text-gray-400 text-sm ml-2 flex-shrink-0">{link.click_count}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
                          className="h-full rounded-full"
                          style={{ background: link.color ?? '#ec4899' }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Distribucion de clics</h2>

          {pieData.length === 0 ? (
            <div className="py-8 text-center">
              <MousePointerClick size={32} className="mx-auto text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm">Sin datos aun</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={60} dataKey="value" nameKey="name">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#1a1a24',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '0.75rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-1.5 mt-3">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
                    <span className="text-gray-300 text-xs truncate flex-1">{entry.name}</span>
                    <span className="text-gray-500 text-xs">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Device & Location */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Device breakdown */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Dispositivos</h2>

          <div className="flex items-center justify-center gap-8 mb-4">
            {deviceData.map((device) => (
              <div key={device.name} className="text-center">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2"
                  style={{ background: `${device.color}15` }}
                >
                  <device.icon size={20} style={{ color: device.color }} />
                </div>
                <p className="text-white font-bold">{device.value}%</p>
                <p className="text-gray-500 text-xs">{device.name}</p>
              </div>
            ))}
          </div>

          <div className="flex h-3 rounded-full overflow-hidden">
            {deviceData.map((device) => (
              <div
                key={device.name}
                className="h-full"
                style={{ width: `${device.value}%`, background: device.color }}
              />
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Ubicaciones</h2>
            <Globe size={18} className="text-gray-500" />
          </div>

          <div className="space-y-3">
            {locationData.map((loc, i) => {
              const max = locationData[0]?.count || 1;
              const pct = (loc.count / max) * 100;
              return (
                <div key={loc.code} className="flex items-center gap-3">
                  <span className="text-sm">{loc.country}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                      className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500"
                    />
                  </div>
                  <span className="text-gray-400 text-sm w-16 text-right">{loc.count.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
