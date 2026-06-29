'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import type { Client, PaginationMeta } from '@/lib/types';
import { SkeletonRow, EmptyState, ErrorBanner, PageHeader } from '@/components/ui';
import NewclientDrawer from './Newclientdrawer';

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.clients.list({ type: typeFilter as any || undefined, search: search || undefined, page, limit: 20 });
      setClients(response.data);
      if (response.meta) setMeta(response.meta);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Failed to load clients.');
    } finally { setLoading(false); }
  }, [typeFilter, search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // After creating a client from the drawer, refresh the list so the new
  // row (and updated total count) show up immediately.
  const handleClientCreated = (_client: Client) => {
    setPage(1);
    fetchData();
  };

  const totalText = useMemo(() => meta ? `${meta.total} total` : undefined, [meta]);

  const newClientButton = (
    <button
      onClick={() => setDrawerOpen(true)}
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
      New client
    </button>
  );

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle={totalText}
        actions={newClientButton}
      />

      <div className="px-8 py-6 space-y-6 max-w-[1400px]">
        {error && <ErrorBanner message={error} onRetry={fetchData} />}

        {/* Filter bar */}
        <div className="px-4 py-3 rounded-lg border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name or email..."
                className="w-full border rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: 'var(--border)' }} />
            </div>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="border rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: 'var(--border)' }}>
              <option value="">All types</option>
              <option value="COMPANY">Companies</option>
              <option value="INDIVIDUAL">Individuals</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>Type</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>Email</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>Location</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  <SkeletonRow cols={4} />
                  <SkeletonRow cols={4} />
                  <SkeletonRow cols={4} />
                  <SkeletonRow cols={4} />
                  <SkeletonRow cols={4} />
                </>
              ) : clients.length === 0 ? (
                <tr><td colSpan={4}>
                  <EmptyState title="No clients found" description="Try adjusting your search or filters, or add a new client."
                    action={newClientButton}
                  /></td></tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} onClick={() => router.push(`/clients/${client.id}`)}
                    className="cursor-pointer transition-colors border-b last:border-0"
                    style={{ borderColor: 'var(--border-light)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAFAF9'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}>
                    <td className="px-5 py-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {client.type === 'COMPANY' ? client.companyName : `${client.firstName} ${client.lastName}`}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${client.type === 'COMPANY' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                        {client.type === 'COMPANY' ? 'Company' : 'Individual'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: 'var(--brand-blue)' }}>{client.email}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>{client.city ? `${client.city}${client.country ? `, ${client.country}` : ''}` : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Page {meta.page} of {meta.totalPages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1}
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Previous</button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= (meta?.totalPages || 1)}
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Next</button>
            </div>
          </div>
        )}
      </div>

      <NewclientDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={handleClientCreated}
      />
    </div>
  );
}