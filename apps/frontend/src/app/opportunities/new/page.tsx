'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, ApiError } from '@/lib/api';
import type { Client, OpportunityStage } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';

const opportunitySchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(120, 'Title must be at most 120 characters'),
  clientId: z.string().min(1, 'Client is required'),
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

export default function NewOpportunityPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      stage: 'LEAD',
    },
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.clients.list({ limit: 100 });
        setClients(response.data);
      } catch {
        setSubmitError('Failed to load clients');
      } finally {
        setClientsLoading(false);
      }
    };
    fetchClients();
  }, []);

  const onSubmit = async (data: OpportunityFormData) => {
    setSubmitError(null);
    try {
      const response = await api.opportunities.create({
        ...data,
        amount: typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount,
      });
      router.push(`/opportunities/${response.data.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message);
      } else {
        setSubmitError('Failed to create opportunity. Please try again.');
      }
    }
  };

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
        New Opportunity
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
              placeholder="e.g. Enterprise Software Deal"
            />
            {errors.title && (
              <p className="text-red-600 text-xs mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Client */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client
            </label>
            <select
              {...register('clientId')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a client</option>
              {clientsLoading ? (
                <option disabled>Loading clients...</option>
              ) : (
                clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.type === 'COMPANY'
                      ? client.companyName
                      : `${client.firstName} ${client.lastName}`}
                    {' — '}
                    {client.email}
                  </option>
                ))
              )}
            </select>
            {errors.clientId && (
              <p className="text-red-600 text-xs mt-1">
                {errors.clientId.message}
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
                placeholder="0.00"
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
              placeholder="Any additional notes..."
            />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <Link
            href="/opportunities"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Opportunity'}
          </button>
        </div>
      </form>
    </div>
  );
}