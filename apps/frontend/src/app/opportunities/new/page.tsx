'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, ApiError } from '@/lib/api';
import type { Client } from '@/lib/types';

const opportunitySchema = z.object({
  title: z.string().min(1, 'Title is required').max(120, 'Title must be at most 120 characters'),
  clientId: z.string().min(1, 'Client is required'),
  amount: z.number({ invalid_type_error: 'Amount must be a number' }).positive('Amount must be positive')
    .or(z.string().transform((val) => parseFloat(val))).refine((val) => val > 0, 'Amount must be positive'),
  expectedCloseDate: z.string().min(1, 'Expected close date is required'),
  stage: z.enum(['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'], { required_error: 'Stage is required' }),
  notes: z.string().optional(),
});

type OpportunityFormData = z.infer<typeof opportunitySchema>;

export default function NewOpportunityPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: { stage: 'LEAD' },
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.clients.list({ limit: 100 });
        setClients(response.data);
      } catch { setSubmitError('Failed to load clients'); }
      finally { setClientsLoading(false); }
    };
    fetchClients();
  }, []);

  const onSubmit = async (data: OpportunityFormData) => {
    setSubmitError(null);
    try {
      const response = await api.opportunities.create({ ...data, amount: typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount });
      router.push(`/opportunities/${response.data.id}`);
    } catch (err) {
      if (err instanceof ApiError) setSubmitError(err.message);
      else setSubmitError('Failed to create opportunity.');
    }
  };

  return (
    <div className="px-8 py-8 max-w-2xl mx-auto">
      <Link href="/opportunities" className="inline-flex items-center text-sm text-gray-400 hover:text-gray-600 mb-6">
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back
      </Link>

      <h1 className="text-xl font-semibold text-gray-900 mb-8">New opportunity</h1>

      {submitError && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" {...register('title')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="e.g. Enterprise Software Deal" />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <select {...register('clientId')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent">
              <option value="">Select a client</option>
              {clientsLoading ? <option disabled>Loading...</option> : clients.map((c) => (
                <option key={c.id} value={c.id}>{c.type === 'COMPANY' ? c.companyName : `${c.firstName} ${c.lastName}`} — {c.email}</option>
              ))}
            </select>
            {errors.clientId && <p className="text-xs text-red-500 mt-1">{errors.clientId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
              <input type="number" step="0.01" {...register('amount', { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="0.00" />
            </div>
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected close date</label>
            <input type="date" {...register('expectedCloseDate')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
            {errors.expectedCloseDate && <p className="text-xs text-red-500 mt-1">{errors.expectedCloseDate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
            <select {...register('stage')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent">
              <option value="LEAD">Lead</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="PROPOSAL">Proposal</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="WON">Won</option>
              <option value="LOST">Lost</option>
            </select>
            {errors.stage && <p className="text-xs text-red-500 mt-1">{errors.stage.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea {...register('notes')} rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Any additional notes..." />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <Link href="/opportunities" className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</Link>
          <button type="submit" disabled={isSubmitting}
            className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50">
            {isSubmitting ? 'Creating...' : 'Create opportunity'}
          </button>
        </div>
      </form>
    </div>
  );
}