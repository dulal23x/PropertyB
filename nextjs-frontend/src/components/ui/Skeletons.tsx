export function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-brand-border overflow-hidden flex flex-col h-full animate-pulse">
      <div className="aspect-[16/9] w-full bg-gray-200" />
      <div className="p-4 flex flex-col flex-grow">
        <div className="h-3 w-24 bg-gray-200 rounded mb-4" />
        <div className="h-6 w-48 bg-gray-200 rounded mb-3" />
        <div className="h-4 w-full bg-gray-100 rounded mb-6" />
        <div className="flex gap-4 mt-auto border-t border-gray-50 pt-4">
          <div className="h-4 w-12 bg-gray-100 rounded" />
          <div className="h-4 w-12 bg-gray-100 rounded" />
          <div className="h-4 w-12 bg-gray-100 rounded" />
        </div>
        <div className="flex gap-2 mt-6">
          <div className="h-10 flex-1 bg-gray-100 rounded" />
          <div className="h-10 flex-1 bg-gray-100 rounded" />
          <div className="h-10 w-12 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}

export function CityCardSkeleton() {
  return (
    <div className="h-64 rounded-xl bg-gray-200 animate-pulse relative overflow-hidden">
       <div className="absolute inset-0 bg-gradient-to-t from-gray-300 via-transparent to-transparent opacity-50" />
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-64 rounded-2xl bg-gray-200 mb-6" />
      <div className="h-2 w-20 bg-gray-100 rounded mb-3" />
      <div className="h-5 w-full bg-gray-200 rounded mb-2" />
      <div className="h-5 w-3/4 bg-gray-200 rounded mb-4" />
      <div className="h-3 w-full bg-gray-50 rounded" />
    </div>
  );
}
