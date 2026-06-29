'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import type { Client } from '@/lib/types';
import { ArrowLeft, Trash2, Plus } from 'lucide-react';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
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
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load client.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.clients.delete(params.id as string);
      router.push('/clients');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      }
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="mb-6"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse" /></div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Link href="/clients" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to clients
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-red-800 text-sm">{error}</p>
            <button onClick={fetchData} className="text-sm text-red-600 hover:text-red-800 underline">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (!client) return null;

  return (
    <div>
      <Link href="/clients" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to clients
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {client.type === 'COMPANY' ? client.companyName : `${client.firstName} ${client.lastName}`}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Created {formatDate(client.createdAt)}</p>
        </div>
        <button onClick={() => setShowDeleteConfirm(true)}
          className="inline-flex items-center px-3 py-2 border border-red-300 text-red-700 rounded-lg text-sm hover:bg-red-50">
          <Trash2 className="w-4 h-4 mr-2" /> Delete
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Type</label>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              client.type === 'COMPANY' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }`}>{client.type === 'COMPANY' ? 'Company' : 'Individual'}</span>
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Email</label>
            <p className="text-sm text-gray-900">{client.email}</p>
          </div>
          {client.phone && (
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Phone</label>
              <p className="text-sm text-gray-900">{client.phone}</p>
            </div>
          )}
          {client.type === 'COMPANY' && (
            <>
              {client.industry && (
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Industry</label>
                  <p className="text-sm text-gray-900">{client.industry}</p>
                </div>
              )}
              {client.website && (
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Website</label>
                  <p className="text-sm text-gray-900">{client.website}</p>
                </div>
              )}
              {client.employeeCount && (
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Employees</label>
                  <p className="text-sm text-gray-900">{client.employeeCount}</p>
                </div>
              )}
            </>
          )}
          {client.city && (
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Location</label>
              <p className="text-sm text-gray-900">{client.city}{client.country ? `, ${client.country}` : ''}</p>
            </div>
          )}
          {client.address && (
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Address</label>
              <p className="text-sm text-gray-900">{client.address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Opportunities */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Opportunities</h2>
          <Link href={`/opportunities/new?clientId=${client.id}`}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Link>
        </div>
        {client.opportunities && client.opportunities.length > 0 ? (
          <div className="space-y-3">
            {client.opportunities.map((opp) => (
              <div key={opp.id} onClick={() => router.push(`/opportunities/${opp.id}`)}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{opp.title}</p>
                  <p className="text-xs text-gray-500">{opp.stage}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  ${Number(opp.amount).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No opportunities for this client.</p>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete client</h3>
            <p className="text-sm text-gray-500 mb-6">This will also delete all associated opportunities. This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}