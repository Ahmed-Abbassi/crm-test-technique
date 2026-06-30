'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, ApiError } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';

const opportunitySchema = z.object({
  title: z.string().min(1, 'Title is required').max(120, 'Title must be at most 120 characters'),
  amount: z.number({ invalid_type_error: 'Amount must be a number' }).positive('Amount must be positive')
    .or(z.string().transform((val) => parseFloat(val))).refine((val) => val > 0, 'Amount must be positive'),
  expectedCloseDate: z.string().min(1, 'Expected close date is required'),
  stage: z.enum(['PROSPECTING', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'], { required_error: 'Stage is required' }),
  notes: z.string().optional(),
});

type OpportunityFormData = z.infer<typeof opportunitySchema>;

export default function EditOpportunityPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.opportunities.get(params.id as string);
        const opp = response.data;
        reset({ title: opp.title, amount: opp.amount, expectedCloseDate: opp.expectedCloseDate?.split('T')[0] ?? '', stage: opp.stage, notes: opp.notes || '' });
      } catch (err) {
        if (err instanceof ApiError) setFetchError(err.message);
        else setFetchError('Failed to load opportunity');
      } finally { setLoading(false); }
    };
    fetchData();
  }, [params.id, reset]);

  const onSubmit = async (data: OpportunityFormData) => {
    setSubmitError(null);
    try {
      const response = await api.opportunities.update(params.id as string, { ...data, amount: typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount });
      toast.success('Opportunity updated successfully');
      router.push(`/opportunities/${response.data.id}`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to update opportunity.';
      setSubmitError(msg);
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="px-8 py-8 max-w-2xl mx-auto">
        <div className="mb-6"><div className="h-4 bg-gray-100 rounded w-24 animate-pulse" /></div>
        <div className="bg-white border border-gray-200 rounded-xl p-8 animate-pulse space-y-6">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-10 bg-gray-100 rounded" />)}
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="px-8 py-8 max-w-2xl mx-auto">
        <Link href="/opportunities" className="inline-flex items-center text-sm text-gray-400 hover:text-gray-600 mb-6">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          Back
        </Link>
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl"><p className="text-sm text-red-700">{fetchError}</p></div>
      </div>
    );
  }

  return (
    <div className="px-8 py-8 max-w-2xl mx-auto">
      <Link href={`/opportunities/${params.id}`} className="inline-flex items-center text-sm text-gray-400 hover:text-gray-600 mb-6">
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back
      </Link>

      <h1 className="text-xl font-semibold text-gray-900 mb-8">Edit opportunity</h1>

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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
              <input type="number" step="0.01" {...register('amount', { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
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
              <option value="PROSPECTING">Prospecting</option>
              <option value="PROPOSAL">Proposal</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="CLOSED_WON">Closed Won</option>
              <option value="CLOSED_LOST">Closed Lost</option>
            </select>
            {errors.stage && <p className="text-xs text-red-500 mt-1">{errors.stage.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea {...register('notes')} rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <Link href={`/opportunities/${params.id}`} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</Link>
          <button type="submit" disabled={isSubmitting}
            className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50">
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}