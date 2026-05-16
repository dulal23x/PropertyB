"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { setAuthSession } from '@/lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
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
        
        // Role-aware redirect
        if (user?.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard/listings';
        }
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.detail || 'Invalid credentials');
      }
    } catch {
      setError('Connection error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Image src="/assets/bproperty-logo.svg" alt="Bproperty Logo" width={200} height={50} />
        </div>
        <h2 className="text-center text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
        <p className="text-center text-sm text-gray-600">
          New here? <Link href="/auth/register" className="font-medium text-brand-green hover:underline">Create an account</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">{error}</div>}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email or Phone Number</label>
              <input 
                type="text" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-brand-green focus:ring-brand-green border-gray-300 rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-brand-green hover:underline">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-brand-green hover:bg-brand-greenHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green">
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
