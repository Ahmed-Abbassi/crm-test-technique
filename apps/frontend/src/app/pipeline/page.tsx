'use client';

import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import type { PipelineSummary } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { AlertTriangle, DollarSign, Target, TrendingUp, AlertOctagon } from 'lucide-react';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  isProblematic,
}: {
  title: string;
  value: string;
  icon: any;
  color: string;
  isProblematic?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">{title}</p>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {isProblematic && (
        <div className="mt-2 flex items-center gap-1 text-red-600">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs font-medium">Needs attention</span>
        </div>
      )}
    </div>
  );
}

const stageColors: Record<string, string> = {
  LEAD: '#9CA3AF',
  QUALIFIED: '#3B82F6',
  PROPOSAL: '#F59E0B',
  NEGOTIATION: '#8B5CF6',
  WON: '#10B981',
  LOST: '#EF4444',
};

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
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load pipeline data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Pipeline Dashboard
        </h1>
        <div className="grid grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-3" />
              <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Pipeline Dashboard
        </h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-red-800 text-sm">{error}</p>
            <button
              onClick={fetchData}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const chartData = summary.byStage.map((s) => ({
    name: s.stage,
    value: s.totalValue,
    count: s.count,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Pipeline Dashboard
      </h1>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Pipeline Value"
          value={formatCurrency(summary.totalPipelineValue)}
          icon={DollarSign}
          color="bg-blue-600"
        />
        <MetricCard
          title="Win Rate"
          value={`${summary.winRate.toFixed(1)}%`}
          icon={Target}
          color="bg-green-600"
        />
        <MetricCard
          title="Average Deal Size"
          value={formatCurrency(summary.averageDealSize)}
          icon={TrendingUp}
          color="bg-purple-600"
        />
        <MetricCard
          title="Problematic"
          value={String(summary.problematicCount)}
          icon={AlertOctagon}
          color="bg-red-600"
          isProblematic={summary.problematicCount > 0}
        />
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Value by Stage
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickFormatter={(value) =>
                `$${(value / 1000).toFixed(0)}k`
              }
            />
            <Tooltip
              formatter={(value: number) => [
                formatCurrency(value),
                'Total Value',
              ]}
              labelFormatter={(label) => `Stage: ${label}`}
            />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            >
              {chartData.map((entry, index) => (
                <rect key={index} fill={stageColors[entry.name]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stage breakdown table */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 p-6 pb-0">
          Stage Breakdown
        </h2>
        <table className="min-w-full divide-y divide-gray-200 mt-4">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Value
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {summary.byStage.map((s) => (
              <tr key={s.stage} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stageColors[s.stage] }}
                    />
                    {s.stage}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {s.count}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatCurrency(s.totalValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}