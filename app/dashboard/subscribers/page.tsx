'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Search, Filter, MoreHorizontal, Mail,
  Calendar, DollarSign, Download, UserCheck, UserX,
  CreditCard, Star, Crown, Gem
} from 'lucide-react';

const mockSubscribers = [
  { id: '1', username: 'fan_supreme', email: 'fan@example.com', plan: 'VIP', amount: 49.99, joinedAt: '2024-01-15', status: 'active', avatar: null },
  { id: '2', username: 'music_lover99', email: null, plan: 'Premium', amount: 19.99, joinedAt: '2024-01-18', status: 'active', avatar: null },
  { id: '3', username: 'art_enthusiast', email: 'art@example.com', plan: 'Pro', amount: 9.99, joinedAt: '2024-02-01', status: 'active', avatar: null },
  { id: '4', username: 'vip_member', email: 'vip@example.com', plan: 'VIP', amount: 49.99, joinedAt: '2024-02-05', status: 'grace', avatar: null },
  { id: '5', username: 'chill_sub', email: null, plan: 'Pro', amount: 9.99, joinedAt: '2024-02-10', status: 'active', avatar: null },
  { id: '6', username: 'exclusive_fan', email: 'ex@example.com', plan: 'Premium', amount: 19.99, joinedAt: '2024-02-12', status: 'cancelled', avatar: null },
  { id: '7', username: 'star_follower', email: null, plan: 'Pro', amount: 9.99, joinedAt: '2024-02-15', status: 'active', avatar: null },
  { id: '8', username: 'premium_user', email: 'pu@example.com', plan: 'Premium', amount: 19.99, joinedAt: '2024-02-18', status: 'active', avatar: null },
];

const planIcons: Record<string, React.ReactNode> = {
  VIP: <Crown size={14} className="text-yellow-400" />,
  Premium: <Gem size={14} className="text-purple-400" />,
  Pro: <Star size={14} className="text-blue-400" />,
};

const planColors: Record<string, string> = {
  VIP: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
  Premium: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  Pro: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
};

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400',
  grace: 'bg-yellow-500/10 text-yellow-400',
  cancelled: 'bg-red-500/10 text-red-400',
};

const statusLabels: Record<string, string> = {
  active: 'Activo',
  grace: 'Gracia',
  cancelled: 'Cancelado',
};

export default function SubscribersPage() {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredSubscribers = mockSubscribers.filter((sub) => {
    const matchesSearch = sub.username.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = planFilter === 'all' || sub.plan === planFilter;
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const stats = {
    total: mockSubscribers.length,
    active: mockSubscribers.filter((s) => s.status === 'active').length,
    mrr: mockSubscribers.filter((s) => s.status === 'active').reduce((acc, s) => acc + s.amount, 0),
    vip: mockSubscribers.filter((s) => s.plan === 'VIP').length,
  };

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Suscriptores</h1>
          <p className="text-gray-400 text-sm mt-1">Gestiona tu comunidad de suscriptores</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white hover:bg-white/10 transition-colors">
          <Download size={16} />
          Exportar CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
              <Users size={18} className="text-pink-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-gray-500 text-xs">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
              <UserCheck size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.active}</p>
              <p className="text-gray-500 text-xs">Activos</p>
            </div>
          </div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <DollarSign size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">${stats.mrr.toFixed(0)}</p>
              <p className="text-gray-500 text-xs">MRR</p>
            </div>
          </div>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
              <Crown size={18} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.vip}</p>
              <p className="text-gray-500 text-xs">VIP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar suscriptor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
        >
          <option value="all">Todos los planes</option>
          <option value="Pro">Pro</option>
          <option value="Premium">Premium</option>
          <option value="VIP">VIP</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="grace">En gracia</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      {/* Subscribers List */}
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-white/5 bg-white/[0.02]">
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Monto</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.map((sub, i) => (
                <motion.tr
                  key={sub.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500/30 to-purple-500/30 flex items-center justify-center text-white font-bold text-sm">
                        {sub.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">@{sub.username}</p>
                        {sub.email && <p className="text-gray-500 text-xs">{sub.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${planColors[sub.plan]} border`}>
                      {planIcons[sub.plan]}
                      {sub.plan}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-white font-semibold">${sub.amount.toFixed(2)}</td>
                  <td className="px-4 py-4 text-gray-400 text-sm">{sub.joinedAt}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[sub.status]}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${sub.status === 'active' ? 'bg-emerald-400' : sub.status === 'grace' ? 'bg-yellow-400' : 'bg-red-400'}`} />
                      {statusLabels[sub.status]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubscribers.length === 0 && (
          <div className="py-12 text-center">
            <Users size={40} className="mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400">No se encontraron suscriptores</p>
          </div>
        )}
      </div>
    </div>
  );
}
