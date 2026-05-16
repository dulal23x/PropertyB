"use client";

import { useState } from 'react';
import { apiFetch } from '@/lib/api';

type PropertyInquiryFormProps = {
  listingId: number;
};

export default function PropertyInquiryForm({ listingId }: PropertyInquiryFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('I am interested in this property.');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await apiFetch(`/properties/${listingId}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email: email || null,
          message: message || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || 'Failed to send inquiry');
      }

      setSuccess('Your inquiry has been sent. The team will contact you soon.');
      setName('');
      setPhone('');
      setEmail('');
      setMessage('I am interested in this property.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send inquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <h3 className="font-bold text-gray-800 border-t pt-4">Send Inquiry</h3>
      {success && <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-md p-3">{success}</div>}
      {error && <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-md p-3">{error}</div>}
      <div>
        <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Your Name" required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-green" />
      </div>
      <div>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="Phone Number" required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-green" />
      </div>
      <div>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email Address" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-green" />
      </div>
      <div>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-green" />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-brand-dark text-white font-bold py-3 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-60">
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
