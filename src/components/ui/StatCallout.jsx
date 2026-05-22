import { cn } from '../../lib/utils';
import { SkeletonLoader } from './SkeletonLoader';

export function StatCallout({ label, value, sub, icon: Icon, accent = false, loading = false, className }) {
  if (loading) {
    return (
      <div className={cn('bg-surface/80 rounded-xl border border-border/60 p-4 flex flex-col gap-2', className)}>
        <SkeletonLoader className="h-3 w-20" />
        <SkeletonLoader className="h-6 w-28" />
        <SkeletonLoader className="h-3 w-16" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-surface/80 rounded-xl border p-4 flex flex-col gap-1 min-w-0',
        accent ? 'border-accent/40 bg-accent/5' : 'border-border/60',
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        {Icon && <Icon size={12} className="text-text-secondary shrink-0" />}
        <span className="text-xs text-text-secondary font-medium uppercase tracking-wider truncate">{label}</span>
      </div>
      <p className={cn('font-mono font-semibold text-xl leading-tight truncate', accent ? 'text-accent' : 'text-text-primary')}>
        {value ?? '—'}
      </p>
      {sub && <p className="text-xs text-text-secondary truncate">{sub}</p>}
    </div>
  );
}
