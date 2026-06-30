'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import type { Lead, LeadStatus } from '@/lib/types';
import { LeadStatusBadge, formatDate } from '@/components/ui';
import EditLeadDrawer from '../EditLeadDrawer';
import ConvertLeadDrawer from '../ConvertLeadDrawer';

// ─── Status step config ────────────────────────────────────────────────────
const STATUS_FLOW: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED'];

const statusConfig: Record<LeadStatus, { label: string; activeColor: string; activeBg: string; activeBorder: string; textColor: string }> = {
  NEW:          { label: 'New',          activeColor: '#64748b', activeBg: '#f1f5f9', activeBorder: '#94a3b8', textColor: '#475569' },
  CONTACTED:    { label: 'Contacted',    activeColor: '#2563eb', activeBg: '#eff6ff', activeBorder: '#3b82f6', textColor: '#1d4ed8' },
  QUALIFIED:    { label: 'Qualified',    activeColor: '#16a34a', activeBg: '#f0fdf4', activeBorder: '#22c55e', textColor: '#15803d' },
  DISQUALIFIED: { label: 'Disqualified', activeColor: '#dc2626', activeBg: '#fef2f2', activeBorder: '#f87171', textColor: '#b91c1c' },
};

function getStatusIndex(status: LeadStatus): number {
  return STATUS_FLOW.indexOf(status);
}

// ─── Status Pipeline ────────────────────────────────────────────────────────
function StatusPipeline({
  current,
  onStatusClick,
  updating,
  readOnly,
}: {
  current: LeadStatus;
  onStatusClick: (status: LeadStatus) => void;
  updating: boolean;
  readOnly: boolean;
}) {
  const currentIdx = getStatusIndex(current);
  const isDisqualified = (current as string) === 'DISQUALIFIED';

  return (
    <div style={{ marginBottom: 28 }}>
      <style>{`
        .status-step {
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
        .status-step:first-child {
          clip-path: polygon(0% 0%, calc(100% - 14px) 0%, 100% 50%, calc(100% - 14px) 100%, 0% 100%);
          padding-left: 20px;
        }
        .status-step:hover:not(:disabled) {
          filter: brightness(0.94);
        }
        .status-step:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }
        .status-step-inner {
          display: flex;
          align-items: center;
          gap: 7px;
          pointer-events: none;
          overflow: hidden;
        }
        .status-step-check {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 9px;
        }
        .status-step-label {
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .disq-btn {
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
        .disq-btn:hover:not(:disabled) { filter: brightness(0.93); }
        .disq-btn:disabled { cursor: not-allowed; opacity: 0.65; }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
        {STATUS_FLOW.map((status, idx) => {
          const cfg = statusConfig[status];
          const isCompleted = !isDisqualified && idx < currentIdx;
          const isCurrent = status === current;
          const isUpcoming = !isDisqualified && idx > currentIdx;

          const canClick = !readOnly && !isCompleted && idx > currentIdx && idx <= currentIdx + 1;

          let bg: string;
          let color: string;

          if (isCurrent) {
            bg = cfg.activeBg;
            color = cfg.textColor;
          } else if (isCompleted) {
            bg = '#e0f2fe';
            color = '#0369a1';
          } else if (isUpcoming && !readOnly && idx === currentIdx + 1 && current !== 'DISQUALIFIED') {
            bg = '#f8fafc';
            color = '#64748b';
          } else {
            bg = '#f1f5f9';
            color = '#94a3b8';
          }

          return (
            <button
              key={status}
              className="status-step"
              onClick={() => canClick && onStatusClick(status)}
              disabled={!canClick || updating}
              title={canClick ? `Set status to ${cfg.label}` : undefined}
              style={{
                background: bg,
                color,
                outline: isCurrent ? `2px solid ${cfg.activeBorder}` : 'none',
                outlineOffset: isCurrent ? -2 : 0,
                zIndex: isCurrent ? 2 : isCompleted ? 1 : 0,
              }}
            >
              <span className="status-step-inner">
                <span
                  className="status-step-check"
                  style={{
                    background: isCurrent ? cfg.activeColor : isCompleted ? '#0284c7' : '#cbd5e1',
                    color: isCurrent || isCompleted ? '#fff' : '#94a3b8',
                  }}
                >
                  {isCompleted ? '✓' : idx + 1}
                </span>
                <span className="status-step-label">{cfg.label}</span>
              </span>
            </button>
          );
        })}

        {/* DISQUALIFIED — separate pill */}
        <button
          className="disq-btn"
          onClick={() => !readOnly && currentIdx === 1 && onStatusClick('DISQUALIFIED')}
          disabled={readOnly || currentIdx !== 1 || updating}
          style={{
            background: isDisqualified ? statusConfig.DISQUALIFIED.activeBg : 'transparent',
            color: isDisqualified ? statusConfig.DISQUALIFIED.textColor : '#94a3b8',
            borderColor: isDisqualified ? statusConfig.DISQUALIFIED.activeBorder : '#e2e8f0',
          }}
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Disqualified
        </button>
      </div>

      {/* Status hint */}
      <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 8, marginLeft: 2 }}>
        {updating
          ? '⏳ Updating status…'
          : readOnly
          ? 'Status cannot be changed after conversion.'
          : `Current status: `}
        {!updating && !readOnly && (
          <span style={{ fontWeight: 600, color: statusConfig[current].textColor }}>
            {statusConfig[current].label}
          </span>
        )}
        {!updating && !readOnly && currentIdx >= 0 && currentIdx < 2 && (
          <span style={{ color: '#cbd5e1' }}> · Click next stage to advance</span>
        )}
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ padding: '2.5rem 3rem', maxWidth: 1200, margin: '0 auto' }}>
      <style>{`@keyframes shimmer { 0%,100%{opacity:.45} 50%{opacity:.9} }`}</style>
      <div style={{ height: 14, background: '#e2e8f0', borderRadius: 4, width: 160, marginBottom: 32, animation: 'shimmer 1.4s ease-in-out infinite' }} />
      <div style={{ height: 28, background: '#e2e8f0', borderRadius: 6, width: 300, marginBottom: 10, animation: 'shimmer 1.4s ease-in-out infinite' }} />
      <div style={{ height: 14, background: '#e2e8f0', borderRadius: 4, width: 180, marginBottom: 32, animation: 'shimmer 1.4s ease-in-out infinite' }} />
      <div style={{ height: 64, background: '#e2e8f0', borderRadius: 10, marginBottom: 24, animation: 'shimmer 1.4s ease-in-out infinite' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        <div style={{ height: 360, background: '#e2e8f0', borderRadius: 12, animation: 'shimmer 1.4s ease-in-out infinite' }} />
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [convertDrawerOpen, setConvertDrawerOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.leads.get(params.id as string);
      setLead(response.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load lead.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [params.id]);

  const isConverted = lead?.convertedAt != null;
  const isReadOnly = isConverted;


  const handleStatusClick = async (status: LeadStatus) => {
    if (!lead || status === lead.status) return;
    setUpdatingStatus(true);
    setStatusError(null);
    try {
      const response = await api.leads.update(params.id as string, { status });
      setLead(response.data);
    } catch (err) {
      setStatusError(err instanceof ApiError ? err.message : 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.leads.delete(params.id as string);
      router.push('/leads');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Delete failed.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEditSaved = async () => {
    setEditDrawerOpen(false);
    await fetchData();
  };

  const handleConverted = async () => {
    setConvertDrawerOpen(false);
    await fetchData();
  };

  if (loading) return <Skeleton />;

  if (error && !lead) {
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

  if (!lead) return null;

  const leadName = [lead.firstName, lead.lastName].filter(Boolean).join(' ') || lead.email;

  return (
    <div style={PAGE}>
      <style>{GLOBAL_STYLES}</style>

      {/* Back */}
      <BackLink />

      {/* Converted banner */}
      {isConverted && (
        <div style={{ marginBottom: 20, padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 16, lineHeight: 1.5 }}>✅</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#166534', margin: '0 0 6px' }}>This lead has been converted into a client.</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {lead.convertedToClient && (
                <Link href={`/clients/${lead.convertedToClient.id}`} style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', textDecoration: 'underline' }}>
                  View client →
                </Link>
              )}
              {lead.convertedToOpportunity && (
                <Link href={`/opportunities/${lead.convertedToOpportunity.id}`} style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', textDecoration: 'underline' }}>
                  View opportunity →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.025em' }}>
              {leadName}
            </h1>
            <LeadStatusBadge status={lead.status} />
            {isConverted && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 10px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                background: '#dcfce7',
                color: '#166534',
                border: '1px solid #86efac',
              }}>
                Converted
              </span>
            )}
          </div>
          {lead.companyName && (
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 6px', fontWeight: 500 }}>
              {lead.companyName}{lead.title ? ` — ${lead.title}` : ''}
            </p>
          )}
          <div style={{ display: 'flex', gap: 16, fontSize: 12.5, color: '#94a3b8' }}>
            <span>Created {formatDate(lead.createdAt)}</span>
            <span>Updated {formatDate(lead.updatedAt)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {!isReadOnly && (
            <button onClick={() => setEditDrawerOpen(true)} style={BTN_OUTLINE}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/>
              </svg>
              Edit
            </button>
          )}
          {lead.status === 'QUALIFIED' && !isConverted && (
            <button onClick={() => setConvertDrawerOpen(true)} style={BTN_CONVERT}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Convert
            </button>
          )}
          <button onClick={() => setShowDeleteConfirm(true)} style={BTN_DANGER}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Status pipeline */}
      <StatusPipeline current={lead.status} onStatusClick={handleStatusClick} updating={updatingStatus} readOnly={isReadOnly} />

      {/* Status update error */}
      {statusError && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 12.5, color: '#b91c1c', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {statusError}
          <button onClick={() => setStatusError(null)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 700, padding: 0, lineHeight: 1 }}>✕</button>
        </div>
      )}

      {/* Lead info card */}
      <div style={CARD}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 32px' }}>
          <Field label="Email">
            <a href={`mailto:${lead.email}`} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
              {lead.email}
            </a>
          </Field>

          <Field label="Phone">
            {lead.phone ? (
              <a href={`tel:${lead.phone}`} style={{ color: '#1e293b', textDecoration: 'none' }}>
                {lead.phone}
              </a>
            ) : (
              <span style={{ color: '#94a3b8' }}>—</span>
            )}
          </Field>

          <Field label="Company">
            <span>{lead.companyName || <span style={{ color: '#94a3b8' }}>—</span>}</span>
          </Field>

          <Field label="Job Title">
            <span>{lead.title || <span style={{ color: '#94a3b8' }}>—</span>}</span>
          </Field>

          <Field label="Source">
            <span>{lead.source || <span style={{ color: '#94a3b8' }}>—</span>}</span>
          </Field>

          <Field label="Status">
            <LeadStatusBadge status={lead.status} />
          </Field>
        </div>

        {/* Notes */}
        {lead.notes && (
          <>
            <Divider />
            <Field label="Notes">
              <p style={{ fontSize: 14, color: '#475569', margin: 0, lineHeight: 1.65, whiteSpace: 'pre-wrap', fontWeight: 400 }}>
                {lead.notes}
              </p>
            </Field>
          </>
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
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>Delete this lead?</h3>
            <p style={{ fontSize: 13.5, color: '#64748b', margin: '0 0 24px', lineHeight: 1.55 }}>
              <strong style={{ color: '#1e293b' }}>{leadName}</strong> will be permanently deleted. This action cannot be undone.
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

      {/* Edit drawer */}
      {lead && (
        <EditLeadDrawer
          lead={lead}
          open={editDrawerOpen}
          onClose={() => setEditDrawerOpen(false)}
          onSaved={handleEditSaved}
        />
      )}

      {/* Convert drawer */}
      {lead && (
        <ConvertLeadDrawer
          leadId={lead.id}
          open={convertDrawerOpen}
          onClose={() => setConvertDrawerOpen(false)}
          onConverted={handleConverted}
        />
      )}
    </div>
  );
}

// ─── Back link ────────────────────────────────────────────────────────────────
function BackLink() {
  return (
    <Link
      href="/leads"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', textDecoration: 'none', marginBottom: 24, fontWeight: 500 }}
    >
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
      Back to leads
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

const BTN_CONVERT: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 16px',
  background: '#f0fdf4',
  border: '1px solid #86efac',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  color: '#166534',
  cursor: 'pointer',
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