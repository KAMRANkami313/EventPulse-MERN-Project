const SkeletonEvent = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 mb-8">
      {/* Image Skeleton */}
      <div className="w-full h-56 bg-gray-200 dark:bg-gray-700 rounded-xl mb-5 animate-pulse-fast"></div>

      {/* Title & Date Skeleton */}
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-2 w-3/4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse-fast"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse-fast"></div>
        </div>
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse-fast"></div>
      </div>

      {/* Description Skeleton */}
      <div className="space-y-2 mt-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse-fast"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse-fast"></div>
      </div>
    </div>
  );
};

export default SkeletonEvent;