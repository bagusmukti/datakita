import { Info } from 'lucide-react';
import { useDataset } from '../../hooks/useDataset';
import { StatCallout } from '../ui/StatCallout';
import { Tooltip } from '../ui/Tooltip';
import { formatNumber, formatCompact, formatPercent, formatDateTime } from '../../lib/utils';

export function HeroHeader({ bmkgData, worldBankData, diseaseData }) {
  const { activeDataset, currentDataset } = useDataset();

  const stats = getStats(activeDataset, { bmkgData, worldBankData, diseaseData });

  return (
    <div className="relative bg-surface border-b border-border overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 0h1v40H0zM39 0h1v40h-1zM0 0h40v1H0zM0 39h40v1H0z' fill='%231E2761'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row lg:items-start gap-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-accent">
                Dataset Aktif
              </span>
              <Tooltip content={`Sumber: ${currentDataset.source} — ${currentDataset.sourceUrl}`}>
                <Info size={12} className="text-text-secondary cursor-help" />
              </Tooltip>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight leading-tight mb-2">
              {currentDataset.fullName}
            </h1>
            <p className="text-sm text-text-secondary">
              Sumber:{' '}
              <a href={currentDataset.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-medium">
                {currentDataset.source}
              </a>
              {' · '}{activeDataset === 'bmkg' ? 'gempa realtime · cuaca per 3 jam' : 'diperbarui secara berkala'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-3 lg:w-[480px] shrink-0">
            {stats.map((stat, i) => (
              <StatCallout
                key={i}
                label={stat.label}
                value={stat.value}
                sub={stat.sub}
                icon={stat.icon}
                accent={i === 0}
                loading={stat.loading}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getStats(activeDataset, { bmkgData, worldBankData, diseaseData }) {
  if (activeDataset === 'bmkg') {
    const loading = bmkgData?.isLoading;
    const latest = bmkgData?.latest;
    const combined = bmkgData?.combined || [];
    const significant = combined.filter((e) => e.magnitude >= 5.0);
    return [
      {
        label: 'Gempa Terkini',
        value: latest ? `M${latest.magnitude}` : '—',
        sub: latest ? latest.wilayah?.split(' ').slice(-3).join(' ') : '',
        loading,
      },
      {
        label: 'Gempa M5.0+',
        value: significant.length || '—',
        sub: `dari ${combined.length} data terakhir`,
        loading,
      },
      {
        label: 'Pembaruan',
        value: latest ? latest.jam?.split(' ')[0] : '—',
        sub: latest ? latest.tanggal : '',
        loading,
      },
    ];
  }

  if (activeDataset === 'worldbank') {
    const loading = worldBankData?.isLoading;
    const latest = worldBankData?.latest || {};
    return [
      {
        label: `GDP ${latest.year || ''}`,
        value: latest.gdp ? formatCompact(latest.gdp) : '—',
        sub: 'USD (current)',
        loading,
      },
      {
        label: `Inflasi ${latest.year || ''}`,
        value: latest.inflation != null ? formatPercent(latest.inflation) : '—',
        sub: 'Harga konsumen',
        loading,
      },
      {
        label: `Populasi ${latest.year || ''}`,
        value: latest.population ? formatCompact(latest.population) : '—',
        sub: 'Jiwa',
        loading,
      },
    ];
  }

  if (activeDataset === 'disease') {
    const loading = diseaseData?.isLoading;
    const current = diseaseData?.current || {};
    return [
      {
        label: 'Total Kasus',
        value: current.cases ? formatCompact(current.cases) : '—',
        sub: current.casesPerOneMillion ? `${formatNumber(current.casesPerOneMillion)} per juta` : '',
        loading,
      },
      {
        label: 'Total Sembuh',
        value: current.recovered ? formatCompact(current.recovered) : '—',
        sub: current.cases ? `${formatPercent((current.recovered / current.cases) * 100, 1)} dari total` : '',
        loading,
      },
      {
        label: 'Total Meninggal',
        value: current.deaths ? formatCompact(current.deaths) : '—',
        sub: current.cases ? `CFR ${formatPercent((current.deaths / current.cases) * 100, 2)}` : '',
        loading,
      },
    ];
  }

  return [];
}
