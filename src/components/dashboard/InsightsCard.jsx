import { Lightbulb, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useDataset } from '../../hooks/useDataset';
import { SkeletonCard } from '../ui/SkeletonLoader';

export function InsightsCard({ insights, isLoading }) {
  const { currentDataset } = useDataset();

  if (isLoading) return <SkeletonCard rows={4} />;

  return (
    <div className="bg-surface rounded-xl border border-border p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={14} className="text-accent shrink-0" />
        <h3 className="font-semibold text-text-primary text-sm">Ringkasan & Insight</h3>
      </div>

      <div className="space-y-3 flex-1">
        {(insights || []).map((insight, i) => (
          <div key={i} className="flex flex-col gap-0.5 p-3 rounded-lg bg-bg border border-border/60">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
              {insight.label}
            </span>
            <p className="text-sm font-medium text-text-primary leading-snug">{insight.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-[11px] text-text-secondary">
          Sumber data:{' '}
          <a href={currentDataset.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            {currentDataset.source}
          </a>
        </p>
      </div>
    </div>
  );
}
