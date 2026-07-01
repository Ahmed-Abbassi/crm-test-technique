'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import type { Lead, LeadStatus, PaginationMeta } from '@/lib/types';
import {
  LeadStatusBadge, formatDate, SkeletonRow, EmptyState, ErrorBanner, PageHeader,
} from '@/components/ui';
import { useToast } from '@/components/ToastProvider';
import NewLeadDrawer from './NewLeadDrawer';
import ConvertLeadDrawer from './ConvertLeadDrawer';

export default function LeadsPage() {
  const router = useRouter();
  const toast = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ status: '', search: '', page: 1 });
  const [newDrawerOpen, setNewDrawerOpen] = useState(false);
  const [convertLeadId, setConvertLeadId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.leads.list({
        status: filters.status ? (filters.status as LeadStatus) : undefined,
        search: filters.search || undefined,
        page: filters.page,
        limit: 20,
      });
      setLeads(response.data);
      if (response.meta) setMeta(response.meta);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load leads.';
      setError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalText = useMemo(() => meta ? `${meta.total} total` : undefined, [meta]);

  const newLeadButton = (
    <button
      onClick={() => setNewDrawerOpen(true)}
      className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{
              background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(79,70,229,0.35)',
            }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      New lead
    </button>
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this lead?')) return;
    try {
      await api.leads.delete(id);
      toast.success('Lead deleted successfully');
      fetchData();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to delete lead.';
      toast.error(msg);
    }
  };

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle={totalText}
        actions={newLeadButton}
      />

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-[1400px]">
        {error && <ErrorBanner message={error} onRetry={fetchData} />}

        {/* Filter bar */}
        <div className="px-4 py-3 rounded-lg border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <select value={filters.status}
              onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value, page: 1 }))}
              className="w-full sm:w-auto border rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: 'var(--border)' }}>
              <option value="">All statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="DISQUALIFIED">Disqualified</option>
            </select>

            <input type="text" placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value, page: 1 }))}
              className="w-full sm:max-w-xs border rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1" style={{ borderColor: 'var(--border)' }} />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border overflow-hidden overflow-x-auto" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>Email</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>Company</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>Created</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  <SkeletonRow cols={6} />
                  <SkeletonRow cols={6} />
                  <SkeletonRow cols={6} />
                  <SkeletonRow cols={6} />
                  <SkeletonRow cols={6} />
                </>
              ) : leads.length === 0 ? (
                <tr><td colSpan={6}>
                  <EmptyState title="No leads yet" description="Create your first lead to start tracking prospects."
                    action={newLeadButton}
                  /></td></tr>
              ) : (
                leads.map((lead) => {
                  const name = [lead.firstName, lead.lastName].filter(Boolean).join(' ') || lead.email;
                  return (
                    <tr key={lead.id} onClick={() => router.push(`/leads/${lead.id}`)}
                      className="cursor-pointer transition-colors border-b last:border-0 hover:bg-gray-50"
                      style={{ borderColor: 'var(--border-light)' }}>
                      <td className="px-5 py-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{name}</td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{lead.email}</td>
                      <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>{lead.companyName || '—'}</td>
                      <td className="px-5 py-4"><LeadStatusBadge status={lead.status} /></td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{formatDate(lead.createdAt)}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {lead.status === 'QUALIFIED' && !lead.convertedAt && (
                            <button onClick={(e) => { e.stopPropagation(); setConvertLeadId(lead.id); }}
                              className="px-3 py-1 text-xs font-semibold rounded transition-colors"
                              style={{ background: '#EEF4EE', color: '#2E844A' }}>
                              Convert
                            </button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(lead.id); }}
                            className="px-3 py-1 text-xs font-semibold rounded transition-colors"
                            style={{ background: '#FDECEC', color: '#BA0517' }}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Page {meta.page} of {meta.totalPages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))} disabled={meta.page <= 1}
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Previous</button>
              <button onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))} disabled={meta.page >= meta.totalPages}
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Next</button>
            </div>
          </div>
        )}
      </div>

      <NewLeadDrawer
        open={newDrawerOpen}
        onClose={() => setNewDrawerOpen(false)}
        onCreated={fetchData}
      />

      {convertLeadId && (
        <ConvertLeadDrawer
          leadId={convertLeadId}
          open={!!convertLeadId}
          onClose={() => setConvertLeadId(null)}
          onConverted={() => { setConvertLeadId(null); fetchData(); }}
        />
      )}
    </div>
  );
}