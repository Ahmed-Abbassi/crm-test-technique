'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import type { Client } from '@/lib/types';
import { formatDate, formatCurrencyFull, PageHeader, ErrorBanner, DangerButton, StageBadge } from '@/components/ui';

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.clients.get(params.id as string);
      setClient(response.data);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Failed to load client.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [params.id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.clients.delete(params.id as string);
      router.push('/clients');
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Client" />
        <div className="px-8 py-6 max-w-5xl mx-auto">
          <div className="rounded-lg border p-6 animate-pulse space-y-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="h-6 rounded w-1/3" style={{ background: '#F3F2F1' }} />
            <div className="h-4 rounded w-1/2" style={{ background: '#F3F2F1' }} />
            <div className="h-4 rounded w-2/3" style={{ background: '#F3F2F1' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Client" breadcrumb={[{ label: 'Clients', href: '/clients' }]} />
        <div className="px-8 py-6 max-w-5xl mx-auto">
          <ErrorBanner message={error} onRetry={fetchData} />
        </div>
      </div>
    );
  }

  if (!client) return null;

  const clientName = client.type === 'COMPANY' ? client.companyName : `${client.firstName} ${client.lastName}`;

  return (
    <div>
      <PageHeader
        title={clientName || ''}
        subtitle={`Created ${formatDate(client.createdAt)}`}
        breadcrumb={[{ label: 'Clients', href: '/clients' }]}
        actions={
          <button onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-all"
            style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid #F4C3C3' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Delete
          </button>
        }
      />

      <div className="px-8 py-6 max-w-5xl mx-auto space-y-6">
        {/* Client info card */}
        <div className="rounded-lg border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#F3F2F1' }}>
              <span className="text-lg font-medium" style={{ color: 'var(--text-muted)' }}>{getInitials(clientName || '?')}</span>
            </div>
            <div>
              <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{clientName}</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium mt-1"
                style={{ color: client.type === 'COMPANY' ? '#0176D3' : '#2E844A', background: client.type === 'COMPANY' ? '#D8EDFF' : '#EEF4EE' }}>
                {client.type === 'COMPANY' ? 'Company' : 'Individual'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Email</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{client.email}</p>
            </div>
            {client.phone && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Phone</p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{client.phone}</p>
              </div>
            )}
            {client.type === 'COMPANY' && client.industry && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Industry</p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{client.industry}</p>
              </div>
            )}
            {client.type === 'COMPANY' && client.website && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Website</p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{client.website}</p>
              </div>
            )}
            {client.type === 'COMPANY' && client.employeeCount && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Employees</p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{client.employeeCount}</p>
              </div>
            )}
            {client.city && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Location</p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{client.city}{client.country ? `, ${client.country}` : ''}</p>
              </div>
            )}
            {client.address && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Address</p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{client.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* Opportunities */}
        <div className="rounded-lg border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Opportunities</h2>
            <Link href={`/opportunities/new?clientId=${client.id}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold border transition-all"
              style={{ color: 'var(--brand-blue)', borderColor: 'var(--brand-blue)', background: 'white' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add
            </Link>
          </div>
          {client.opportunities && client.opportunities.length > 0 ? (
            <div className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
              {client.opportunities.map((opp) => (
                <div key={opp.id} onClick={() => router.push(`/opportunities/${opp.id}`)}
                  className="flex items-center justify-between px-5 py-3 cursor-pointer transition-colors hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{opp.title}</p>
                    <StageBadge stage={opp.stage} />
                  </div>
                  <p className="text-sm font-bold font-data" style={{ color: 'var(--text-primary)' }}>{formatCurrencyFull(Number(opp.amount))}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No opportunities for this client.</div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-lg">
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Delete client</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>This will also delete all associated opportunities. This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border rounded-lg text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: 'var(--danger)' }}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}