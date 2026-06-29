'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import type { Opportunity, OpportunityStage, PaginationMeta } from '@/lib/types';
import { StageBadge, LateBadge, StagnantBadge, formatCurrencyFull, formatDate, SkeletonRow, EmptyState, ErrorBanner, PageHeader } from '@/components/ui';
import NewOpportunityDrawer from './NewOpportunityDrawer';

export default function OpportunitiesPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ stage: '', clientType: '', isProblematic: false, page: 1 });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.opportunities.list({
        stage: filters.stage ? (filters.stage as OpportunityStage) : undefined,
        clientType: filters.clientType as any || undefined,
        isProblematic: filters.isProblematic || undefined,
        page: filters.page,
        limit: 20,
      });
      setOpportunities(response.data);
      if (response.meta) setMeta(response.meta);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Failed to load opportunities.');
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalText = useMemo(() => meta ? `${meta.total} total` : undefined, [meta]);

  const newOpportunityButton = (
    <button
      onClick={() => setDrawerOpen(true)}
      className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-all"
      style={{ background: 'var(--brand-blue)', color: '#fff' }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      New opportunity
    </button>
  );

  return (
    <div>
      <PageHeader
        title="Opportunities"
        subtitle={totalText}
        actions={newOpportunityButton}
      />

      <div className="px-8 py-6 space-y-6 max-w-[1400px]">
        {error && <ErrorBanner message={error} onRetry={fetchData} />}

        {/* Filter bar */}
        <div className="px-4 py-3 rounded-lg border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-4">
            <select value={filters.stage}
              onChange={(e) => setFilters((p) => ({ ...p, stage: e.target.value, page: 1 }))}
              className="border rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: 'var(--border)' }}>
              <option value="">All stages</option>
              <option value="LEAD">Lead</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="PROPOSAL">Proposal</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="WON">Won</option>
              <option value="LOST">Lost</option>
            </select>

            <select value={filters.clientType}
              onChange={(e) => setFilters((p) => ({ ...p, clientType: e.target.value, page: 1 }))}
              className="border rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: 'var(--border)' }}>
              <option value="">All types</option>
              <option value="COMPANY">Companies</option>
              <option value="INDIVIDUAL">Individuals</option>
            </select>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={filters.isProblematic}
                onChange={(e) => setFilters((p) => ({ ...p, isProblematic: e.target.checked, page: 1 }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-gray-600">Problematic only</span>
            </label>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>Title</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>Client</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>Amount</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>Stage</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>Close date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>Status</th>
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
              ) : opportunities.length === 0 ? (
                <tr><td colSpan={6}>
                  <EmptyState title="No opportunities yet" description="Create your first opportunity to start tracking deals."
                    action={newOpportunityButton}
                  /></td></tr>
              ) : (
                opportunities.map((opp) => (
                  <tr key={opp.id} onClick={() => router.push(`/opportunities/${opp.id}`)}
                    className="cursor-pointer transition-colors border-b last:border-0"
                    style={{
                      borderColor: 'var(--border-light)',
                      ...((opp.isLate || opp.isStagnant) ? { borderLeft: '4px solid var(--orange)', background: '#FFFBF0' } : {})
                    }}
                    onMouseEnter={e => { if (!(opp.isLate || opp.isStagnant)) (e.currentTarget as HTMLElement).style.background = '#FAFAF9'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}>
                    <td className="px-5 py-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{opp.title}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: 'var(--brand-blue)' }}>
                      {opp.client ? (opp.client.type === 'COMPANY' ? opp.client.companyName : `${opp.client.firstName} ${opp.client.lastName}`) : '-'}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold font-data" style={{ color: 'var(--text-primary)' }}>{formatCurrencyFull(opp.amount)}</td>
                    <td className="px-5 py-4"><StageBadge stage={opp.stage} /></td>
                    <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>{formatDate(opp.expectedCloseDate)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {opp.isLate && <LateBadge />}
                        {opp.isStagnant && <StagnantBadge />}
                      </div>
                    </td>
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
              <button onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))} disabled={meta.page <= 1}
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Previous</button>
              <button onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))} disabled={meta.page >= meta.totalPages}
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Next</button>
            </div>
          </div>
        )}
      </div>

      <NewOpportunityDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={fetchData}
      />
    </div>
  );
}