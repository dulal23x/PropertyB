"use client";

import { useState } from "react";
import { fetchGlobalContactNumber } from "@/lib/property-api";
import { PhoneCall } from "lucide-react";

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
        <PhoneCall className="h-5 w-5" />
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
            <PhoneCall className="h-5 w-5" />
            Get a Callback / Reveal Number
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-600 text-center font-medium">Unable to load number. Please use the form.</p>}
    </div>
  );
}
