'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, CheckCircle, XCircle, ShieldOff, Shield, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { apiPost, getAuthHeaders } from '@/lib/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UserWithProfile {
  id: string;
  email: string;
  username: string;
  role: string;
  is_verified: boolean;
  is_suspended: boolean;
  created_at: string;
  profiles?: {
    display_name: string;
    avatar_url: string;
    is_adult: boolean;
    is_public: boolean;
    total_views: number;
    total_clicks: number;
  }[];
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const loadUsers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const headers = await getAuthHeaders();
    const params = new URLSearchParams({ page: '1' });
    if (search) params.set('search', search);
    const res = await fetch(`/api/admin/users?${params}`, { headers });
    const data = await res.json();
    setUsers(data.users ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [user, search]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleAction = async (userId: string, action: 'suspend' | 'unsuspend' | 'verify' | 'unverify') => {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers,
      body: JSON.stringify({ userId, action }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error ?? 'Error'); return; }

    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      if (action === 'suspend') return { ...u, is_suspended: true };
      if (action === 'unsuspend') return { ...u, is_suspended: false };
      if (action === 'verify') return { ...u, is_verified: true };
      if (action === 'unverify') return { ...u, is_verified: false };
      return u;
    }));

    const msgs: Record<string, string> = {
      suspend: 'Usuario suspendido',
      unsuspend: 'Usuario reactivado',
      verify: 'Usuario verificado',
      unverify: 'Verificación removida',
    };
    toast.success(msgs[action]);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Usuarios</h1>
        <p className="text-gray-400 text-sm">{total} usuarios registrados.</p>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadUsers()}
            placeholder="Buscar por email o username..."
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-pink-500"
          />
        </div>
        <Button onClick={loadUsers} variant="outline" className="border-white/15 text-gray-300 hover:bg-white/5">
          Buscar
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-xs font-medium text-gray-400">Usuario</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-400">Email</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-400">Estado</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-400">Vistas</th>
                  <th className="text-left p-4 text-xs font-medium text-gray-400">Registrado</th>
                  <th className="text-right p-4 text-xs font-medium text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const profile = u.profiles?.[0];
                  return (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl overflow-hidden bg-pink-900 flex-shrink-0">
                            {profile?.avatar_url ? (
                              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full nexo-gradient flex items-center justify-center text-white text-xs font-bold">
                                {(profile?.display_name || u.username)[0]?.toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-white text-sm font-medium">@{u.username}</p>
                              {u.is_verified && <CheckCircle className="w-3.5 h-3.5 fill-blue-500 text-white" />}
                            </div>
                            <div className="flex gap-1 mt-0.5">
                              {profile?.is_adult && <span className="text-[10px] bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded">18+</span>}
                              {u.role === 'ADMIN' && <span className="text-[10px] bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded">ADMIN</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-400">{u.email}</td>
                      <td className="p-4">
                        {u.is_suspended ? (
                          <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-lg">Suspendido</span>
                        ) : (
                          <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-lg">Activo</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-400">{profile?.total_views?.toLocaleString() ?? 0}</td>
                      <td className="p-4 text-xs text-gray-500">
                        {new Date(u.created_at).toLocaleDateString('es')}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <a href={`/${u.username}`} target="_blank" className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          {u.is_verified ? (
                            <button
                              onClick={() => handleAction(u.id, 'unverify')}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
                              title="Quitar verificado"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAction(u.id, 'verify')}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                              title="Verificar usuario"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {u.is_suspended ? (
                            <button
                              onClick={() => handleAction(u.id, 'unsuspend')}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-green-400 hover:bg-green-500/10 transition-colors"
                              title="Reactivar"
                            >
                              <Shield className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAction(u.id, 'suspend')}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Suspender"
                            >
                              <ShieldOff className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-12 text-gray-500">No se encontraron usuarios.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
