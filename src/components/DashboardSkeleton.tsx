import { Skeleton } from '@/components/ui/skeleton';

const DashboardSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="glass-card-sm flex items-center justify-between py-2.5 px-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="w-8 h-4 rounded" />
              <Skeleton className="w-10 h-2 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Goal Card */}
      <div className="glass-card flex items-center gap-4">
        <Skeleton className="w-24 h-24 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-20 h-3 rounded" />
          <Skeleton className="w-36 h-4 rounded" />
          <Skeleton className="w-28 h-3 rounded" />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="glass-card-sm flex items-center justify-around py-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <div className="space-y-1">
              <Skeleton className="w-8 h-3.5 rounded" />
              <Skeleton className="w-12 h-2 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Subject Chips */}
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="flex-1 h-11 rounded-lg" />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <Skeleton className="w-24 h-3 rounded mb-2.5" />
        <div className="grid grid-cols-3 gap-2.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="glass-card-sm flex flex-col items-center py-3.5 gap-1.5">
              <Skeleton className="w-9 h-9 rounded-xl" />
              <Skeleton className="w-10 h-3 rounded" />
              <Skeleton className="w-7 h-2 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div>
        <Skeleton className="w-20 h-3 rounded mb-2.5" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3.5 rounded-xl bg-card border border-border flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="w-20 h-3 rounded" />
                <Skeleton className="w-28 h-2.5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
