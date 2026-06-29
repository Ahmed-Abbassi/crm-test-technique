'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import type { Opportunity, OpportunityStage } from '@/lib/types';
import { ArrowLeft, Edit, Trash2, AlertTriangle } from 'lucide-react';

const stageColors: Record<OpportunityStage, string> = {
  LEAD: 'bg-gray-100 text-gray-800',
  QUALIFIED: 'bg-blue-100 text-blue-800',
  PROPOSAL: 'bg-amber-100 text-amber-800',
  NEGOTIATION: 'bg-purple-100 text-purple-800',
  WON: 'bg-green-100 text-green-800',
  LOST: 'bg-red-100 text-red-800',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function SkeletonCard() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-1/4" />
    </div>
  );
}

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.opportunities.get(params.id as string);
      setOpportunity(response.data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load opportunity.');
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
      await api.opportunities.delete(params.id as string);
      router.push('/opportunities');
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
        <div className="mb-6">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Link
          href="/opportunities"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to opportunities
        </Link>
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

  if (!opportunity) return null;

  const client = opportunity.client;
  const clientName = client
    ? client.type === 'COMPANY'
      ? client.companyName
      : `${client.firstName} ${client.lastName}`
    : 'Unknown';

  const daysOverdue = opportunity.isLate
    ? Math.floor(
        (new Date().getTime() - new Date(opportunity.expectedCloseDate).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;

  const daysStagnant = opportunity.isStagnant
    ? Math.floor(
        (new Date().getTime() - new Date(opportunity.lastStageChange).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;

  return (
    <div>
      {/* Back link */}
      <Link
        href="/opportunities"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to opportunities
      </Link>

      {/* Problematic warning banner */}
      {(opportunity.isLate || opportunity.isStagnant) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">
              This opportunity needs attention
            </p>
            <ul className="text-sm text-red-700 mt-1 list-disc list-inside">
              {opportunity.isLate && (
                <li>
                  Expected close date was {formatDate(opportunity.expectedCloseDate)} —{' '}
                  {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue
                </li>
              )}
              {opportunity.isStagnant && (
                <li>
                  No stage change in {daysStagnant} days (last change:{' '}
                  {formatDate(opportunity.lastStageChange)})
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {opportunity.title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Created {formatDate(opportunity.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/opportunities/${opportunity.id}/edit`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center px-3 py-2 border border-red-300 text-red-700 rounded-lg text-sm hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Opportunity details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
              Amount
            </label>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(opportunity.amount)}
            </p>
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
              Stage
            </label>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                stageColors[opportunity.stage]
              }`}
            >
              {opportunity.stage}
            </span>
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
              Expected Close Date
            </label>
            <p className="text-sm text-gray-900">
              {formatDate(opportunity.expectedCloseDate)}
            </p>
          </div>
          <div>
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
              Last Stage Change
            </label>
            <p className="text-sm text-gray-900">
              {formatDate(opportunity.lastStageChange)}
            </p>
          </div>
          {opportunity.notes && (
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                Notes
              </label>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {opportunity.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Client card */}
      {client && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Client
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                Name
              </label>
              <p className="text-sm text-gray-900">{clientName}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                Type
              </label>
              <p className="text-sm text-gray-900">
                {client.type === 'COMPANY' ? 'Company' : 'Individual'}
              </p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                Email
              </label>
              <p className="text-sm text-gray-900">{client.email}</p>
            </div>
            {client.phone && (
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Phone
                </label>
                <p className="text-sm text-gray-900">{client.phone}</p>
              </div>
            )}
            {client.type === 'COMPANY' && client.industry && (
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Industry
                </label>
                <p className="text-sm text-gray-900">{client.industry}</p>
              </div>
            )}
            {client.city && client.country && (
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Location
                </label>
                <p className="text-sm text-gray-900">
                  {client.city}, {client.country}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete opportunity
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete "{opportunity.title}"? This
              action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}