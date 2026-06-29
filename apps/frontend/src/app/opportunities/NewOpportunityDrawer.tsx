'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, ApiError } from '@/lib/api';
import type { Client } from '@/lib/types';
import Drawer from '../clients/Drawer';

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

interface NewOpportunityDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function NewOpportunityDrawer({ open, onClose, onCreated }: NewOpportunityDrawerProps) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: { stage: 'LEAD' },
  });

  useEffect(() => {
    if (open) {
      setClientsLoading(true);
      api.clients.list({ limit: 100 })
        .then((response) => setClients(response.data))
        .catch(() => setSubmitError('Failed to load clients'))
        .finally(() => setClientsLoading(false));
    }
  }, [open]);

  const resetAndClose = () => {
    reset({ title: '', clientId: '', amount: undefined, expectedCloseDate: '', stage: 'LEAD', notes: '' });
    setSubmitError(null);
    onClose();
  };

  const onSubmit = async (data: OpportunityFormData) => {
    setSubmitError(null);
    try {
      const response = await api.opportunities.create({
        ...data,
        amount: typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount,
      });
      onCreated?.();
      resetAndClose();
    } catch (err) {
      if (err instanceof ApiError) setSubmitError(err.message);
      else setSubmitError('Failed to create opportunity.');
    }
  };

  return (
    <Drawer
      open={open}
      onClose={resetAndClose}
      title="New opportunity"
      description="Add a new deal to your pipeline."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
        <div className="flex-1 px-6 py-6 space-y-5 overflow-y-auto">
          {submitError && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" {...register('title')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="e.g. Enterprise Software Deal" />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
              <input type="number" step="0.01" {...register('amount', { valueAsNumber: true })}
                className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="0.00" />
            </div>
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected close date *</label>
            <input type="date" {...register('expectedCloseDate')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
            {errors.expectedCloseDate && <p className="text-xs text-red-500 mt-1">{errors.expectedCloseDate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stage *</label>
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
            <textarea {...register('notes')} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Any additional notes..." />
          </div>
        </div>

        <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3">
          <button type="button" onClick={resetAndClose}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={isSubmitting}
            className="px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
            {isSubmitting ? 'Creating...' : 'Create opportunity'}
          </button>
        </div>
      </form>
    </Drawer>
  );
}