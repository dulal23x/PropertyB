"use client";

import { useState } from "react";
import { fetchGlobalContactNumber } from "@/lib/property-api";

export default function RevealContactButton() {
  const [number, setNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleReveal = async () => {
    setLoading(true);
    setError(false);
    try {
      const fetchedNumber = await fetchGlobalContactNumber();
      setNumber(fetchedNumber);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (number) {
    return (
      <a 
        href={`tel:${number}`} 
        className="w-full bg-emerald-600 text-white font-bold py-3 rounded-md hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
        {number}
      </a>
    );
  }

  return (
    <div className="space-y-2">
      <button 
        onClick={handleReveal} 
        disabled={loading}
        className="w-full bg-brand-green text-white font-bold py-3 rounded-md hover:bg-brand-greenHover transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-70"
      >
        {loading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            Get a Callback / Reveal Number
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-600 text-center font-medium">Unable to load number. Please use the form.</p>}
    </div>
  );
}
