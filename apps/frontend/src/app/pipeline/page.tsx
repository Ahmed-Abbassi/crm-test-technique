'use client';

import { useState, useEffect } from 'react';
import { api, ApiError } from '@/lib/api';
import type { PipelineSummary } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { formatCurrencyFull, formatCurrency, PageHeader, ErrorBanner, STAGE_CONFIG, STAGE_ORDER } from '@/components/ui';
import PipelineBoard from '@/components/PipelineBoard';

const stageColors: Record<string, string> = {
  PROSPECTING: '#706E6B',
  PROPOSAL: '#CA8501',
  NEGOTIATION: '#8B5CF6',
  CLOSED_WON: '#22C55E',
  CLOSED_LOST: '#EF4444',
};

function MetricCard({ label, value, problematic }: { label: string; value: string; problematic?: boolean }) {
  return (
    <div className="rounded-lg p-5 flex flex-col gap-3 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className={`text-2xl font-bold font-data ${problematic ? 'text-red-600' : ''}`} style={{ color: problematic ? undefined : 'var(--text-primary)' }}>
        {problematic && <span className="mr-1">⚠</span>}{value}
      </p>
    </div>
  );
}

export default function PipelinePage() {
  const [view, setView] = useState<'board' | 'analytics'>('board');
  const [summary, setSummary] = useState<PipelineSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.opportunities.pipeline();
      setSummary(response.data);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Failed to load pipeline data.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div>
      <div className="border-b px-8 py-5 flex items-center justify-between" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Pipeline</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Sales pipeline overview and metrics</p>
        </div>
        <div className="flex rounded-lg border border-gray-200 bg-white p-1">
          <button
            onClick={() => setView('board')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              view === 'board' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Board
          </button>
          <button
            onClick={() => setView('analytics')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              view === 'analytics' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      <div className="px-8 py-6 max-w-[1400px]">
        {view === 'board' ? (
          <PipelineBoard />
        ) : (
          <div className="space-y-6">
            {error && <ErrorBanner message={error} onRetry={fetchData} />}

            {/* Metric cards */}
            {loading ? (
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="rounded-lg p-5 border animate-pulse" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <div className="h-3 w-24 rounded mb-4" style={{ background: '#F3F2F1' }} />
                    <div className="h-7 w-32 rounded" style={{ background: '#F3F2F1' }} />
                  </div>
                ))}
              </div>
            ) : summary ? (
              <div className="grid grid-cols-4 gap-4">
                <MetricCard label="Total pipeline value" value={formatCurrency(summary.totalPipelineValue)} />
                <MetricCard label="Win rate" value={`${summary.winRate.toFixed(1)}%`} />
                <MetricCard label="Average deal size" value={formatCurrency(summary.averageDealSize)} />
                <MetricCard label="Problematic" value={String(summary.problematicCount)} problematic={summary.problematicCount > 0} />
              </div>
            ) : null}

            {/* Bar chart */}
            {!loading && summary && (
              <div className="rounded-lg border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>Value by stage</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={summary.byStage.map((s) => ({ name: s.stage, value: s.totalValue, count: s.count }))} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F2F1" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#706E6B' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#706E6B' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(value: number) => [formatCurrencyFull(value), 'Value']}
                      labelFormatter={(label) => `Stage: ${label}`}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #DDDBDA', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
                      {summary.byStage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={stageColors[entry.stage] || '#d1d5db'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Stage breakdown table */}
            {!loading && summary && (
              <div className="rounded-lg border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Stage breakdown</h2>
                </div>
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>Stage</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>Count</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>Total value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.byStage.map((s) => (
                      <tr key={s.stage} className="border-b last:border-0 transition-colors hover:bg-gray-50"
                        style={{ borderLeft: `4px solid ${stageColors[s.stage] || '#DDDBDA'}`, borderColor: 'var(--border-light)' }}>
                        <td className="px-5 py-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.stage}</td>
                        <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>{s.count}</td>
                        <td className="px-5 py-4 text-sm font-bold font-data" style={{ color: 'var(--text-primary)' }}>{formatCurrencyFull(s.totalValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}