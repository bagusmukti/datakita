import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Info } from 'lucide-react';
import { useDataset } from '../../hooks/useDataset';
import { Tooltip as UITooltip } from '../ui/Tooltip';
import { SkeletonCard } from '../ui/SkeletonLoader';
import { ErrorState } from './ErrorState';
import { formatCompact } from '../../lib/utils';

const TITLES = {
  bmkg: { title: 'Top 5 Wilayah — Frekuensi Gempa', tooltip: 'Wilayah dengan jumlah kejadian gempa terbanyak dari data terakhir', unit: 'kejadian' },
  worldbank: { title: 'Top 5 Tahun Pertumbuhan GDP', tooltip: 'Tahun dengan pertumbuhan GDP tertinggi secara tahunan', unit: '%' },
  disease: { title: 'Perbandingan ASEAN — Kasus per Juta', tooltip: 'Kasus COVID-19 per satu juta penduduk di negara-negara ASEAN', unit: '' },
};

export function RankingChart({ data, isLoading, isError, onRetry }) {
  const { activeDataset } = useDataset();
  const config = TITLES[activeDataset] || {};

  if (isLoading) return <SkeletonCard rows={5} />;
  if (isError) return <ErrorState onRetry={onRetry} compact />;
  if (!data?.length) return null;

  const maxVal = Math.max(...data.map((d) => d.value));

  return (
    <div className="bg-surface rounded-xl border border-border p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold text-text-primary text-sm flex-1">{config.title}</h3>
        <UITooltip content={config.tooltip} side="left">
          <Info size={13} className="text-text-secondary cursor-help shrink-0" />
        </UITooltip>
      </div>

      <div className="space-y-2.5 flex-1">
        {data.map((item, i) => (
          <div key={item.name} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-text-secondary truncate flex-1 pr-2" title={item.name}>{item.name}</span>
              <span className="font-mono text-xs font-semibold text-text-primary shrink-0">
                {activeDataset === 'worldbank'
                  ? `${item.value >= 0 ? '+' : ''}${item.value.toFixed(1)}%`
                  : formatCompact(item.value)}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(item.value / maxVal) * 100}%`,
                  backgroundColor: i === 0 ? '#F5A623' : '#1E2761',
                  opacity: 1 - i * 0.15,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
