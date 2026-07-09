import Image from 'next/image';

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center px-6 text-center">
        <div className="relative w-[240px] max-w-[80vw]">
          <Image
            src="/assets/propertybikri-logo.png"
            alt="PropertyBikri logo"
            width={1437}
            height={355}
            className="h-auto w-full object-contain"
            priority
          />
        </div>
        <div className="relative mt-6 h-12 w-12">
          <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-brand-green rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
          </div>
        </div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-brand-dark opacity-40 animate-pulse">
          Loading PropertyBikri
        </p>
      </div>
    </div>
  );
}
