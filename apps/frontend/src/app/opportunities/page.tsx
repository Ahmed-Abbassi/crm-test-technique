'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import type { Opportunity, OpportunityStage, PaginationMeta } from '@/lib/types';

const stageBadge: Record<OpportunityStage, string> = {
  LEAD: 'bg-gray-100 text-gray-600',
  QUALIFIED: 'bg-blue-50 text-blue-700',
  PROPOSAL: 'bg-amber-50 text-amber-700',
  NEGOTIATION: 'bg-purple-50 text-purple-700',
  WON: 'bg-green-50 text-green-700',
  LOST: 'bg-red-50 text-red-600',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function StageBadge({ stage }: { stage: OpportunityStage }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageBadge[stage]}`}>
      {stage}
    </span>
  );
}

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i}>
          {[1, 2, 3, 4, 5, 6].map((j) => (
            <td key={j} className="px-6 py-4">
              <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: j === 2 ? '60%' : '80%' }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="text-center py-16">
      <svg className="mx-auto w-12 h-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <h3 className="text-sm font-medium text-gray-900 mb-1">No opportunities yet</h3>
      <p className="text-sm text-gray-400 mb-6">Create your first opportunity to start tracking deals.</p>
      <button
        onClick={onCreateClick}
        className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
      >
        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        New opportunity
      </button>
    </div>
  );
}

export default function OpportunitiesPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    stage: '',
    clientType: '',
    isProblematic: false,
    page: 1,
  });

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
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="px-8 py-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Opportunities</h1>
          {meta && <p className="text-sm text-gray-400 mt-1">{meta.total} total</p>}
        </div>
        <Link
          href="/opportunities/new"
          className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New opportunity
        </Link>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={fetchData} className="text-sm font-medium text-red-600 hover:text-red-800">Retry</button>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="mb-6 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
        <div className="flex items-center gap-4">
          <select
            value={filters.stage}
            onChange={(e) => { setFilters((p) => ({ ...p, stage: e.target.value, page: 1 })); }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="">All stages</option>
            <option value="LEAD">Lead</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="PROPOSAL">Proposal</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
          </select>

          <select
            value={filters.clientType}
            onChange={(e) => { setFilters((p) => ({ ...p, clientType: e.target.value, page: 1 })); }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="">All types</option>
            <option value="COMPANY">Companies</option>
            <option value="INDIVIDUAL">Individuals</option>
          </select>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.isProblematic}
              onChange={(e) => { setFilters((p) => ({ ...p, isProblematic: e.target.checked, page: 1 })); }}
              className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
            />
            <span className="text-sm text-gray-600">Problematic only</span>
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-100">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-100">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-100">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-100">Stage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-100">Close date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-100">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows />
            ) : opportunities.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4"><EmptyState onCreateClick={() => router.push('/opportunities/new')} /></td>
              </tr>
            ) : (
              opportunities.map((opp) => (
                <tr
                  key={opp.id}
                  onClick={() => router.push(`/opportunities/${opp.id}`)}
                  className={`cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 ${(opp.isLate || opp.isStagnant) ? 'border-l-4 border-l-red-400 bg-red-50/30' : ''}`}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{opp.title}</td>
                  <td className="px-6 py-4 text-sm text-blue-600 hover:underline">{opp.client
                    ? opp.client.type === 'COMPANY' ? opp.client.companyName : `${opp.client.firstName} ${opp.client.lastName}`
                    : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">{formatCurrency(opp.amount)}</td>
                  <td className="px-6 py-4"><StageBadge stage={opp.stage} /></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(opp.expectedCloseDate)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {opp.isLate && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">Late</span>}
                      {opp.isStagnant && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-600 border border-orange-200">Stagnant</span>}
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
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-400">Page {meta.page} of {meta.totalPages}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))} disabled={meta.page <= 1}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
            <button onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))} disabled={meta.page >= meta.totalPages}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}