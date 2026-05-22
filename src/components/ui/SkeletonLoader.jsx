import { cn } from '../../lib/utils';

export function SkeletonLoader({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200/80', className)}
      {...props}
    />
  );
}

export function SkeletonCard({ rows = 3 }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonLoader className="h-4 w-32" />
        <SkeletonLoader className="h-6 w-16 rounded-full" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonLoader key={i} className={`h-3 ${i === rows - 1 ? 'w-3/4' : 'w-full'}`} />
      ))}
    </div>
  );
}

export function SkeletonChart({ height = 320 }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <SkeletonLoader className="h-5 w-48" />
        <div className="flex gap-2">
          <SkeletonLoader className="h-8 w-8 rounded-lg" />
          <SkeletonLoader className="h-8 w-8 rounded-lg" />
          <SkeletonLoader className="h-8 w-8 rounded-lg" />
        </div>
      </div>
      <SkeletonLoader style={{ height }} className="w-full rounded-lg" />
    </div>
  );
}
