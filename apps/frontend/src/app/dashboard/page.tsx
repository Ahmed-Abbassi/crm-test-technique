'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import type { PipelineSummary, Opportunity } from '@/lib/types';
import {
  MetricCard, ErrorBanner, StageBadge,
  formatCurrency, formatCurrencyFull, formatDate, formatRelative, clientName,
  STAGE_CONFIG, STAGE_ORDER, PrimaryButton,
} from '@/components/ui';

function PipelineFunnel({ data }: { data: PipelineSummary['byStage'] }) {
  const activeStages = STAGE_ORDER.filter(s => s !== 'CLOSED_WON' && s !== 'CLOSED_LOST');
  const max = Math.max(...activeStages.map(s => data.find(d => d.stage === s)?.totalValue ?? 0), 1);

  return (
    <div className="flex flex-col gap-2">
      {activeStages.map((stage, i) => {
        const d = data.find(x => x.stage === stage);
        const value = d?.totalValue ?? 0;
        const count = d?.count ?? 0;
        const cfg = STAGE_CONFIG[stage];
        const pct = Math.max((value / max) * 100, 4);

        return (
          <div key={stage} className="flex items-center gap-3">
            <span className="text-xs font-medium w-28 text-right flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
              {cfg.label}
            </span>
            <div className="flex-1 h-6 rounded" style={{ background: '#F3F2F1' }}>
              <div
                className="h-full rounded flex items-center px-2 transition-all duration-700"
                style={{ width: `${pct}%`, background: cfg.dot, minWidth: 32 }}
              >
                <span className="text-[10px] font-bold text-white truncate">{count}</span>
              </div>
            </div>
            <span className="text-xs font-semibold font-data w-16 text-right flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
              {formatCurrency(value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<PipelineSummary | null>(null);
  const [recent, setRecent] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pipelineRes, recentRes] = await Promise.all([
        api.opportunities.pipeline(),
        api.opportunities.list({ limit: 5, page: 1 }),
      ]);
      setSummary(pipelineRes.data);
      setRecent(recentRes.data);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div>
      {/* Top bar */}
      <div className="border-b px-8 py-5 flex items-center justify-between" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{today}</p>
          <h1 className="text-2xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>Good morning, Sales Lead</h1>
        </div>
        <div className="flex items-center gap-3">
          
        </div>
      </div>

      <div className="px-8 py-6 space-y-6 max-w-[1400px]">
        {error && <ErrorBanner message={error} onRetry={fetchData} />}

        {/* KPI Row */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-lg p-5 border animate-pulse" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="h-3 w-24 rounded mb-4" style={{ background: '#F3F2F1' }} />
                <div className="h-7 w-32 rounded" style={{ background: '#F3F2F1' }} />
              </div>
            ))}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Pipeline"
              value={formatCurrency(summary.totalPipelineValue)}
              subValue={`${summary.totalCount} open deals`}
              icon={<svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>}
              accent="#D8EDFF"
            />
            <MetricCard
              label="Won Revenue"
              value={formatCurrency(summary.wonValue)}
              subValue={`${summary.winRate.toFixed(1)}% win rate`}
              icon={<svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clipRule="evenodd" /><path fillRule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clipRule="evenodd" /></svg>}
              accent="#EEF4EE"
            />
            <MetricCard
              label="Avg Deal Size"
              value={formatCurrency(summary.averageDealSize)}
              subValue="Across all stages"
              icon={<svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 01-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004zM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 01-.921.42z" /><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v.816a3.836 3.836 0 00-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 01-.921-.421l-.879-.66a.75.75 0 00-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 001.5 0v-.81a4.124 4.124 0 001.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 00-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 00.933-1.175l-.415-.33a3.836 3.836 0 00-1.719-.755V6z" clipRule="evenodd" /></svg>}
              accent="#FEF5C3"
            />
            <MetricCard
              label="Needs Attention"
              value={String(summary.problematicCount)}
              subValue="Late or stagnant deals"
              icon={<svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 1.999-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></svg>}
              accent="#FDECEC"
            />
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pipeline funnel */}
          <div className="lg:col-span-2 rounded-lg border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Pipeline by Stage</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Active opportunities only</p>
              </div>
              <Link href="/pipeline" className="text-xs font-semibold hover:underline" style={{ color: 'var(--brand-blue)' }}>Full report →</Link>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-3 w-24 rounded animate-pulse" style={{ background: '#F3F2F1' }} />
                      <div className="flex-1 h-6 rounded animate-pulse" style={{ background: '#F3F2F1' }} />
                      <div className="h-3 w-16 rounded animate-pulse" style={{ background: '#F3F2F1' }} />
                    </div>
                  ))}
                </div>
              ) : summary ? (
                <PipelineFunnel data={summary.byStage} />
              ) : null}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-lg border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              {[
                { href: '/opportunities/new', label: 'Log a new deal', icon: '💼', desc: 'Add to pipeline' },
                { href: '/clients/new', label: 'Add a client', icon: '🏢', desc: 'Company or individual' },
                { href: '/pipeline', label: 'View pipeline board', icon: '📊', desc: 'Kanban view' },
                { href: '/opportunities', label: 'Review all deals', icon: '⚠️', desc: `${summary?.totalCount ?? 0} total deals` },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all hover:shadow-sm"
                  style={{ borderColor: 'var(--border-light)', background: '#FAFAF9' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F3F2F1'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#FAFAF9'}>
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>


        {/* Recent opportunities */}
        <div className="rounded-lg border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Opportunities</h2>
            <Link href="/opportunities" className="text-xs font-semibold hover:underline" style={{ color: 'var(--brand-blue)' }}>All deals →</Link>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 rounded" style={{ background: '#F3F2F1' }} />
                    <div className="h-3 w-32 rounded" style={{ background: '#F3F2F1' }} />
                  </div>
                  <div className="h-5 w-20 rounded-full" style={{ background: '#F3F2F1' }} />
                  <div className="h-4 w-16 rounded" style={{ background: '#F3F2F1' }} />
                </div>
              ))
            ) : recent.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No opportunities yet.</p>
            ) : (
              recent.map(opp => (
                <Link key={opp.id} href={`/opportunities/${opp.id}`}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50 block">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{opp.title}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                      {opp.client ? clientName(opp.client) : '—'} · {formatRelative(opp.createdAt)}
                    </p>
                  </div>
                  <StageBadge stage={opp.stage} />
                  <span className="text-sm font-bold font-data flex-shrink-0" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrencyFull(opp.amount)}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}