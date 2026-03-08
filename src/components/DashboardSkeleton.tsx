import { Skeleton } from '@/components/ui/skeleton';

const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Stats Row Skeleton */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card-sm flex flex-col items-center py-3 gap-1.5">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-10 h-5 rounded" />
            <Skeleton className="w-12 h-2.5 rounded" />
          </div>
        ))}
      </div>

      {/* Today's Progress Skeleton */}
      <div className="glass-card">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="w-28 h-4 rounded" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center space-y-1.5">
              <Skeleton className="w-12 h-6 mx-auto rounded" />
              <Skeleton className="w-16 h-2.5 mx-auto rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Daily Challenge Skeleton */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="w-32 h-4 rounded" />
          </div>
          <Skeleton className="w-16 h-6 rounded-full" />
        </div>
        <Skeleton className="w-full h-20 rounded-xl" />
      </div>

      {/* Quick Actions Skeleton */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="w-24 h-4 rounded" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div key={i} className="glass-card-sm flex flex-col items-center justify-center py-4 gap-2">
              <Skeleton className="w-9 h-9 rounded-full" />
              <Skeleton className="w-12 h-3 rounded" />
              <Skeleton className="w-8 h-2 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Today's Quest Skeleton */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="w-28 h-4 rounded" />
          </div>
          <Skeleton className="w-16 h-6 rounded-full" />
        </div>
        <Skeleton className="w-full h-3 rounded-full mb-3" />
        <div className="flex justify-between">
          <Skeleton className="w-32 h-3 rounded" />
          <Skeleton className="w-10 h-3 rounded" />
        </div>
        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 text-center space-y-1.5">
              <Skeleton className="w-10 h-5 mx-auto rounded" />
              <Skeleton className="w-16 h-2.5 mx-auto rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Study Resources Skeleton */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="w-28 h-4 rounded" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-3">
              <Skeleton className="w-11 h-11 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="w-24 h-3.5 rounded" />
                <Skeleton className="w-36 h-2.5 rounded" />
              </div>
              <Skeleton className="w-5 h-5 rounded flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
