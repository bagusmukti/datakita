import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ReferenceLine, ResponsiveContainer, Legend,
} from 'recharts';
import { BarChart2, TrendingUp, Activity, Info, Maximize2 } from 'lucide-react';
import { useDataset } from '../../hooks/useDataset';
import { useFilters } from '../../hooks/useFilters';
import { Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';
import { SkeletonChart } from '../ui/SkeletonLoader';
import { ErrorState } from './ErrorState';
import { cn, formatCompact, formatPercent } from '../../lib/utils';

const CHART_TYPES = [
  { id: 'line', icon: TrendingUp, label: 'Garis' },
  { id: 'bar', icon: BarChart2, label: 'Batang' },
  { id: 'area', icon: Activity, label: 'Area' },
];

const COLORS = {
  primary: '#1E2761',
  accent: '#F5A623',
  supporting: '#A8C5E0',
  danger: '#DC2626',
  success: '#16A34A',
};

const WB_INDICATORS = {
  gdp: { key: 'gdp', label: 'GDP (USD)', color: COLORS.primary, format: formatCompact },
  gdpPerCapita: { key: 'gdpPerCapita', label: 'GDP per Kapita (USD)', color: COLORS.accent, format: formatCompact },
  inflation: { key: 'inflation', label: 'Inflasi (%)', color: COLORS.danger, format: (v) => formatPercent(v, 1) },
  population: { key: 'population', label: 'Populasi', color: COLORS.supporting, format: formatCompact },
  unemployment: { key: 'unemployment', label: 'Pengangguran (%)', color: COLORS.success, format: (v) => formatPercent(v, 1) },
};

export function FeaturedChart({ bmkgData, worldBankData, diseaseData, isLoading, isError, onRetry }) {
  const { activeDataset } = useDataset();
  const { filters } = useFilters();
  const [chartType, setChartType] = useState('line');
  const [hiddenSeries, setHiddenSeries] = useState({});

  if (isLoading) return <SkeletonChart height={340} />;
  if (isError) return <ErrorState onRetry={onRetry} />;

  const config = getConfig(activeDataset, { bmkgData, worldBankData, diseaseData, filters, chartType });

  function toggleSeries(key) {
    setHiddenSeries((p) => ({ ...p, [key]: !p[key] }));
  }

  return (
    <div id="featured-chart" className="bg-surface rounded-xl border border-border p-6">
      <div className="flex flex-wrap items-start gap-3 mb-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-semibold text-text-primary text-base">{config.title}</h2>
            <Tooltip content={config.tooltip} side="right">
              <Info size={13} className="text-text-secondary cursor-help shrink-0" />
            </Tooltip>
          </div>
          <Badge variant="default">{config.source}</Badge>
        </div>

        <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
          {CHART_TYPES.map((ct) => (
            <button
              key={ct.id}
              onClick={() => setChartType(ct.id)}
              className={cn(
                'p-1.5 rounded-md transition-all',
                chartType === ct.id ? 'bg-surface shadow-sm text-primary' : 'text-text-secondary hover:text-text-primary'
              )}
              title={ct.label}
            >
              <ct.icon size={15} />
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={340}>
        {renderChart(config, chartType, hiddenSeries)}
      </ResponsiveContainer>

      {config.series && config.series.length > 1 && (
        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-border">
          {config.series.map((s) => (
            <button
              key={s.key}
              onClick={() => toggleSeries(s.key)}
              className={cn('flex items-center gap-1.5 text-xs transition-opacity', hiddenSeries[s.key] && 'opacity-40')}
            >
              <span className="w-3 h-0.5 rounded-full inline-block" style={{ backgroundColor: s.color }} />
              <span className="text-text-secondary">{s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function renderChart(config, chartType, hiddenSeries) {
  const { data, series, xKey, referenceLines, yFormatter } = config;
  const defaultSeries = series?.[0] || {};
  const visibleSeries = series?.filter((s) => !hiddenSeries[s.key]) || [];

  const commonProps = {
    data,
    margin: { top: 8, right: 8, left: 0, bottom: 0 },
  };

  const axisProps = {
    xAxis: (
      <XAxis
        dataKey={xKey}
        tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#6B7280' }}
        tickLine={false}
        axisLine={false}
        interval="preserveStartEnd"
      />
    ),
    yAxis: (
      <YAxis
        tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#6B7280' }}
        tickLine={false}
        axisLine={false}
        tickFormatter={yFormatter || formatCompact}
        width={60}
      />
    ),
    grid: <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E3" vertical={false} />,
    tooltip: (
      <RechartsTooltip
        contentStyle={{
          borderRadius: '8px',
          border: '1px solid #E8E8E3',
          fontFamily: 'JetBrains Mono',
          fontSize: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}
        formatter={(value, name) => [yFormatter ? yFormatter(value) : formatCompact(value), name]}
      />
    ),
    refs: referenceLines?.map((ref) => (
      <ReferenceLine
        key={ref.y}
        y={ref.y}
        stroke={ref.color || '#F5A623'}
        strokeDasharray="4 3"
        label={{ value: ref.label, fontSize: 10, fill: ref.color || '#F5A623', fontFamily: 'JetBrains Mono' }}
      />
    )),
  };

  if (chartType === 'bar') {
    return (
      <BarChart {...commonProps}>
        {axisProps.grid}{axisProps.xAxis}{axisProps.yAxis}{axisProps.tooltip}
        {axisProps.refs}
        {visibleSeries.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[3, 3, 0, 0]} maxBarSize={40} />
        ))}
      </BarChart>
    );
  }

  if (chartType === 'area') {
    return (
      <AreaChart {...commonProps}>
        {axisProps.grid}{axisProps.xAxis}{axisProps.yAxis}{axisProps.tooltip}
        {axisProps.refs}
        {visibleSeries.map((s) => (
          <Area key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} fill={s.color} fillOpacity={0.08} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        ))}
      </AreaChart>
    );
  }

  return (
    <LineChart {...commonProps}>
      {axisProps.grid}{axisProps.xAxis}{axisProps.yAxis}{axisProps.tooltip}
      {axisProps.refs}
      {visibleSeries.map((s) => (
        <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
      ))}
    </LineChart>
  );
}

function getConfig(activeDataset, { bmkgData, worldBankData, diseaseData, filters }) {
  if (activeDataset === 'bmkg') {
    return {
      title: 'Magnitudo Gempa (15 Kejadian Terakhir)',
      source: 'BMKG · gempaterkini.json',
      tooltip: 'Endpoint: data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json',
      xKey: 'label',
      data: bmkgData?.chartData || [],
      series: [{ key: 'magnitude', label: 'Magnitudo', color: COLORS.primary }],
      referenceLines: [{ y: 5.0, label: 'M5.0 — Signifikan', color: COLORS.danger }],
      yFormatter: (v) => `M${v}`,
    };
  }

  if (activeDataset === 'worldbank') {
    const indicator = WB_INDICATORS[filters.indicator] || WB_INDICATORS.gdp;
    const rawData = worldBankData?.joined || [];
    const data = rawData
      .filter((r) => r[indicator.key] != null)
      .map((r) => ({ year: r.year, [indicator.key]: r[indicator.key] }));
    return {
      title: `${indicator.label} — Indonesia`,
      source: 'World Bank · Open Data API',
      tooltip: `Endpoint: api.worldbank.org/v2/country/IDN/indicator/...`,
      xKey: 'year',
      data,
      series: [{ key: indicator.key, label: indicator.label, color: indicator.color }],
      referenceLines: [],
      yFormatter: indicator.format,
    };
  }

  if (activeDataset === 'disease') {
    return {
      title: 'Kasus COVID-19 Harian — Indonesia',
      source: 'disease.sh · historical/Indonesia',
      tooltip: 'Endpoint: disease.sh/v3/covid-19/historical/Indonesia?lastdays=all',
      xKey: 'date',
      data: diseaseData?.chartData || [],
      series: [
        { key: 'Kasus Baru', label: 'Kasus Baru', color: COLORS.accent },
        { key: 'Sembuh Baru', label: 'Sembuh Baru', color: COLORS.success },
        { key: 'Meninggal Baru', label: 'Meninggal Baru', color: COLORS.danger },
      ],
      referenceLines: [],
      yFormatter: formatCompact,
    };
  }

  return { data: [], series: [], xKey: 'x' };
}
