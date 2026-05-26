export default function HeroSearchWidgetSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden text-left max-w-4xl mx-auto border border-gray-100">
      <div className="grid grid-cols-3 bg-gray-50/50 border-b border-gray-100">
        <div className="h-[52px] border-r border-gray-100 relative overflow-hidden">
          <div className="shimmer absolute inset-0" />
        </div>
        <div className="h-[52px] border-r border-gray-100 relative overflow-hidden">
          <div className="shimmer absolute inset-0" />
        </div>
        <div className="h-[52px] relative overflow-hidden">
          <div className="shimmer absolute inset-0" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 bg-white p-4 md:p-8 lg:grid-cols-[1fr_auto] lg:gap-6 lg:p-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="min-h-[60px] relative overflow-hidden bg-gray-50 rounded-xl">
              <div className="shimmer absolute inset-0" />
            </div>
          ))}
        </div>
        <div className="w-full h-12 md:h-[64px] bg-gray-100 rounded-xl relative overflow-hidden">
          <div className="shimmer absolute inset-0" />
        </div>
      </div>
    </div>
  );
}
