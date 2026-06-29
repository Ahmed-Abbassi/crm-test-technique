'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';

export default function NewClientPage() {
  const router = useRouter();
  const [type, setType] = useState<'COMPANY' | 'INDIVIDUAL'>('COMPANY');
  const [formData, setFormData] = useState({
    email: '', phone: '', address: '', city: '', country: '',
    companyName: '', industry: '', website: '', employeeCount: '',
    firstName: '', lastName: '',
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      const data: any = { type, email: formData.email, phone: formData.phone || undefined, address: formData.address || undefined, city: formData.city || undefined, country: formData.country || undefined };
      if (type === 'COMPANY') {
        data.companyName = formData.companyName;
        data.industry = formData.industry || undefined;
        data.website = formData.website || undefined;
        data.employeeCount = formData.employeeCount ? parseInt(formData.employeeCount) : undefined;
      } else {
        data.firstName = formData.firstName;
        data.lastName = formData.lastName;
      }
      const response = await api.clients.create(data);
      router.push(`/clients/${response.data.id}`);
    } catch (err) {
      if (err instanceof ApiError) setSubmitError(err.message);
      else setSubmitError('Failed to create client.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="px-8 py-8 max-w-2xl mx-auto">
      <Link href="/clients" className="inline-flex items-center text-sm text-gray-400 hover:text-gray-600 mb-6">
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back
      </Link>

      <h1 className="text-xl font-semibold text-gray-900 mb-8">New client</h1>

      {submitError && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Client type</label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setType('COMPANY')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'COMPANY' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Company</button>
            <button type="button" onClick={() => setType('INDIVIDUAL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'INDIVIDUAL' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Individual</button>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
          </div>

          {type === 'COMPANY' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company name *</label>
                <input type="text" required value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input type="text" value={formData.industry} onChange={(e) => setFormData({...formData, industry: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employees</label>
                  <input type="number" min="1" value={formData.employeeCount} onChange={(e) => setFormData({...formData, employeeCount: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input type="url" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First name *</label>
                <input type="text" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last name *</label>
                <input type="text" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input type="text" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <Link href="/clients" className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</Link>
          <button type="submit" disabled={submitting}
            className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create client'}
          </button>
        </div>
      </form>
    </div>
  );
}