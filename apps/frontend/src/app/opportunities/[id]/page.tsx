'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import type { Opportunity, OpportunityStage } from '@/lib/types';
import { useToast } from '@/components/ToastProvider';

// ─── Stage pipeline config ────────────────────────────────────────────────────
const PIPELINE_STAGES: OpportunityStage[] = ['PROSPECTING', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON'];

const stageConfig: Record<
  OpportunityStage,
  { label: string; activeColor: string; activeBg: string; activeBorder: string; textColor: string }
> = {
  PROSPECTING: { label: 'Prospecting',  activeColor: '#64748b', activeBg: '#f1f5f9', activeBorder: '#94a3b8', textColor: '#475569' },
  PROPOSAL:    { label: 'Proposal',     activeColor: '#d97706', activeBg: '#fffbeb', activeBorder: '#f59e0b', textColor: '#b45309' },
  NEGOTIATION: { label: 'Negotiation',  activeColor: '#7c3aed', activeBg: '#f5f3ff', activeBorder: '#8b5cf6', textColor: '#6d28d9' },
  CLOSED_WON:  { label: 'Closed Won',   activeColor: '#16a34a', activeBg: '#f0fdf4', activeBorder: '#22c55e', textColor: '#15803d' },
  CLOSED_LOST: { label: 'Closed Lost',  activeColor: '#dc2626', activeBg: '#fef2f2', activeBorder: '#f87171', textColor: '#b91c1c' },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function getStageIndex(stage: OpportunityStage): number {
  return PIPELINE_STAGES.indexOf(stage);
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ padding: '2.5rem 3rem', maxWidth: 1200, margin: '0 auto' }}>
      <style>{`@keyframes shimmer { 0%,100%{opacity:.45} 50%{opacity:.9} }`}</style>
      <div style={{ height: 14, background: '#e2e8f0', borderRadius: 4, width: 160, marginBottom: 32, animation: 'shimmer 1.4s ease-in-out infinite' }} />
      <div style={{ height: 28, background: '#e2e8f0', borderRadius: 6, width: 300, marginBottom: 10, animation: 'shimmer 1.4s ease-in-out infinite' }} />
      <div style={{ height: 14, background: '#e2e8f0', borderRadius: 4, width: 180, marginBottom: 32, animation: 'shimmer 1.4s ease-in-out infinite' }} />
      <div style={{ height: 64, background: '#e2e8f0', borderRadius: 10, marginBottom: 24, animation: 'shimmer 1.4s ease-in-out infinite' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div style={{ height: 260, background: '#e2e8f0', borderRadius: 12, animation: 'shimmer 1.4s ease-in-out infinite' }} />
        <div style={{ height: 260, background: '#e2e8f0', borderRadius: 12, animation: 'shimmer 1.4s ease-in-out infinite' }} />
      </div>
    </div>
  );
}

// ─── Chevron Stage Pipeline ────────────────────────────────────────────────────
function StagePipeline({
  current,
  onStageClick,
  updating,
}: {
  current: OpportunityStage;
  onStageClick: (stage: OpportunityStage) => void;
  updating: boolean;
}) {
  const currentIdx = getStageIndex(current);
  const isLost = current === 'CLOSED_LOST';

  return (
    <div style={{ marginBottom: 28 }}>
      {/* CSS for chevron shapes */}
      <style>{`
        .stage-step {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 44px;
          padding: 0 20px 0 28px;
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: 0.02em;
          cursor: pointer;
          border: none;
          outline: none;
          transition: filter 0.15s, opacity 0.15s;
          white-space: nowrap;
          clip-path: polygon(0% 0%, calc(100% - 14px) 0%, 100% 50%, calc(100% - 14px) 100%, 0% 100%, 14px 50%);
          flex: 1;
          min-width: 0;
        }
        .stage-step:first-child {
          clip-path: polygon(0% 0%, calc(100% - 14px) 0%, 100% 50%, calc(100% - 14px) 100%, 0% 100%);
          padding-left: 20px;
        }
        .stage-step:hover:not(:disabled) {
          filter: brightness(0.94);
        }
        .stage-step:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }
        .stage-step-inner {
          display: flex;
          align-items: center;
          gap: 7px;
          pointer-events: none;
          overflow: hidden;
        }
        .stage-step-check {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 9px;
        }
        .stage-step-label {
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .lost-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 16px;
          height: 44px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          border: 1.5px solid;
          transition: filter 0.15s, opacity 0.15s;
          white-space: nowrap;
          flex-shrink: 0;
          margin-left: 10px;
        }
        .lost-btn:hover:not(:disabled) { filter: brightness(0.93); }
        .lost-btn:disabled { cursor: not-allowed; opacity: 0.65; }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
        {PIPELINE_STAGES.map((stage, idx) => {
          const cfg = stageConfig[stage];
          const isCompleted = !isLost && idx < currentIdx;
          const isCurrent = stage === current;
          const isUpcoming = !isLost && idx > currentIdx;

          let bg: string;
          let color: string;
          let borderColor = 'transparent';

          if (isCurrent) {
            bg = cfg.activeBg;
            color = cfg.textColor;
            borderColor = cfg.activeBorder;
          } else if (isCompleted) {
            bg = '#e0f2fe';
            color = '#0369a1';
          } else {
            bg = '#f1f5f9';
            color = '#94a3b8';
          }

          return (
            <button
              key={stage}
              className="stage-step"
              onDoubleClick={() => !updating && onStageClick(stage)}
              disabled={updating}
              title={`x2 Click -> Set stage to ${cfg.label}`}
              style={{
                background: bg,
                color,
                outline: isCurrent ? `2px solid ${cfg.activeBorder}` : 'none',
                outlineOffset: isCurrent ? -2 : 0,
                zIndex: isCurrent ? 2 : isCompleted ? 1 : 0,
              }}
            >
              <span className="stage-step-inner">
                <span
                  className="stage-step-check"
                  style={{
                    background: isCurrent ? cfg.activeColor : isCompleted ? '#0284c7' : '#cbd5e1',
                    color: isCurrent || isCompleted ? '#fff' : '#94a3b8',
                  }}
                >
                  {isCompleted ? '✓' : idx + 1}
                </span>
                <span className="stage-step-label">{cfg.label}</span>
              </span>
            </button>
          );
        })}

        {/* CLOSED_LOST — separate pill */}
        <button
          className="lost-btn"
          title="x2 Click -> Set stage to Closed Lost"
          onDoubleClick={() => !updating && onStageClick('CLOSED_LOST')}
          disabled={updating}
          style={{
            background: isLost ? stageConfig.CLOSED_LOST.activeBg : 'transparent',
            color: isLost ? stageConfig.CLOSED_LOST.textColor : '#94a3b8',
            borderColor: isLost ? stageConfig.CLOSED_LOST.activeBorder : '#e2e8f0',
          }}
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Lost
        </button>
      </div>

      {/* Status hint */}
      <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 8, marginLeft: 2 }}>
        {updating
          ? '⏳ Updating stage…'
          : `Current stage: `}
        {!updating && (
          <span style={{ fontWeight: 600, color: stageConfig[current].textColor }}>
            {stageConfig[current].label}
          </span>
        )}
        {!updating && <span style={{ color: '#cbd5e1' }}> · Click any stage to update</span>}
      </p>
    </div>
  );
}

// ─── Field display helper ─────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', margin: '0 0 5px' }}>
        {label}
      </p>
      <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>{children}</div>
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider() {
  return <div style={{ borderTop: '1px solid #f1f5f9', margin: '20px 0' }} />;
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingStage, setUpdatingStage] = useState(false);
  const [stageError, setStageError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.opportunities.get(params.id as string);
      setOpportunity(response.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load opportunity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [params.id]);

  const handleStageClick = async (stage: OpportunityStage) => {
    if (!opportunity || stage === opportunity.stage) return;
    setUpdatingStage(true);
    setStageError(null);
    try {
      const response = await api.opportunities.update(params.id as string, { stage });
      setOpportunity(response.data);
      toast.success(`Deal stage updated to ${stage}`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to update stage.';
      setStageError(msg);
      toast.error(msg);
    } finally {
      setUpdatingStage(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.opportunities.delete(params.id as string);
      toast.success('Opportunity deleted successfully');
      router.push('/opportunities');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Delete failed.';
      setError(msg);
      toast.error(msg);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) return <Skeleton />;

  if (error && !opportunity) {
    return (
      <div style={PAGE}>
        <BackLink />
        <div style={{ padding: '14px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#b91c1c' }}>{error}</span>
          <button onClick={fetchData} style={{ fontSize: 12, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Retry</button>
        </div>
      </div>
    );
  }

  if (!opportunity) return null;

  const client = opportunity.client;
  const clientName = client
    ? client.type === 'COMPANY' ? client.companyName! : `${client.firstName} ${client.lastName}`
    : null;


  const stageCfg = stageConfig[opportunity.stage];

  return (
    <div style={PAGE}>
      <style>{GLOBAL_STYLES}</style>

      {/* Back */}
      <BackLink />


      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.025em' }}>
            {opportunity.title}
          </h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0', fontWeight: 400 }}>
            Created {formatDate(opportunity.createdAt)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href={`/opportunities/${opportunity.id}/edit`} style={BTN_OUTLINE}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/>
            </svg>
            Edit
          </Link>
          <button onClick={() => setShowDeleteConfirm(true)} style={BTN_DANGER}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Stage pipeline */}
      <StagePipeline current={opportunity.stage} onStageClick={handleStageClick} updating={updatingStage} />

      {/* Stage update error */}
      {stageError && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 12.5, color: '#b91c1c', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {stageError}
          <button onClick={() => setStageError(null)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 700, padding: 0, lineHeight: 1 }}>✕</button>
        </div>
      )}

      {/* Content */}
      <div style={{ display: 'grid', gridTemplateColumns: client ? '1fr 310px' : '1fr', gap: 20, alignItems: 'start' }}>

        {/* Left — Deal details card */}
        <div style={CARD}>
          {/* Hero metric */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <p style={FIELD_LABEL}>Deal Value</p>
              <p style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', margin: '4px 0 0', letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(opportunity.amount)}
              </p>
            </div>
            {/* Stage badge */}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              background: stageCfg.activeBg,
              color: stageCfg.textColor,
              border: `1px solid ${stageCfg.activeBorder}`,
              letterSpacing: '0.03em',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: stageCfg.activeColor, display: 'inline-block' }} />
              {stageCfg.label.toUpperCase()}
            </span>
          </div>

          <Divider />

          {/* 2-col info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 32px' }}>
            <Field label="Expected Close Date">
              <span style={{ color: '#1e293b' }}>
                {opportunity.expectedCloseDate ? formatDate(opportunity.expectedCloseDate) : '—'}
              </span>
            </Field>

            <Field label="Last Stage Change">
              <span style={{ color: '#1e293b' }}>
                {formatDate(opportunity.lastStageChange)}
              </span>
            </Field>
          </div>

          {/* Notes */}
          {opportunity.notes && (
            <>
              <Divider />
              <Field label="Notes">
                <p style={{ fontSize: 14, color: '#475569', margin: 0, lineHeight: 1.65, whiteSpace: 'pre-wrap', fontWeight: 400 }}>
                  {opportunity.notes}
                </p>
              </Field>
            </>
          )}
        </div>

        {/* Right — Client card */}
        {client && clientName && (
          <div style={CARD}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 20 }}>
              <div style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: '#eff6ff',
                border: '2px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#2563eb' }}>{getInitials(clientName)}</span>
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>{clientName}</p>
                <p style={{ fontSize: 11.5, color: '#94a3b8', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                  {client.type === 'COMPANY' ? 'Company' : 'Individual'}
                </p>
              </div>
            </div>

            <Divider />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Email">
                <a href={`mailto:${client.email}`} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
                  {client.email}
                </a>
              </Field>
              {client.phone && (
                <Field label="Phone">
                  <a href={`tel:${client.phone}`} style={{ color: '#1e293b', textDecoration: 'none' }}>
                    {client.phone}
                  </a>
                </Field>
              )}
              {client.type === 'COMPANY' && client.industry && (
                <Field label="Industry">{client.industry}</Field>
              )}
              {client.city && (
                <Field label="Location">
                  {client.city}{client.country ? `, ${client.country}` : ''}
                </Field>
              )}
            </div>

            <Divider />

            <Link
              href={`/clients/${client.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '9px 0',
                borderRadius: 8,
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                fontSize: 13,
                fontWeight: 600,
                color: '#2563eb',
                textDecoration: 'none',
                transition: 'background .15s',
              }}
            >
              View client profile
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '28px 28px 24px', maxWidth: 380, width: '100%', margin: '0 16px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>Delete this opportunity?</h3>
            <p style={{ fontSize: 13.5, color: '#64748b', margin: '0 0 24px', lineHeight: 1.55 }}>
              <strong style={{ color: '#1e293b' }}>{opportunity.title}</strong> will be permanently deleted. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={BTN_OUTLINE}>Cancel</button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ ...BTN_DANGER, opacity: deleting ? 0.65 : 1, cursor: deleting ? 'not-allowed' : 'pointer' }}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Back link ────────────────────────────────────────────────────────────────
function BackLink() {
  return (
    <Link
      href="/opportunities"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', textDecoration: 'none', marginBottom: 24, fontWeight: 500 }}
    >
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
      Back to opportunities
    </Link>
  );
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const PAGE: React.CSSProperties = {
  padding: '2.5rem 3rem',
  maxWidth: 1140,
  margin: '0 auto',
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
};

const CARD: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 14,
  padding: '24px 28px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
};

const FIELD_LABEL: React.CSSProperties = {
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#94a3b8',
  margin: 0,
};

const BTN_OUTLINE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 16px',
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  color: '#475569',
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'background .15s',
};

const BTN_DANGER: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 16px',
  background: '#fff',
  border: '1px solid #fecaca',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  color: '#dc2626',
  cursor: 'pointer',
  transition: 'background .15s',
};

const GLOBAL_STYLES = `
  * { box-sizing: border-box; }
  a:hover { opacity: .85; }
`;