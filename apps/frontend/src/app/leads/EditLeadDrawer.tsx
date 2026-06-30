'use client';

import { useState, useEffect } from 'react';
import { api, ApiError } from '@/lib/api';
import type { Lead } from '@/lib/types';
import Drawer from '../clients/Drawer';
import { useToast } from '@/components/ToastProvider';

interface EditLeadDrawerProps {
  lead: Lead;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditLeadDrawer({ lead, open, onClose, onSaved }: EditLeadDrawerProps) {
  const toast = useToast();
  const [email, setEmail] = useState(lead.email);
  const [phone, setPhone] = useState(lead.phone || '');
  const [firstName, setFirstName] = useState(lead.firstName || '');
  const [lastName, setLastName] = useState(lead.lastName || '');
  const [companyName, setCompanyName] = useState(lead.companyName || '');
  const [title, setTitle] = useState(lead.title || '');
  const [source, setSource] = useState(lead.source || '');
  const [notes, setNotes] = useState(lead.notes || '');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail(lead.email);
      setPhone(lead.phone || '');
      setFirstName(lead.firstName || '');
      setLastName(lead.lastName || '');
      setCompanyName(lead.companyName || '');
      setTitle(lead.title || '');
      setSource(lead.source || '');
      setNotes(lead.notes || '');
      setSubmitError(null);
    }
  }, [open, lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      await api.leads.update(lead.id, {
        email,
        phone: phone || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        companyName: companyName || undefined,
        title: title || undefined,
        source: source || undefined,
        notes: notes || undefined,
      });
      toast.success('Lead updated successfully');
      onSaved();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to update lead.';
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Edit lead"
      description="Update lead information."
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1 px-6 py-6 space-y-5 overflow-y-auto">
          {submitError && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
              <input type="text" value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
              <input type="text" value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input type="text" value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job title</label>
              <input type="text" value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <input type="text" value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea rows={3} value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none" />
          </div>
        </div>

        <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-end gap-3">
          <button type="button" onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={submitting}
            className="px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
            {submitting ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </Drawer>
  );
}