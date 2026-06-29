'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import type { Client } from '@/lib/types';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

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
      <div className="px-8 py-8 max-w-5xl mx-auto">
        <div className="mb-6"><div className="h-4 bg-gray-100 rounded w-24 animate-pulse" /></div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse space-y-4">
          <div className="h-6 bg-gray-100 rounded w-1/3" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-8 py-8 max-w-5xl mx-auto">
        <Link href="/clients" className="inline-flex items-center text-sm text-gray-400 hover:text-gray-600 mb-6">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          Back
        </Link>
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={fetchData} className="text-sm font-medium text-red-600 hover:text-red-800">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (!client) return null;

  const clientName = client.type === 'COMPANY' ? client.companyName : `${client.firstName} ${client.lastName}`;

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto">
      <Link href="/clients" className="inline-flex items-center text-sm text-gray-400 hover:text-gray-600 mb-6">
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to clients
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-medium text-gray-600">{getInitials(clientName || '?')}</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{clientName}</h1>
            <p className="text-sm text-gray-400 mt-1">Created {formatDate(client.createdAt)}</p>
          </div>
        </div>
        <button onClick={() => setShowDeleteConfirm(true)}
          className="inline-flex items-center px-3 py-2 border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
          Delete
        </button>
      </div>

      <div className="flex gap-8">
        <div className="flex-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Type</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${client.type === 'COMPANY' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                  {client.type === 'COMPANY' ? 'Company' : 'Individual'}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</p>
                <p className="text-sm text-gray-900 mt-0.5">{client.email}</p>
              </div>
              {client.phone && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Phone</p>
                  <p className="text-sm text-gray-900 mt-0.5">{client.phone}</p>
                </div>
              )}
              {client.type === 'COMPANY' && client.industry && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Industry</p>
                  <p className="text-sm text-gray-900 mt-0.5">{client.industry}</p>
                </div>
              )}
              {client.type === 'COMPANY' && client.website && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Website</p>
                  <p className="text-sm text-gray-900 mt-0.5">{client.website}</p>
                </div>
              )}
              {client.type === 'COMPANY' && client.employeeCount && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Employees</p>
                  <p className="text-sm text-gray-900 mt-0.5">{client.employeeCount}</p>
                </div>
              )}
              {client.city && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Location</p>
                  <p className="text-sm text-gray-900 mt-0.5">{client.city}{client.country ? `, ${client.country}` : ''}</p>
                </div>
              )}
              {client.address && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Address</p>
                  <p className="text-sm text-gray-900 mt-0.5">{client.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Opportunities */}
          <div className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-700">Opportunities</h2>
              <Link href={`/opportunities/new?clientId=${client.id}`}
                className="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add
              </Link>
            </div>
            {client.opportunities && client.opportunities.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {client.opportunities.map((opp) => (
                  <div key={opp.id} onClick={() => router.push(`/opportunities/${opp.id}`)}
                    className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{opp.title}</p>
                      <p className="text-xs text-gray-400">{opp.stage}</p>
                    </div>
                    <p className="text-sm font-mono text-gray-900">${Number(opp.amount).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-sm text-gray-400">No opportunities for this client.</div>
            )}
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Delete client</h3>
            <p className="text-sm text-gray-500 mb-6">This will also delete all associated opportunities. This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}