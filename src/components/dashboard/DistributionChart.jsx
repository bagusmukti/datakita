import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Info } from 'lucide-react';
import { useDataset } from '../../hooks/useDataset';
import { Tooltip as UITooltip } from '../ui/Tooltip';
import { SkeletonCard } from '../ui/SkeletonLoader';
import { ErrorState } from './ErrorState';
import { formatCompact } from '../../lib/utils';

const CHART_COLORS = ['#1E2761', '#F5A623', '#A8C5E0', '#16A34A', '#DC2626'];

const TITLES = {
  bmkg: { title: 'Distribusi Kedalaman Gempa', tooltip: 'Dangkal <60km, Menengah 60–300km, Dalam >300km' },
  worldbank: { title: 'Kontribusi GDP per Dekade', tooltip: 'Persentase kontribusi GDP tiap dekade terhadap total historis' },
  disease: { title: 'Proporsi Status Kasus COVID-19', tooltip: 'Aktif, sembuh, dan meninggal dari total akumulasi kasus Indonesia' },
};

export function DistributionChart({ data, isLoading, isError, onRetry }) {
  const { activeDataset } = useDataset();
  const config = TITLES[activeDataset] || {};

  if (isLoading) return <SkeletonCard rows={4} />;
  if (isError) return <ErrorState onRetry={onRetry} compact />;
  if (!data?.length) return null;

  const total = data.reduce((sum, d) => sum + d.value, 0);

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.06) return null;
    const RADIAN = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontFamily="JetBrains Mono" fontWeight={600}>
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold text-text-primary text-sm flex-1">{config.title}</h3>
        <UITooltip content={config.tooltip} side="left">
          <Info size={13} className="text-text-secondary cursor-help shrink-0" />
        </UITooltip>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={renderLabel}
          >
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #E8E8E3', fontSize: '12px', fontFamily: 'JetBrains Mono' }}
            formatter={(value, name) => [formatCompact(value), name]}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-3 space-y-2">
        {data.map((entry, i) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
            <span className="text-text-secondary flex-1 truncate">{entry.name}</span>
            <span className="font-mono font-medium text-text-primary">{formatCompact(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
