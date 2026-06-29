'use client';

import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import type { PipelineSummary } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}

const stageColors: Record<string, string> = {
  LEAD: '#6b7280',
  QUALIFIED: '#3b82f6',
  PROPOSAL: '#f59e0b',
  NEGOTIATION: '#a855f7',
  WON: '#22c55e',
  LOST: '#ef4444',
};

const stageBorders: Record<string, string> = {
  LEAD: 'border-l-gray-400',
  QUALIFIED: 'border-l-blue-500',
  PROPOSAL: 'border-l-amber-500',
  NEGOTIATION: 'border-l-purple-500',
  WON: 'border-l-green-500',
  LOST: 'border-l-red-500',
};

function MetricCard({ title, value, problematic }: { title: string; value: string; problematic?: boolean }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{title}</p>
      <p className={`text-2xl font-semibold ${problematic ? 'text-red-600' : 'text-gray-900'}`}>
        {problematic && <span className="mr-1">⚠</span>}{value}
      </p>
    </div>
  );
}

export default function PipelinePage() {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-900 mb-8">Pipeline</h1>
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
              <div className="h-8 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
          <div className="h-64 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-900 mb-8">Pipeline</h1>
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={fetchData} className="text-sm font-medium text-red-600 hover:text-red-800">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const chartData = summary.byStage.map((s) => ({ name: s.stage, value: s.totalValue, count: s.count }));

  return (
    <div className="px-8 py-8 max-w-7xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-8">Pipeline</h1>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <MetricCard title="Total pipeline value" value={formatCurrency(summary.totalPipelineValue)} />
        <MetricCard title="Win rate" value={`${summary.winRate.toFixed(1)}%`} />
        <MetricCard title="Average deal size" value={formatCurrency(summary.averageDealSize)} />
        <MetricCard title="Problematic" value={String(summary.problematicCount)} problematic={summary.problematicCount > 0} />
      </div>

      {/* Bar chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="text-sm font-medium text-gray-700 mb-4">Value by stage</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Value']}
              labelFormatter={(label) => `Stage: ${label}`}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={stageColors[entry.name] || '#d1d5db'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stage breakdown table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-700">Stage breakdown</h2>
        </div>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-100">Stage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-100">Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-100">Total value</th>
            </tr>
          </thead>
          <tbody>
            {summary.byStage.map((s) => (
              <tr key={s.stage} className={`border-l-4 ${stageBorders[s.stage]} hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0`}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.stage}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{s.count}</td>
                <td className="px-6 py-4 text-sm font-mono text-gray-900">{formatCurrency(s.totalValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}