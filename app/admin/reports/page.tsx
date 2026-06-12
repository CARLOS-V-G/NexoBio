'use client';

import { useEffect, useState, useCallback } from 'react';
import { Flag, ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { getAuthHeaders } from '@/lib/use-api';
import { REPORT_REASON_LABELS, type ReportStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface Report {
  id: string;
  reason: string;
  description: string;
  reporter_email: string;
  status: ReportStatus;
  created_at: string;
  profiles: {
    display_name: string;
    avatar_url: string;
    users: { username: string; email: string };
  };
}

const statusColors: Record<ReportStatus, string> = {
  PENDING: 'text-yellow-300 bg-yellow-500/20',
  REVIEWED: 'text-green-300 bg-green-500/20',
  DISMISSED: 'text-gray-400 bg-gray-500/20',
};

const statusLabels: Record<ReportStatus, string> = {
  PENDING: 'Pendiente',
  REVIEWED: 'Revisado',
  DISMISSED: 'Descartado',
};

export default function AdminReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReportStatus | 'ALL'>('ALL');

  const loadReports = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const headers = await getAuthHeaders();
    const params = filter !== 'ALL' ? `?status=${filter}` : '';
    const res = await fetch(`/api/admin/reports${params}`, { headers });
    const data = await res.json();
    setReports(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [user, filter]);

  useEffect(() => { loadReports(); }, [loadReports]);

  const handleUpdate = async (reportId: string, status: ReportStatus) => {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/admin/reports', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ reportId, status }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error ?? 'Error'); return; }
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
    toast.success('Reporte actualizado');
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Reportes</h1>
        <p className="text-gray-400 text-sm">{reports.length} reportes.</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(['ALL', 'PENDING', 'REVIEWED', 'DISMISSED'] as const).map(s => (
          <Button
            key={s}
            variant={filter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(s)}
            className={filter === s ? 'nexo-gradient text-white border-0' : 'border-white/15 text-gray-300 hover:bg-white/5'}
          >
            {s === 'ALL' ? 'Todos' : statusLabels[s]}
            {s === 'PENDING' && reports.filter(r => r.status === 'PENDING').length > 0 && (
              <span className="ml-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                {reports.filter(r => r.status === 'PENDING').length}
              </span>
            )}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl">
          <Flag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No hay reportes en esta categoría.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="glass rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-pink-900 flex-shrink-0">
                  {report.profiles?.avatar_url ? (
                    <img src={report.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full nexo-gradient flex items-center justify-center text-white text-sm font-bold">
                      {(report.profiles?.display_name || report.profiles?.users?.username || '?')[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <a
                      href={`/${report.profiles?.users?.username}`}
                      target="_blank"
                      className="flex items-center gap-1 text-white font-medium text-sm hover:text-pink-400 transition-colors"
                    >
                      @{report.profiles?.users?.username}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[report.status]}`}>
                      {statusLabels[report.status]}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-lg">
                      {REPORT_REASON_LABELS[report.reason as keyof typeof REPORT_REASON_LABELS] ?? report.reason}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(report.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  {report.description && (
                    <p className="text-gray-400 text-sm mb-2">{report.description}</p>
                  )}
                  {report.reporter_email && (
                    <p className="text-gray-500 text-xs">Reportado por: {report.reporter_email}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {report.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdate(report.id, 'REVIEWED')}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-green-400 hover:bg-green-500/10 transition-colors"
                        title="Marcar revisado"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUpdate(report.id, 'DISMISSED')}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-500/10 transition-colors"
                        title="Descartar"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {report.status !== 'PENDING' && (
                    <button
                      onClick={() => handleUpdate(report.id, 'PENDING')}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-yellow-400 hover:bg-yellow-500/10 transition-colors"
                      title="Marcar pendiente"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
