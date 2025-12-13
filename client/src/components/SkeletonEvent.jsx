const SkeletonEvent = () => {
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700 rounded-3xl shadow-xl p-4 md:p-6 mb-6 relative overflow-hidden">
      
      {/* Image Skeleton */}
      <div className="w-full h-56 md:h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl mb-5 animate-pulse"></div>

      {/* Title & Date Skeleton */}
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-3 w-3/4">
          <div className="h-6 md:h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4 animate-pulse"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 animate-pulse"></div>
        </div>
        <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
      </div>

      {/* Description Skeleton */}
      <div className="space-y-3 mt-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-full animate-pulse"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-5/6 animate-pulse"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-4/6 animate-pulse"></div>
      </div>
      
      {/* Footer / Buttons Skeleton */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
         <div className="flex gap-2">
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
         </div>
         <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>
      </div>
    </div>
  );
};

export default SkeletonEvent;