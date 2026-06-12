'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, Users, CreditCard, Gift,
  ArrowUpRight, ArrowDownRight, Calendar, Download,
  Wallet, PiggyBank, Receipt, Clock
} from 'lucide-react';

const statCards = [
  { label: 'Saldo Disponible', value: '$1,247.50', change: '+12.5%', positive: true, icon: Wallet },
  { label: 'Ganancias del Mes', value: '$3,892.00', change: '+23.1%', positive: true, icon: TrendingUp },
  { label: 'Suscriptores Activos', value: '156', change: '+8', positive: true, icon: Users },
  { label: 'Propinas Totales', value: '$456.00', change: '+15.3%', positive: true, icon: Gift },
];

const recentPayouts = [
  { id: 1, amount: 500, date: '2024-01-15', status: 'completed', method: 'Stripe' },
  { id: 2, amount: 750, date: '2024-01-01', status: 'completed', method: 'PayPal' },
  { id: 3, amount: 320, date: '2024-02-01', status: 'pending', method: 'Stripe' },
];

const recentTips = [
  { id: 1, from: 'anon_user1', amount: 25, message: 'Love your content!', time: 'Hace 2h' },
  { id: 2, from: 'fan_2024', amount: 50, message: 'Keep it up!', time: 'Hace 5h' },
  { id: 3, from: 'subscriber_x', amount: 100, message: '', time: 'Hace 1d' },
];

const subscriptionBreakdown = [
  { plan: 'Pro', price: 9.99, subscribers: 89, revenue: 890.11 },
  { plan: 'Premium', price: 19.99, subscribers: 52, revenue: 1039.48 },
  { plan: 'VIP', price: 49.99, subscribers: 15, revenue: 749.85 },
];

export default function MonetizationPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '12m'>('30d');

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Monetización</h1>
          <p className="text-gray-400 text-sm mt-1">Gestiona tus ingresos y configuraciones de pago</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="12m">Últimos 12 meses</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Wallet size={16} />
            Retirar Fondos
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/[0.03] border border-white/5 rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                <stat.icon size={18} className="text-pink-400" />
              </div>
              <span className={`text-xs font-medium ${stat.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Subscription Breakdown */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold">Desglose de Suscripciones</h2>
            <button className="text-gray-400 text-sm hover:text-white transition-colors flex items-center gap-1">
              <Download size={14} />
              Exportar
            </button>
          </div>

          <div className="space-y-4">
            {subscriptionBreakdown.map((item, i) => (
              <div key={item.plan} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center text-pink-400 font-bold">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">{item.plan}</span>
                    <span className="text-white font-semibold">${item.revenue.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.subscribers / 100) * 100}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                      />
                    </div>
                    <span className="text-gray-400 text-sm">{item.subscribers} subs</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">${item.price}/mes</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Total Revenue</span>
              <span className="text-white font-bold text-lg">$2,679.44</span>
            </div>
          </div>
        </div>

        {/* Recent Tips */}
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Propinas Recientes</h2>

          <div className="space-y-3">
            {recentTips.map((tip) => (
              <div key={tip.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                  <Gift size={16} className="text-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-medium truncate">@{tip.from}</span>
                    <span className="text-green-400 font-semibold text-sm">${tip.amount}</span>
                  </div>
                  {tip.message && (
                    <p className="text-gray-500 text-xs truncate mt-0.5">{tip.message}</p>
                  )}
                  <p className="text-gray-600 text-[10px] mt-0.5">{tip.time}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-2.5 text-center text-gray-400 text-sm hover:text-white transition-colors rounded-xl bg-white/[0.02] hover:bg-white/[0.04]">
            Ver todas las propinas
          </button>
        </div>
      </div>

      {/* Recent Payouts */}
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold">Historial de Retiros</h2>
          <button className="text-gray-400 text-sm hover:text-white transition-colors">Ver todo</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-white/5">
                <th className="pb-3 font-medium">ID</th>
                <th className="pb-3 font-medium">Monto</th>
                <th className="pb-3 font-medium">Método</th>
                <th className="pb-3 font-medium">Fecha</th>
                <th className="pb-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentPayouts.map((payout) => (
                <tr key={payout.id} className="border-b border-white/[0.03] last:border-0">
                  <td className="py-4 text-gray-400 font-mono">#{payout.id.toString().padStart(4, '0')}</td>
                  <td className="py-4 text-white font-semibold">${payout.amount.toFixed(2)}</td>
                  <td className="py-4 text-gray-400">{payout.method}</td>
                  <td className="py-4 text-gray-400">{payout.date}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      payout.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {payout.status === 'completed' ? (
                        <>
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Completado
                        </>
                      ) : (
                        <>
                          <Clock size={12} />
                          Pendiente
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-2xl p-5 text-left hover:border-pink-500/40 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <CreditCard size={18} className="text-pink-400" />
          </div>
          <h3 className="text-white font-medium mb-1">Configurar Pagos</h3>
          <p className="text-gray-500 text-sm">Conecta tu cuenta bancaria o PayPal</p>
        </button>

        <button className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-5 text-left hover:border-blue-500/40 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Receipt size={18} className="text-blue-400" />
          </div>
          <h3 className="text-white font-medium mb-1">Ver Facturas</h3>
          <p className="text-gray-500 text-sm">Descarga tus facturas y recibos</p>
        </button>

        <button className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-5 text-left hover:border-green-500/40 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <PiggyBank size={18} className="text-green-400" />
          </div>
          <h3 className="text-white font-medium mb-1">Metas de Ahorro</h3>
          <p className="text-gray-500 text-sm">Establece objetivos financieros</p>
        </button>
      </div>
    </div>
  );
}
