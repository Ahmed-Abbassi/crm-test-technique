'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import type { Client, PaginationMeta } from '@/lib/types';
import NewClientDrawer from './Newclientdrawer';

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i}>
          {[1, 2, 3, 4].map((j) => (
            <td key={j} className="px-6 py-4">
              <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: j === 1 ? '60%' : '80%' }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.clients.list({ type: typeFilter as any || undefined, search: search || undefined, page, limit: 20 });
      setClients(response.data);
      if (response.meta) setMeta(response.meta);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Failed to load clients.');
    } finally { setLoading(false); }
  }, [typeFilter, search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // After creating a client from the drawer, refresh the list so the new
  // row (and updated total count) show up immediately.
  const handleClientCreated = (_client: Client) => {
    setPage(1);
    fetchData();
  };

  return (
    <div className="px-8 py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
          {meta && <p className="text-sm text-gray-400 mt-1">{meta.total} total</p>}
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New client
        </button>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={fetchData} className="text-sm font-medium text-red-600 hover:text-red-800">Retry</button>
          </div>
        </div>
      )}

      <div className="mb-6 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or email..."
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
          </div>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent">
            <option value="">All types</option>
            <option value="COMPANY">Companies</option>
            <option value="INDIVIDUAL">Individuals</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-100">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-100">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-100">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-100">Location</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <SkeletonRows /> : clients.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400">No clients found.</td></tr>
            ) : clients.map((client) => (
              <tr key={client.id} onClick={() => router.push(`/clients/${client.id}`)}
                className="cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {client.type === 'COMPANY' ? client.companyName : `${client.firstName} ${client.lastName}`}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${client.type === 'COMPANY' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                    {client.type === 'COMPANY' ? 'Company' : 'Individual'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{client.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{client.city ? `${client.city}${client.country ? `, ${client.country}` : ''}` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-400">Page {meta.page} of {meta.totalPages}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Previous</button>
            <button onClick={() => setPage((p) => p + 1)} disabled={page >= (meta?.totalPages || 1)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
          </div>
        </div>
      )}

      <NewClientDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={handleClientCreated}
      />
    </div>
  );
}