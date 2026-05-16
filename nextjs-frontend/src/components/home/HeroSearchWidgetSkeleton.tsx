export default function HeroSearchWidgetSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden text-left max-w-4xl mx-auto border border-gray-100">
      <div className="flex bg-gray-50/50 border-b border-gray-100 h-14">
        <div className="w-24 h-full border-r border-gray-100 relative overflow-hidden">
          <div className="shimmer absolute inset-0" />
        </div>
        <div className="w-24 h-full border-r border-gray-100" />
        <div className="w-24 h-full" />
      </div>

      <div className="p-5 md:p-8 bg-white grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
           {[1, 2, 3, 4].map(i => (
             <div key={i} className="h-16 relative overflow-hidden bg-gray-50 rounded-lg">
                <div className="shimmer absolute inset-0" />
             </div>
           ))}
        </div>
        <div className="w-full lg:w-32 h-[60px] bg-gray-100 rounded-lg relative overflow-hidden">
           <div className="shimmer absolute inset-0" />
        </div>
      </div>
    </div>
  );
}
