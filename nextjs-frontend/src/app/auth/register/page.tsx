"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { setAuthSession } from '@/lib/auth';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: password,
          full_name: email.split('@')[0] || 'Property Owner',
        }),
      });
      if (res.ok) {
        const tokenData = await res.json();
        const meRes = await apiFetch('/auth/me', {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        });
        const user = meRes.ok ? await meRes.json() : null;
        setAuthSession({ ...tokenData, user });
        setSuccess('Account created successfully! Redirecting to dashboard...');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        const data = await res.json().catch(() => null);
        setError(data.detail || 'Registration failed');
      }
    } catch {
      setError('Connection error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Image
            src="/assets/propertybikri-logo.png"
            alt="PropertyBikri logo"
            width={1437}
            height={355}
            className="h-auto w-[220px] max-w-[85vw] object-contain"
            priority
          />
        </div>
        <h2 className="text-center text-3xl font-bold text-gray-900 mb-2">Create an account</h2>
        <p className="text-center text-sm text-gray-600">
          Already have an account? <Link href="/auth/login" className="font-medium text-brand-green hover:underline">Sign In</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleRegister}>
            {error && <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">{error}</div>}
            {success && <div className="text-green-600 text-sm text-center font-medium bg-green-50 p-2 rounded">{success}</div>}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green sm:text-sm" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (For Manual Test)</label>
              <input 
                type="tel" 
                required 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880"
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green sm:text-sm" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green sm:text-sm" 
              />
            </div>

            <div>
              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-brand-green hover:bg-brand-greenHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green">
                Register
              </button>
            </div>
            
            <div className="mt-6">
              <p className="text-xs text-center text-gray-500">
                By clicking Register, you agree to our <a href="#" className="underline hover:text-gray-700">Terms and Conditions</a> and <a href="#" className="underline hover:text-gray-700">Privacy Policy</a>.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
