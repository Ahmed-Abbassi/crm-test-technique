'use client';

import { useState } from 'react';
import { api, ApiError } from '@/lib/api';
import Drawer from '../clients/Drawer';

interface ConvertLeadDrawerProps {
  leadId: string;
  open: boolean;
  onClose: () => void;
  onConverted: () => void;
}

export default function ConvertLeadDrawer({ leadId, open, onClose, onConverted }: ConvertLeadDrawerProps) {
  const [createOpportunity, setCreateOpportunity] = useState(true);
  const [opportunityTitle, setOpportunityTitle] = useState('');
  const [opportunityAmount, setOpportunityAmount] = useState('');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetAndClose = () => {
    setCreateOpportunity(true);
    setOpportunityTitle('');
    setOpportunityAmount('');
    setExpectedCloseDate('');
    setSubmitError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      await api.leads.convert(leadId, {
        createOpportunity,
        opportunityTitle: createOpportunity ? opportunityTitle || undefined : undefined,
        opportunityAmount: createOpportunity && opportunityAmount ? parseFloat(opportunityAmount) : undefined,
        expectedCloseDate: createOpportunity ? expectedCloseDate || undefined : undefined,
      });
      onConverted();
      resetAndClose();
    } catch (err) {
      if (err instanceof ApiError) setSubmitError(err.message);
      else setSubmitError('Failed to convert lead.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={resetAndClose}
      title="Convert lead"
      description="Convert this qualified lead into a client."
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1 px-6 py-6 space-y-5 overflow-y-auto">
          {submitError && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-700">
              This will create a new client from this lead. Optionally create an opportunity too.
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={createOpportunity}
              onChange={(e) => setCreateOpportunity(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm font-medium text-gray-700">Create opportunity</span>
          </label>

          {createOpportunity && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opportunity title</label>
                <input type="text" value={opportunityTitle}
                  onChange={(e) => setOpportunityTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="e.g. Software Deal" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400 text-sm">$</span>
                  <input type="number" step="0.01" value={opportunityAmount}
                    onChange={(e) => setOpportunityAmount(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="0.00" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected close date</label>
                <input type="date" value={expectedCloseDate}
                  onChange={(e) => setExpectedCloseDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </div>
            </>
          )}
        </div>

        <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3">
          <button type="button" onClick={resetAndClose}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={submitting}
            className="px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
            {submitting ? 'Converting...' : 'Convert lead'}
          </button>
        </div>
      </form>
    </Drawer>
  );
}