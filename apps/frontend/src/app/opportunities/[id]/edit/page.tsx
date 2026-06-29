'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, ApiError } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';

const opportunitySchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(120, 'Title must be at most 120 characters'),
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be positive')
    .or(z.string().transform((val) => parseFloat(val)))
    .refine((val) => val > 0, 'Amount must be positive'),
  expectedCloseDate: z.string().min(1, 'Expected close date is required'),
  stage: z.enum(
    ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'],
    { required_error: 'Stage is required' },
  ),
  notes: z.string().optional(),
});

type OpportunityFormData = z.infer<typeof opportunitySchema>;

export default function EditOpportunityPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.opportunities.get(params.id as string);
        const opp = response.data;
        reset({
          title: opp.title,
          amount: opp.amount,
          expectedCloseDate: opp.expectedCloseDate.split('T')[0],
          stage: opp.stage,
          notes: opp.notes || '',
        });
      } catch (err) {
        if (err instanceof ApiError) {
          setFetchError(err.message);
        } else {
          setFetchError('Failed to load opportunity');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id, reset]);

  const onSubmit = async (data: OpportunityFormData) => {
    setSubmitError(null);
    try {
      const response = await api.opportunities.update(params.id as string, {
        ...data,
        amount:
          typeof data.amount === 'string'
            ? parseFloat(data.amount)
            : data.amount,
      });
      router.push(`/opportunities/${response.data.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message);
      } else {
        setSubmitError('Failed to update opportunity. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
          <div className="space-y-6 animate-pulse">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
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
          <p className="text-red-800 text-sm">{fetchError}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/opportunities"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to opportunities
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Edit Opportunity
      </h1>

      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{submitError}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl"
      >
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              {...register('title')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && (
              <p className="text-red-600 text-xs mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 text-sm">
                $
              </span>
              <input
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {errors.amount && (
              <p className="text-red-600 text-xs mt-1">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Expected Close Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Close Date
            </label>
            <input
              type="date"
              {...register('expectedCloseDate')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.expectedCloseDate && (
              <p className="text-red-600 text-xs mt-1">
                {errors.expectedCloseDate.message}
              </p>
            )}
          </div>

          {/* Stage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stage
            </label>
            <select
              {...register('stage')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="LEAD">Lead</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="PROPOSAL">Proposal</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="WON">Won</option>
              <option value="LOST">Lost</option>
            </select>
            {errors.stage && (
              <p className="text-red-600 text-xs mt-1">
                {errors.stage.message}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              {...register('notes')}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <Link
            href={`/opportunities/${params.id}`}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}